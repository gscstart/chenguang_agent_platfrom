import json
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.infra.database import get_db
from src.core.base_schema import ResponseSchema, PageResult
from src.core.deps import PageParams
from src.modules.model.schema import ModelCreate, ModelUpdate, ModelRead, ModelChatRequest
from src.modules.model.service import ModelService

router = APIRouter(prefix="/models", tags=["模型管理"])


def get_model_service(db: AsyncSession = Depends(get_db)) -> ModelService:
    return ModelService(db)


@router.post("", response_model=ResponseSchema[ModelRead], summary="添加模型")
async def create_model(
    data: ModelCreate,
    svc: ModelService = Depends(get_model_service),
):
    result = await svc.create_model(data)
    return ResponseSchema(data=result)


@router.get("", response_model=ResponseSchema[PageResult[ModelRead]], summary="模型列表")
async def list_models(
    params: PageParams = Depends(),
    provider_id: int | None = Query(None, description="按供应商筛选"),
    svc: ModelService = Depends(get_model_service),
):
    page_result = await svc.list_models(params, provider_id)
    return ResponseSchema(data=page_result)


@router.get("/{model_id}", response_model=ResponseSchema[ModelRead], summary="模型详情")
async def get_model(
    model_id: int,
    svc: ModelService = Depends(get_model_service),
):
    result = await svc.get_model(model_id)
    return ResponseSchema(data=result)


@router.put("/{model_id}", response_model=ResponseSchema[ModelRead], summary="更新模型")
async def update_model(
    model_id: int,
    data: ModelUpdate,
    svc: ModelService = Depends(get_model_service),
):
    result = await svc.update_model(model_id, data)
    return ResponseSchema(data=result)


@router.delete("/{model_id}", response_model=ResponseSchema, summary="删除模型")
async def delete_model(
    model_id: int,
    svc: ModelService = Depends(get_model_service),
):
    await svc.delete_model(model_id)
    return ResponseSchema(message="删除成功")


@router.post("/chat", summary="模型对话（流式）")
async def model_chat(
    request: ModelChatRequest,
    svc: ModelService = Depends(get_model_service),
):
    # 获取模型名称、异步客户端和 API 类型
    model_name, client, api_type = await svc.get_model_for_chat(request.model_id)

    # 获取或创建会话
    conversation_id, _ = svc.get_or_create_conversation(request.conversation_id)

    # 添加用户消息
    svc.add_user_message(conversation_id, request.message)

    # 检查是否需要压缩
    if svc.should_compress(conversation_id):
        await svc.summarize_messages(conversation_id, client, model_name)

    # 获取当前消息列表
    messages = svc.get_messages(conversation_id)

    # 非流式回退
    if not request.stream:
        if api_type == "responses":
            response = await client.responses.create(
                model=model_name,
                input=messages,
            )
            content = response.output_text
        else:
            response = await client.chat.completions.create(
                model=model_name,
                messages=messages,
            )
            content = response.choices[0].message.content

        # 保存助手回复
        svc.add_assistant_message(conversation_id, content)
        return ResponseSchema(data={
            "conversation_id": conversation_id,
            "content": content,
        })

    # 流式生成器 - Responses API
    async def generate_stream_responses():
        content_data = ""
        try:
            stream = await client.responses.create(
                model=model_name,
                input=messages,
                stream=True,
            )
            # 先发送 conversation_id
            yield f"data: {json.dumps({'conversation_id': conversation_id})}\n\n"

            async for event in stream:
                if event.type == "response.output_text.delta":
                    content_data += event.delta or ""
                    yield f"data: {json.dumps({'delta': event.delta})}\n\n"
                elif event.type == "response.completed":
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    break
            yield "event: close\ndata: close\n\n"

            # 保存助手回复
            svc.add_assistant_message(conversation_id, content_data)

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    # 流式生成器 - Chat Completions API
    async def generate_stream_chat():
        content_data = ""
        reasoning_data = ""
        try:
            stream = await client.chat.completions.create(
                model=model_name,
                messages=messages,
                stream=True,
            )
            # 先发送 conversation_id
            yield f"data: {json.dumps({'conversation_id': conversation_id})}\n\n"

            async for chunk in stream:
                delta = chunk.choices[0].delta

                # 处理思考过程
                if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
                    reasoning_data += delta.reasoning_content
                    print(f"[REASONING] {delta.reasoning_content}")
                    yield f"data: {json.dumps({'reasoning': delta.reasoning_content})}\n\n"

                # 处理正式内容
                if delta.content:
                    content_data += delta.content
                    print(f"[CONTENT] {delta.content}")
                    yield f"data: {json.dumps({'delta': delta.content})}\n\n"

                if chunk.choices[0].finish_reason == "stop":
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    break

            yield "event: close\ndata: close\n\n"

            # 打印最终结果
            print(f"[FINAL] reasoning: {reasoning_data[:100]}...")
            print(f"[FINAL] content: {content_data[:100]}...")

            # 保存助手回复
            svc.add_assistant_message(conversation_id, content_data)

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    # 根据 api_type 选择流式生成器
    if api_type == "responses":
        return StreamingResponse(generate_stream_responses(), media_type="text/event-stream")
    else:
        return StreamingResponse(generate_stream_chat(), media_type="text/event-stream")
