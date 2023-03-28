const initialCut = "initialCut";
const cardSelectionPhase = "cardSelection";
const midTurnCut = "midTurnCut";
const peggingPhase = "pegging";

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
  this.phase = "";
  this.cut = ["BACK"];
}

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

CribbageBoard.prototype.dealCards = function (n) {
  for (let i = 0; i < 2; i++) {
    this.deck.shuffle();
    let cut = this.deck.draw(n);
    for (let j = 0; j < n; j++) {
      this.players[i].hand.push(cut[j]);
    }
  }
};

CribbageBoard.prototype.findCard = function (player, suit, rank) {
  let foundCard;
  for (let i of this.players[player].hand) {
    if (i.suit === suit && i.rank === rank) {
      foundCard = i;
      return foundCard;
    }
  }
};

CribbageBoard.prototype.findCribPlayer = function () {
  let foundPlayer;
  for (let i of this.players) {
    if (i.isCrib) {
      foundPlayer = i;
      return foundPlayer;
    }
  }
};

CribbageBoard.prototype.initialCut = function () {
  let player1 = this.players[0];
  let player2 = this.players[1];

  let player1hand = player1.hand;
  let player2hand = player2.hand;

  this.dealCards(1);

  if (player1hand[0].rank < player2hand[0].rank) {
    player1.isCrib = true;
    this.currentPlayer = 0;
  } else {
    player2.isCrib = true;
    this.currentPlayer = 1;
  }

  setTimeout(() => {
    this.phase = cardSelectionPhase;
    render(this);
  }, 4000);
};

CribbageBoard.prototype.cardSelectionPhase = function () {
  this.emptyHand();
  this.dealCards(6);
};

CribbageBoard.prototype.addToCrib = function (event) {
  if (board.phase != cardSelectionPhase) {
    return;
  }
  if (event.target.classList[0] != "card") {
    return;
  }
  let player = 0;
  if (this.id === "hand2") {
    player++;
  }
  if (board.players[player].hand.length === 4) {
    return;
  }
  let suit = event.target.classList[1];
  let rank = event.target.classList[2];
  let card = board.findCard(player, suit, parseInt(rank));
  let index = board.players[player].hand.indexOf(card);
  let add = board.players[player].hand.splice(index, 1);
  let playerCrib = board.findCribPlayer().crib;
  playerCrib.push(add[0]);
  renderUI(board);
  if (board.findCribPlayer().crib.length === 4) {
    board.phase = midTurnCut;
    render(board);
  }
};

CribbageBoard.prototype.midTurnCut = function () {
  this.deck.shuffle();
  let midTurnCutCard = this.deck.draw(1);
  this.cut = [];
  this.cut.push(midTurnCutCard[0].toCardCode());
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

function reset(board) {
  board.phaseNum = 0;
  board.emptyHand();
  board.phase = initialCut;
  render(board);
}

function render(board) {
  console.log(board.phase);

  if (board.phase === initialCut) {
    board.initialCut();
    renderUI(board);
  }
  if (board.phase === cardSelectionPhase) {
    board.cardSelectionPhase();
    renderUI(board);
  }
  if (board.phase === midTurnCut) {
    board.midTurnCut();
    setTimeout(() => {
      renderUI(board);
    }, 1500);
  }
}

function renderUI(board) {
  const cribbageBoardUI = document.querySelector(".cribbage-board");
  // iterates through each player
  for (let i = 0; i < board.players.length; i++) {
    const currentPlayer = board.players[i];
    const currentPlayerUI = document.querySelector(`.player${i + 1}-details`);
    // HANDLES EACH PLAYERS NAME AND SCORE
    currentPlayerUI.querySelector(".player-name").textContent =
      currentPlayer.name;
    currentPlayerUI.querySelector(".player-score").textContent =
      currentPlayer.score;

    // CHANGES THE POINTS ON THE VISUAL BOARD
    const currentRowUI = cribbageBoardUI.querySelectorAll("tr")[i];
    const currentRowElementsUI = [...currentRowUI.querySelectorAll("td")];
    // for every score the player has, adds colored background
    for (let i = 0; i < currentPlayer.score + 2; i++) {
      currentRowElementsUI[i].classList.add("scored");
    }
    // adds pin at the last score
    currentRowElementsUI[currentPlayer.score + 1].insertAdjacentHTML(
      "beforeend",
      `<i class="fa-sharp fa-solid fa-map-pin"></i>`
    );

    // REMOVE LAST PEG IF THERE ARE MORE THAN TWO PEGS
    const allPegs = [...currentRowUI.querySelectorAll("i")];
    allPegs.length <= 2 ? allPegs : allPegs[0].remove();

    // HANDLES EACH PLAYERS HANDS
    const currentPlayerHandUI = currentPlayerUI.querySelector(`.player-hand`);
    // clears old cards
    currentPlayerHandUI.innerHTML = "";
    // inserts each card into the HTML
    currentPlayer.hand.forEach((card) => {
      currentPlayerHandUI.insertAdjacentHTML(
        "beforeend",
        `<img src="Pictures/card_${card.toCardCode()}.png" alt="" class="card ${
          card.suit
        } ${card.rank}" />`
      );
    });
  }
  // DEALS WITH CRIB
  const cribUI = document.querySelector(".crib");
  const currentCribOwner = board.players.find(
    (player) => player.isCrib === true
  );
  // changes crib owner
  cribUI.querySelector(
    ".crib-owner"
  ).textContent = `It is ${currentCribOwner.name}'s Crib`;

  const cribHandUI = cribUI.querySelector(".crib-hand");
  // clears old cards
  cribHandUI.innerHTML = "";
  // adds new crib cards
  currentCribOwner.crib.forEach((card) => {
    cribHandUI.insertAdjacentHTML(
      "beforeend",
      `<img src="Pictures/card_${card.toCardCode()}.png" alt="" class="card" />`
    );
  });
  document.querySelector(
    ".cut-card"
  ).children[0].src = `Pictures/card_${board.cut[0]}.png`;
}

const board = new CribbageBoard();

reset(board);

document.querySelector("#hand1").addEventListener("click", board.addToCrib);
document.querySelector("#hand2").addEventListener("click", board.addToCrib);
