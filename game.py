"""猜數字遊戲（Guessing Game）

一個互動式的命令行猜數字遊戲，玩家需要猜出 1 到 100 之間的隨機整數。
"""

import random


def generate_answer() -> int:
    """生成隨機答案。

    Returns:
        1 到 100 之間的隨機整數。
    """
    return random.randint(1, 100)


def get_player_input() -> int:
    """獲取並驗證玩家輸入。

    持續提示玩家輸入，直到收到有效的整數（1-100 範圍內）。

    Returns:
        有效的整數猜測。
    """
    while True:
        try:
            guess = int(input("請輸入你的猜測（1-100）："))
            if 1 <= guess <= 100:
                return guess
            else:
                print("請輸入 1 到 100 之間的數字！")
        except ValueError:
            print("無效輸入，請輸入一個整數！")


def check_guess(guess: int, answer: int) -> str:
    """比較玩家猜測與答案。

    Args:
        guess: 玩家的猜測數字。
        answer: 正確答案。

    Returns:
        "correct" 表示猜測正確，"too_high" 表示猜測過大，"too_low" 表示猜測過小。
    """
    if guess == answer:
        return "correct"
    elif guess > answer:
        return "too_high"
    else:
        return "too_low"


def display_hint(result: str) -> None:
    """根據結果顯示提示訊息。

    Args:
        result: check_guess() 的返回值。
    """
    if result == "too_high":
        print("太大了，請試試更小的數字")
    elif result == "too_low":
        print("太小了，請試試更大的數字")
    elif result == "correct":
        print("恭喜通過！")


def play_game() -> None:
    """控制遊戲主循環。

    生成隨機答案並讓玩家持續猜測，直到猜對為止。
    """
    answer = generate_answer()
    count = 0

    print("\n遊戲開始！我已經想好了一個 1 到 100 之間的數字。")

    while True:
        guess = get_player_input()
        count += 1
        result = check_guess(guess, answer)
        display_hint(result)

        if result == "correct":
            print(f"你用了 {count} 次猜測才找到答案！")
            break
        else:
            print(f"這是你的第 {count} 次猜測")


def main() -> None:
    """程式入口點，控制遊戲流程。

    支持多輪遊戲，每輪結束後詢問玩家是否繼續。
    """
    print("歡迎來到猜數字遊戲！")

    while True:
        play_game()

        while True:
            again = input("\n是否要再玩一次？（是/否）：").strip()
            if again in ("是", "y", "Y", "yes", "Yes"):
                break
            elif again in ("否", "n", "N", "no", "No"):
                print("感謝遊玩，再見！")
                return
            else:
                print("請輸入「是」或「否」。")


if __name__ == "__main__":
    main()
