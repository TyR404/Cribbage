const peggingPhase = "pegging";
const cardSelectionPhase = "cardSelection";
const initialCut = "initialCut";
const midTurnCut = "midTurnCut";
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
    [this.cards[currentIndex], this.cards[randomIndex]] = [
      this.cards[randomIndex],
      this.cards[currentIndex],
    ];
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
}

Card.prototype.toCardCode = function () {
  const cardNames = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  return `${cardNames[this.rank - 1]}${this.suit}`;
};

Card.prototype.valueOf = function () {
  return this.rank;
};

function CribbageBoard() {
  this.players = [new Player("player1"), new Player("player2")];
  this.deck = new Deck();
  // whose turn it is
  this.currentPlayer = 0;
  this.phase = initialCut;
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

CribbageBoard.prototype.emptyHand = function () {
  let player1 = this.players[0];
  let player2 = this.players[1];

  let player1hand = player1.hand;
  let player2hand = player2.hand;

  for (let i = 0; i < player1hand.length; i++) {
    let cardToPutBack = player1hand.pop();
    this.deck.cards.push(cardToPutBack);
  }

  for (let i = 0; i < player2hand.length; i++) {
    let cardToPutBack = player2hand.pop();
    this.deck.cards.push(cardToPutBack);
  }
};

CribbageBoard.prototype.initialCut = function () {
  let player1 = this.players[0];
  let player2 = this.players[1];

  let player1hand = player1.hand;
  let player2hand = player2.hand;

  while (player1hand[0] === player2hand[0]) {
    for (let i = 0; i < 2; i++) {
      this.deck.shuffle();
      let cut = this.deck.draw(1);
      this.players[this.currentPlayer].hand.push(cut[0]);
      this.currentPlayer++;
    }
  }

  if (player1hand < player2hand) {
    player1.isCrib = true;
    this.currentPlayer = 0;
  } else {
    player2.isCrib = true;
    this.currentPlayer = 1;
  }
  this.phase = cardSelectionPhase;
};

function Player(name) {
  this.name = name;
  this.hand = [];
  this.crib = [];
  this.score = 0;
  this.isCrib = false;
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

function render(board) {}
const board = new CribbageBoard();
board.initialCut();
