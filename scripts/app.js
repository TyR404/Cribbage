function Deck() {
  this.cards = [];
  this.init();
}

Deck.prototype.init = function () {
  const suitNames = ["H", "D", "S", "C"];
  for (let suit = 0; suit <= 3; suit++) {
    for (let rank = 0; rank <= 12; rank++) {
      this.cards.push(new Card(suitNames[suit], rank + 1));
    }
  }
};

Deck.prototype.count = function () {
  return this.cards.length;
};

Deck.prototype.shuffle = function () {
  let currentIndex = this.cards.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [this.cards[currentIndex], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[currentIndex]];
  }
};

Deck.prototype.draw = function (n) {
  // gotta love splice when the deck is empty :P
  let drawnCards = this.cards.splice(0, n);
  return drawnCards;
};

Deck.prototype.compare = function (card1, card2) {
  // returns biggest card, if equal, returns 0
  if (card1.valueOf() === card2.valueOf()) {
    return 0;
  }
  return card1.valueOf() > card2.valueOf() ? card1 : card2;
};

function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
  this.faceCard = this.rank > 10 ? true : false;
  this.isPegged = false;
}

Card.prototype.toString = function () {
  const cardNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
  return `${cardNames[this.rank - 1]} of ${this.suit}`;
};

Card.prototype.valueOf = function () {
  return this.rank;
};

function CribbageBoard() {
  this.players = [];
  this.deck = new Deck();
  this.crib = [];
  // whose turn it is
  this.currentPlayer = 0;
}
CribbageBoard.prototype.addCrib = function () {
  // get player who has crib
  // run player.scoreHand(this.crib)
  // basically, reuse the lovely scorehand function on the player
};
CribbageBoard.prototype.pegging = function () {
  // alternate through players until both decks are empty
  //    check for if the current pegging round total equals 15
  //    check for doubles
  //    check for runs
  //    check if current pegging round is 31 or no cards can be put down
  //    add the score for that turn to total player score
};
CribbageBoard.prototype.scorePlayers = function () {
  // loop though players
  // run the check score function
};
// will run the game
CribbageBoard.prototype.play = function () {
  // run add players
  // loop through players
  //    change who has crib
  //    distribute hand
  //    force players to only have 4 cards in hand, move rest to crib
  // get random card/cut the deck using who has the crib
  // give two points if cut card is a jack
  // run the pegging function
  // update score/check for win
  // scoring hands
  // score the crib
  // update score AGAIN/check for win
};

CribbageBoard.prototype.addPlayers() = function () {
  // loop twice?
  // prompt for player name
  // maybe ask for who is getting first crib? If not, then just set it to the first inputted player\
  // generate new player
}

function Player(name) {
  this.name = name;
  this.hand = [];
  this.hasCrib = false;
  this.score = 0;
  this.isTurn = true;
}
// have hand so we can add the crib using the same function?
Player.prototype.scoreHand = function (hand) {
  // This and the pegging function will be pain
  // check for 15s (How? idk)
  // check for runs (How? probably a sort function)
  // check for doubles/pairs (Sort function again?)
  // check for same suit (array.every())
  // check for jacks with the same suit as the cut card
};
Player.prototype.getCurrentScore = function () {
  // return this.score
};
