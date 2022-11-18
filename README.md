# metaTTT_App

**NOTE**: The newer React-based version currently published on the beta program on Google Play is closed-source for now.

Cordova HTML5 ES6 metaTTT App

Download at <https://play.google.com/store/apps/details?id=interpause.metaTTT>.

Or try the browser version at <https://metattt.interpause.dev>.

Back when I developed this, I was more familiar with pure HTML and JS approaches. Hence, while the code isn't too messy, it is archaic in that it has multiple scripts/entry points designed to be placed in a HTML page and is hence reliant on those scripts being run globally. As such, even if I were to upgrade to JSDoc annotations now, it would not be easy to auto-generate documentation. And while the way I organized the code means it is not too difficult to switch to modules, it is pointless as I do plan to rewrite the code from scratch using React sooner or later.

As monorepo was not really a thing back then:

- <https://github.com/Interpause/metaTTT_Server> for the server code
  - [Websocket API](https://github.com/Interpause/metaTTT_Server/blob/master/API.md)
- <https://github.com/Interpause/metaTTT_Common> common utils, classes and "enums"
  - [Documentation](https://interpause.github.io/metaTTT_Common/)

## Description

(Taken straight from my app page, sorry it is cringe)

If the flashy triangle background or happy (unintendedly slightly dystopian) music is not enough to convince you:
It is Meta TicTacToe, only the most addictive mentally testing game ever!

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
