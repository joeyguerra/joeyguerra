import random

def baccarat_result():
   """Simulates a single round of Baccarat and returns the result: 'Player', 'Banker', or 'Tie'"""
   outcomes = ['Player', 'Banker', 'Tie']
   return random.choices(outcomes, weights=[45.86, 44.62, 9.52], k=1)[0]

def simulate_baccarat(strategy, rounds, bankroll):
   """Simulates a Baccarat game using a given strategy over a specified number of rounds"""
   results = []
   bets = []
   balance = bankroll

   for i in range(rounds):
       result = baccarat_result()
       results.append(result)

       if i == 0:
           bet = 'Banker'  # Initial bet is Banker
       else:
           last_result = results[-2]  # Previous round result
           bet = 'Player' if last_result == 'Banker' else 'Banker'

       bets.append(bet)

       if bet == result:
           if result == 'Banker':
               balance += 0.95 * 1  # Banker wins, 5% commission
           else:
               balance += 1  # Player wins
       elif result != 'Tie':
           balance -= 1  # Lose

       # Print progress every 100,000 rounds
       if (i + 1) % 100000 == 0:
           print(f"Round {i + 1}: Result={result}, Bet={bet}, Balance={balance:.2f}")

   return results, bets, balance

def main():
   strategy = "opposite"  # This could be expanded for other strategies
   rounds = 1000000  # Number of rounds to simulate
   initial_bankroll = 10000  # Initial bankroll
   results, bets, final_balance = simulate_baccarat(strategy, rounds, initial_bankroll)

   print("\nSimulation complete.")
   print(f"Final balance: {final_balance:.2f}")
   # Optionally print the last few results and bets for verification
   print(f"Last 10 Results: {results[-10:]}")
   print(f"Last 10 Bets: {bets[-10:]}")

if __name__ == "__main__":
   main()