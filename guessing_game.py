import random
import json

class GuessingGame:
    def __init__(self):
        self.number_to_guess = random.randint(1, 100)
        self.guess_count = 0
        self.stats_file = 'game_stats.json'

    def play(self):
        while True:
            try:
                guess = int(input('Guess a number between 1 and 100: '))
            except ValueError:
                print('Invalid input. Please enter an integer. Try again.')
                continue
            self.guess_count += 1

            if guess < self.number_to_guess:
                print('Too low!')
            elif guess > self.number_to_guess:
                print('Too high!')
            else:
                print(f'Congratulations! You guessed the number in {self.guess_count} tries.')
                self.save_stats()
                break

    def save_stats(self):
        try:
            with open(self.stats_file, 'r') as f:
                stats = json.load(f)
        except FileNotFoundError:
            stats = {'wins': 0, 'losses': 0}

        stats['wins'] += 1

        with open(self.stats_file, 'w') as f:
            json.dump(stats, f)

if __name__ == '__main__':
    game = GuessingGame()
    game.play()