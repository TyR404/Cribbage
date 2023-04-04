const start = "start";
const initialCut = "initialCut";
const cardSelectionPhase = "cardSelection";
const midTurnCut = "midTurnCut";
const peggingPhase = "pegging";
const countingHandScore = "counting";
const countingCribScore = "CribScore";

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
  if (this.suit === "BACK") {
    return "BACK";
  }
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
let back = new Card("BACK", "BACK");

function CribbageBoard() {
  this.players = [new Player("player1"), new Player("player2")];
  this.deck = new Deck();
  // whose turn it is
  this.turn = 0;
  this.phase = "";
  this.cut = [back];
  this.pile1 = [back];
  this.pile1Card = 0;
  this.pile2 = [back];
  this.pile2Card = 0;
  this.peggingScore = 0;
  this.currentPeggingHand = [];
}
CribbageBoard.prototype.emptyHand = function () {
  for (let player of this.players) {
    let playerHand = player.hand;
    for (let i = playerHand.length; i > 0; i--) {
      let cardToPutBack = playerHand.pop();
      this.deck.cards.push(cardToPutBack);
    }
  }

  for (let player of this.players) {
    let playerCrib = player.crib;
    for (let i = playerCrib.length; i > 0; i--) {
      let cardToPutBack = playerCrib.pop();
      this.deck.cards.push(cardToPutBack);
    }
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

  while (player1.isCrib === player2.isCrib) {
    this.dealCards(1);
    if (player1hand[0].rank < player2hand[0].rank) {
      player1.isCrib = true;
      this.turn = 1;
    } else {
      player2.isCrib = true;
    }

    if (player1.isCrib === player2.isCrib) {
      this.emptyHand();
    }
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
  if (this.phase != cardSelectionPhase) {
    return;
  }
  if (event.target.classList[0] != "card") {
    return;
  }
  let player = 0;
  if (event.target.parentElement.id === "hand2") {
    player++;
  }
  if (this.players[player].hand.length === 4) {
    return;
  }
  let suit = event.target.classList[1];
  let rank = event.target.classList[2];
  let card = this.findCard(player, suit, parseInt(rank));
  let indexOfCard = this.players[player].hand.indexOf(card);
  let cardToAdd = this.players[player].hand.splice(indexOfCard, 1)[0];
  let playerCrib = this.findCribPlayer().crib;
  playerCrib.push(cardToAdd);
  renderUI(board);
  if (playerCrib.length === 4) {
    this.phase = midTurnCut;
    render(this);
  }
};

CribbageBoard.prototype.midTurnCut = function () {
  this.deck.shuffle();
  let midTurnCutCard = this.deck.draw(1);
  this.cut = [];
  this.cut.push(midTurnCutCard[0]);
};

CribbageBoard.prototype.pegging = function (event) {
  let board = this;
  if (board.phase != peggingPhase) {
    return;
  }
  console.log(`player${board.turn + 1}'s Turn`);

  if (event.target.parentElement.id === `hand${board.turn + 1}`) {
    let suit = event.target.classList[1];
    let rank = event.target.classList[2];
    let card = board.findCard(board.turn, suit, parseInt(rank));
    let points = card.faceCard ? 10 : card.rank;

    // checks if the smallest card in the current players hand is too big to be added
    if (points > 31 - board.peggingScore) {
      console.log(`Card too high, choose another`);
    } else {
      let index = board.players[board.turn].hand.indexOf(card);
      let CardToAdd = board.players[board.turn].hand.splice(index, 1)[0];

      if (board.turn === 0) {
        board.pile1.push(CardToAdd);
        board.pile1Card++;
      } else {
        board.pile2.push(CardToAdd);
        board.pile2Card++;
      }

      if (CardToAdd.faceCard) {
        board.peggingScore = board.peggingScore + 10;
      } else {
        board.peggingScore = board.peggingScore + CardToAdd.rank;
      }

      if (board.peggingScore === 15) {
        board.players[board.turn].score = board.players[board.turn].score + 2;
      }
      if (board.peggingScore === 31) {
        board.players[board.turn].score = board.players[board.turn].score + 2;
        board.peggingScore = 0;
      }
      renderUI(board);
      board.currentPeggingHand.push(card);
      let potentialPairs = [];
      let amountOfPairs = 0;

      for (let i = 0; i < board.currentPeggingHand.length; i++) {
        potentialPairs.push(
          board.currentPeggingHand[board.currentPeggingHand.length - i - 1]
        );
        if (potentialPairs.length >= 2) {
          let allPairs = [];
          lookForPairsAndFifteens([], [...potentialPairs], [], allPairs);
          if (allPairs.length <= amountOfPairs) {
            break;
          }
          amountOfPairs = allPairs.length;
        }
      }

      board.players[board.turn].score += amountOfPairs * 2;

      let potentialRun = [...board.currentPeggingHand];
      let runLength = 0;

      for (let i = 0; i < board.currentPeggingHand.length; i++) {
        if (potentialRun.length >= 3) {
          let allRuns = [];
          lookForRuns([...potentialRun], allRuns, false);
          if (allRuns.length !== 0) {
            runLength = allRuns[0].length;
            break;
          }
          potentialRun.shift();
        }
      }
      board.players[board.turn].score += runLength;

      renderUI(board);
      if (board.turn === 0) {
        board.turn = 1;
      } else {
        board.turn = 0;
      }
      checkIfCanPlay(board);
    }
  }

  let player1 = board.players[0];
  let player2 = board.players[1];

  let player1hand = player1.hand;
  let player2hand = player2.hand;

  if (player1hand.length === 0 && player2hand.length === 0) {
    for (let i = 0; i < 4; i++) {
      let cardToPutBack1 = board.pile1.pop();
      player1hand.push(cardToPutBack1);

      let cardToPutBack2 = board.pile2.pop();
      player2hand.push(cardToPutBack2);

      board.pile1Card = 0;
      board.pile2Card = 0;
      renderUI(board);
    }
    board.phase = countingHandScore;
    render(board);
  }

  function checkIfCanPlay(board) {
    // if next player cannot play
    let temporaryHand = [...board.players[board.turn].hand];
    temporaryHand.sort((a, b) => a - b);
    if (
      board.players[board.turn].hand.length === 0 ||
      31 - board.peggingScore < getRank(temporaryHand[0])
    ) {
      console.log(
        `${board.players[board.turn].name} cannot play, switching players`
      );
      if (board.turn === 0) {
        board.turn = 1;
      } else {
        board.turn = 0;
      }
      // check if current player can play
      let temporaryHand = [...board.players[board.turn].hand];
      temporaryHand.sort((a, b) => a - b);
      if (
        board.players[board.turn].hand.length === 0 ||
        31 - board.peggingScore < getRank(temporaryHand[0])
      ) {
        // if not, set score to 0 and award points
        console.log(
          `${
            board.players[board.turn].name
          } cannot play, +1 point for last card`
        );
        board.players[board.turn].score++;
        board.peggingScore = 0;
        board.currentPeggingHand = [];
        renderUI(board);
        if (board.turn === 0) {
          board.turn = 1;
        } else {
          board.turn = 0;
        }
      }
    }
  }
  function getRank(card) {
    return card.faceCard ? 10 : card.rank;
  }
};

CribbageBoard.prototype.finalScoring = function () {
  this.players.forEach((player) => {
    player.score += player.scoreHand(player.hand, this.cut);
    if (player.isCrib) {
      player.score += player.scoreHand(player.crib, this.cut);
    }
  });
  let card = this.cut.pop();
  this.deck.cards.push(card);
  this.cut = [back];
  this.phase = cardSelectionPhase;
  this.emptyHand();
  if (this.players[0].isCrib) {
    this.players[0].isCrib = false;
    this.players[1].isCrib = true;
  } else {
    this.players[0].isCrib = true;
    this.players[1].isCrib = false;
  }
  setTimeout(() => {
    this.phase = cardSelectionPhase;
    render(this);
  }, 2000);
};

function Player(name) {
  this.name = name;
  this.hand = [];
  this.crib = [];
  this.score = 0;
  this.isCrib = false;
}
// have hand so we can add the crib using the same function?
Player.prototype.scoreHand = function (hand, extra = []) {
  // This and the pegging function will be pain
  // check for 15s (How? idk)
  let fullHand = [...hand];
  extra.forEach((card) => {
    fullHand.push(card);
  });

  // holds all combination that past the given tests
  let allFifteens = [];
  let allPairs = [];
  let allRuns = [];
  let sameSuit = [];

  // calls recursion function
  lookForPairsAndFifteens([], [...fullHand], allFifteens, allPairs);

  // // looks for runs
  lookForRuns([...fullHand], allRuns);

  lookForSameSuit([...hand], [...extra], sameSuit);

  let points = 0;

  allRuns.forEach((run) => {
    points += run.length;
  });
  allFifteens.forEach((fifteen) => {
    points += 2;
  });
  allPairs.forEach((pair) => {
    points += 2;
  });
  sameSuit.forEach((card) => {
    points++;
  });
  if (checkForJack([...hand], [...extra]) === true) {
    points++;
  }
  console.log(allRuns);
  console.log(allFifteens);
  console.log(allPairs);
  console.log(sameSuit);
  console.log(points);
  return points;
  // We can edit this function later, currently it only takes in an array of numbers
  // calculateFifteens([10, 5, 8, 2, 5]);

  // check for same suit (array.every())
  // check for jacks with the same suit as the cut card
};

function checkForJack(hand, extra = []) {
  if (hand.some((card) => card.rank === 11 && extra[0].suit === card.suit)) {
    return true;
  }
  return false;
}

function lookForSameSuit(hand, extra = [], sameSuit) {
  if (hand.every((card) => card.suit === hand[0].suit)) {
    hand.forEach((card) => sameSuit.push(card));

    extra.forEach((card) => {
      if (card.suit === hand[0].suit) {
        sameSuit.push(card);
      }
    });
  }
}

function lookForRuns(array, allRuns, useRunAmount = true) {
  // sorts array from lowest value to highest
  array.sort((a, b) => a.rank - b.rank);

  // holds current run
  let currentRun = [];
  // hold if there are duplicate runs (like if you have 7789, that would be 2 runs of 789)
  let runAmount = 1;
  // for every element in the array
  for (let i = 0; i < array.length; i++) {
    if (i === 0) {
      currentRun.push(array[i]);
      // adds the current element to the current run
      continue;
    }
    if (array[i].rank === array[i - 1].rank && useRunAmount) {
      // if the current array element equals the previous one, then adds one to the run counter
      runAmount *= 2;
      continue;
    }

    // if the current element isn't one more that the previous one or if its the last element in the array
    if (array[i].rank !== array[i - 1].rank + 1 || i === array.length - 1) {
      // if its the last element in the array
      if (array[i].rank === array[i - 1].rank + 1 && i === array.length - 1) {
        // add it to the current run
        currentRun.push(array[i]);
      } else if (useRunAmount === false) {
        allRuns = [];
        return;
      }
      // checks if the current run is 3 or more long (78 is not a run but 789 is)
      if (currentRun.length >= 3) {
        // pushes the current run into all runs as many times as there is duplicates (12334 => 1234, 1234)
        for (let j = 0; j < runAmount; j++) {
          allRuns.push([...currentRun]);
        }
      }
      // resets run amount and the current run
      runAmount = 1;
      currentRun = [];
    }
    currentRun.push(array[i]);
  }
}

function lookForPairsAndFifteens(subset, insertedArray, allFifteens, allPairs) {
  let array = [...insertedArray];
  // stops recursion when the array is empty and no more values can be added
  if (array.length === 0) {
    return;
  }
  // removes the first item in the input and saves it
  let newItem = array.splice(0, 1);
  // recurs WITHOUT adding the new item
  lookForPairsAndFifteens([...subset], [...array], allFifteens, allPairs);
  // recurs WITH adding the new item
  subset.push(newItem[0]);
  lookForPairsAndFifteens([...subset], [...array], allFifteens, allPairs);

  // If the current subset totals to 15, or anything else we may like
  if (
    subset.reduce(
      (accumulator, card) =>
        card.faceCard === true
          ? (accumulator += 10)
          : (accumulator += card.rank),
      0
    ) === 15
  ) {
    // adds the current subset to the final array
    allFifteens.push([...subset]);
    // stops recursion
    return;
  }
  // look for pairs
  if (subset.length === 2 && subset[0].rank === subset[1].rank) {
    allPairs.push([...subset]);
  }
}

Player.prototype.getCurrentScore = function () {
  // return this.score
};

function buttonHandler() {
  console.log("fired");
  if (board.phase === midTurnCut) {
    board.midTurnCut();
    board.phase = peggingPhase;
    render(board);
  }
  return;
}

function resetHandler() {
  reset(board);
}

function reset(board) {
  board.phase = initialCut;
  board.players[0].score = 0;
  board.players[1].score = 0;

  board.emptyHand();

  const cribbageBoardUI = document.querySelector(".cribbage-board");
  for (let i = 0; i < board.players.length; i++) {
    const currentRowUI = cribbageBoardUI.querySelectorAll("tr")[i];
    const currentRowElementsUI = [...currentRowUI.querySelectorAll("td")];
    const allPegs = [...currentRowUI.querySelectorAll("i")];
    currentRowElementsUI.forEach((td) => {
      td.classList.remove("scored");
    });
    allPegs.forEach((peg) => {
      peg.remove();
    });
    currentRowElementsUI[0].insertAdjacentHTML(
      "beforeend",
      `<i class="fa-sharp fa-solid fa-map-pin"></i>`
    );
    currentRowElementsUI[1].insertAdjacentHTML(
      "beforeend",
      `<i class="fa-sharp fa-solid fa-map-pin"></i>`
    );
  }
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
    renderUI(board);
  }
  if (board.phase === peggingPhase) {
    renderUI(board);
  }
  if (board.phase === countingHandScore) {
    board.finalScoring();
    renderUI(board);
  }
}

function renderUI(board) {
  let boardLength =
    document.querySelector("table").children[0].children[0].children.length;
  let winBox = document.querySelector("footer");
  if (board.players[0].score >= boardLength - 2) {
    document.querySelector("main").style.display = "none";
    document.querySelector("aside").style.display = "none";
    winBox.style.display = "block";
    document.querySelector("body").style.padding = "0%";
    document.querySelector("h1").textContent = "player1 Wins";
    return;
  } else if (board.players[1].score >= boardLength - 2) {
    document.querySelector("main").style.display = "none";
    document.querySelector("aside").style.display = "none";
    winBox.style.display = "block";
    document.querySelector("body").style.padding = "0%";
    document.querySelector("h1").textContent = "player2 Wins";
    return;
  } else {
    document.querySelector("main").style.display = "block";
    document.querySelector("aside").style.display = "block";
    winBox.style.display = "none";
  }
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
    const allPegs = [...currentRowUI.querySelectorAll("i")];
    // for every score the player has, adds colored background
    for (let i = 0; i < currentPlayer.score + 2; i++) {
      currentRowElementsUI[i].classList.add("scored");
    }
    if (
      currentPlayer.score + 1 >
      allPegs[allPegs.length - 1].parentElement.cellIndex
    ) {
      if (allPegs.length >= 2) {
        // REMOVE LAST PEG IF THERE ARE MORE THAN TWO PEGS
        allPegs[0].remove();
      }
      // adds pin at the last score
      currentRowElementsUI[currentPlayer.score + 1].insertAdjacentHTML(
        "beforeend",
        `<i class="fa-sharp fa-solid fa-map-pin"></i>`
      );
    }

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
  ).children[0].src = `Pictures/card_${board.cut[0].toCardCode()}.png`;
  if (board.phase === midTurnCut) {
    document.querySelector(".button").style.display = "flex";
    document.querySelector(".button").textContent = "cut";
    document.querySelector("aside").style.marginTop = "-11em";
    document.querySelector("body").style.paddingBottom = "0%";
    document.querySelector(".player2-details").style.marginBottom = "5em";
  } else {
    document.querySelector(".button").style.display = "none";
    document.querySelector("aside").style.marginTop = "-4em";
    document.querySelector(".player2-details").style.marginBottom = "0";
  }

  if (board.phase === peggingPhase) {
    document.querySelector(".pegging").style.display = "flex";
    document.querySelector("body").style.paddingTop = "0";
    document.querySelector(
      ".player1Pile"
    ).children[0].src = `/Pictures/card_${board.pile1[
      board.pile1Card
    ].toCardCode()}.png`;
    document.querySelector(
      ".player2Pile"
    ).children[0].src = `/Pictures/card_${board.pile2[
      board.pile2Card
    ].toCardCode()}.png`;
    document.querySelector(
      ".pegging-score"
    ).children[0].innerHTML = `${board.peggingScore}`;
  } else {
    document.querySelector(".pegging").style.display = "none";
    document.querySelector("body").style.paddingTop = "5%";
  }
}

const board = new CribbageBoard();
resetHandler();

document
  .querySelector("#hand1")
  .addEventListener("click", (event) => board.addToCrib(event));
document
  .querySelector("#hand2")
  .addEventListener("click", (event) => board.addToCrib(event));
document.querySelector(".button").addEventListener("click", buttonHandler);
document
  .querySelector("#hand1")
  .addEventListener("click", (event) => board.pegging(event));
document
  .querySelector("#hand2")
  .addEventListener("click", (event) => board.pegging(event));
document.querySelector("#reset").addEventListener("click", resetHandler);
