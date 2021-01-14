# metaTTT_App

Cordova HTML5 ES6 metaTTT App

Download at <https://play.google.com/store/apps/details?id=interpause.metaTTT>.

The code here is organized in its own way, but it is kind of old and reliant on scripts implicitly being run in the global context, rather than being written as modules. As such, even if I were to take the effort to add in JSDoc annotations now, it would not be simple to auto-generate documentation. Therefore, I decided I shall not be including documentation, though my (eventual) rewrite using React or React Native probably will.

As monorepo was not really a thing back then:

- <https://github.com/Interpause/metaTTT_Server> for the server code (I will document my socket API at least, though I definitely will be rewriting it)
- <https://github.com/Interpause/metaTTT_Common> common utils and "enums"

## Description

If the flashy triangle background or happy (unintendedly slightly dystopian) music is not enough to convince you:
It is Meta TicTacToe, only the most addictive mentally testing game ever!

Now with:
• Intuitive colors cause knot and crosses hurt my eyes...!

• Online mode so you will never have to play alone!
• (well there are online bots to battle so you might be alone)
• (^And spectating too)
• (^Oh and SIMULTANEOUS GAMES online)

• MORE CONTROL over the game than any other will allow you!

• PERFORMANCE MODE! (oh wait this isn't a feature just enable it if you're lagging)

• NO TUTorial!... (sorry about that will be done soon)


So what are you waiting for? Download it, somehow crash my free-tier rental server, and help me bug test! Yay!

Rules (can also be found in credits screen):

1. There are 9 boards in a 3x3 grid. The goal is to win 3 boards in a line.
2. The player is limited to a board determined by the previous turn.
3. The position of the placed piece corresponds to the location of the board used next.
4. The first player chooses the starting board.
5. If the placed piece corresponds with a finished board, the next player is allowed to choose any board next.

## Pictures

![alt text 1](https://play-lh.googleusercontent.com/1CkU1BAa4XT7w3nUZTKv7enCGwB68MWRfd_GWthX9sFQ2NR5Ax7vWXknFz9j7HeHtCM=w1440-h620-rw)
![alt text 2](https://play-lh.googleusercontent.com/iAjEX1YhRmceL5rjp2dNOvaZJ9FSwBRuJRM08qpo5u4LoDfxzBiY4RT4-K7VXH3qusE=w1440-h620-rw)
![alt text 3](https://play-lh.googleusercontent.com/opTzvjAjl-KCA2BoWT_0Tr-qfEN5G6O5huZNhVBHmbCRy6rMZprNeeFxJiwlx4npIu8=w1440-h620-rw)
![alt text 4](https://play-lh.googleusercontent.com/tirh6zjjaLj_SlB6mUUUQ98B0hVjxi2o1Qxfhe_crmyPJ3prAHVR5IQs2S0V-rzgkg=w1440-h620-rw)
