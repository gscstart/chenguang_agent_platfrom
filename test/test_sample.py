# 文件 test_sample.py
def add(x, y):
    return x + y

# test_开头的是测试函数，用于测试 add 函数


def test_add():
    # assert: 断言，用于验证代码的正确性, True 表示通过，False 表示失败
    assert add(2, 3) == 5


def test_add_fail():
    assert add(2, 2) == 5  # 故意写错的断言，用来演示失败的测试
