function Deck() {
  this.cards = [];
  this.init();
}

Deck.prototype.init = function () {
  const suitNames = ["Hearts", "Diamonds", "Spades", "Clubs"];
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
}

Card.prototype.toString = function () {
  const cardNames = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
  return `${cardNames[this.rank - 1]} of ${this.suit}`;
};

Card.prototype.valueOf = function () {
  return this.rank;
};
