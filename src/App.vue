<template>
  <div id="app">
    <div v-if="!joined" class="join-container">
      <input v-model="name" placeholder="Enter your name" />
      <button @click="joinGame">Join Game</button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
    <div v-else>
      <div v-if="gameFinished">
        Winner is
        <div v-for="player in findHighestScorers(scores)" :key="player">
          {{ player }}
        </div>
      </div>
      <ScrabbleBoard
        :players="players"
        :scores="scores"
        :currentPlayer="name"
        :board="board"
        :socket="socket"
        :lastPacked="lastPacked"
        :highlightActive="highlightActive"
      />

      <!-- <p v-if="gameStarted">Game started!</p> -->
      <p v-if="gameStarted">{{ remainingLetters }} letters remaining</p>
      <p v-if="gameStarted && isActivePlayer">It's your turn!</p>
      <p v-if="gameStarted && !isActivePlayer">
        Waiting for {{ currentTurnPlayer }}'s turn...
      </p>

      <div v-if="true || gameStarted" class="letters">
        <!-- <h3>Your Letters:</h3> -->
        <div class="letter-row">
          <LetterTile
            v-for="letter in letters"
            :key="letter.id"
            :id="letter.id"
            :letter="letter.letter"
            :points="letter.points"
            :isDraggable="isActivePlayer"
          />
        </div>
      </div>
      <div class="actions">
        <div>
          <button
            v-if="isActivePlayer && gameStarted"
            @click="passTurn"
            class="btn btn-pass"
          >
            <i class="fas fa-check"></i> Ready
          </button>
          <button
            v-if="isActivePlayer && gameStarted"
            @click="cancelTurn"
            class="btn btn-cancel"
          >
            <i class="fas fa-times"></i> Cancel
          </button>
          <button
            v-if="isActivePlayer && gameStarted"
            @click="changeAllLetters"
            class="btn btn-change"
          >
            <i class="fas fa-exchange-alt"></i> Change
          </button>
          <button
            v-if="isActivePlayer && gameStarted"
            @click="shuffle"
            class="btn btn-shuffle"
          >
            <i class="fas fa-random"></i> Shuffle
          </button>
          <button
            v-if="isActivePlayer && gameStarted"
            @click="highlightLastPlacedLetters"
            class="btn btn-highlight"
          >
            <i class="fas fa-highlighter"></i> Last
          </button>
        </div>
        <div>
          <button
            v-if="isActivePlayer && gameStarted && remainingLetters === 0"
            @click="surrender"
            class="btn btn-surrender"
          >
            <i class="fas fa-stop"></i> Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ScrabbleBoard from "./components/ScrabbleBoard.vue";
  import LetterTile from "./components/LetterTile.vue";
  import "@fortawesome/fontawesome-free/css/all.css";
  import "@fortawesome/fontawesome-free/js/all.js";

  export default {
    data() {
      return {
        name: null,
        joined: false,
        players: [],
        scores: [],
        gameStarted: false,
        gameFinished: false,
        errorMessage: "",
        requiredPlayers: 2, // default value
        socket: null,
        letters: [],
        allLetters: [],
        board: [],
        currentTurnPlayer: "",
        remainingLetters: 0,
        lastPacked: [], // Keep track of the last placed letters
        highlightActive: false, // Control highlight state
      };
    },
    components: {
      ScrabbleBoard,
      LetterTile,
    },
    computed: {
      isActivePlayer() {
        return this.currentTurnPlayer === this.name;
      },
    },
    methods: {
      joinGame() {
        // if (this.name.trim() === "") {
        //   this.errorMessage = "Name cannot be empty";
        //   return;
        // }

        // if (this.players.length === 0) {
        //   message.requiredPlayers = this.requiredPlayers;
        // }
        this.socket.send(
          JSON.stringify({
            type: "join",
            name: this.name,
          })
        );
      },
      passTurn() {
        this.socket.send(
          JSON.stringify({
            type: "turn",
            player: this.currentTurnPlayer,
          })
        );
      },
      cancelTurn() {
        this.socket.send(
          JSON.stringify({
            type: "cancel-turn",
            player: this.currentTurnPlayer,
          })
        );
      },
      surrender() {
        this.socket.send(
          JSON.stringify({
            type: "surrender",
            player: this.currentTurnPlayer,
          })
        );
      },
      changeAllLetters() {
        this.socket.send(
          JSON.stringify({
            type: "change-all-letters",
            player: this.currentTurnPlayer,
          })
        );
      },
      shuffle() {
        this.socket.send(
          JSON.stringify({
            type: "shuffle",
            player: this.currentTurnPlayer,
          })
        );
      },
      highlightLastPlacedLetters() {
        this.highlightActive = !this.highlightActive;
      },
      updateBoardCell({ rowIndex, colIndex, letter }) {
        this.socket.send(
          JSON.stringify({
            type: "update-board-cell",
            rowIndex,
            colIndex,
            letter,
            player: this.currentTurnPlayer,
          })
        );
      },
      findHighestScorers(scores) {
        let highestScore = -Infinity;
        let highestScorers = [];

        for (const [player, score] of Object.entries(scores)) {
          if (score > highestScore) {
            highestScore = score;
            highestScorers = [player];
          } else if (score === highestScore) {
            highestScorers.push(player);
          }
        }

        return highestScorers;
      },
    },
    sockets: {
      handleMessage(event) {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "players":
            this.players = data.players;
            // this.name = this.players[this.players.length - 1];
            this.joined = true;

            break;

          case "new-player":
            this.name = data.name;
            break;

          case "start-game":
            this.gameStarted = true;
            // this.letters = data.letters;
            break;
          case "end-game":
            this.gameStarted = false;
            this.gameFinished = true;
            // this.letters = data.letters;

            break;
          case "turn":
            this.currentTurnPlayer = data.player;
            break;
          case "lastpacked":
            this.lastPacked = data.lastPacked;
            // console.log(this.lastPacked, this.letters);
            break;

          case "player-left":
            this.players = this.players.filter(
              (player) => player !== data.name
            );
            break;
          case "update-board":
            this.board = data.board;
            // console.log(this.board);

            break;
          case "update-letters":
            // console.log(data.letters);
            this.letters = data.letters;
            break;
          case "update-score":
            // console.log(data.scores);
            this.scores = data.scores;
            break;
          case "remaining-letters":
            this.remainingLetters = data.remainingLetters;

            break;
          // case "update-remaining-letters":
          //   this.remainingLetters = data.remainingLetters;
          //   break;

          case "error":
            this.errorMessage = data.message;
            break;
        }
      },
    },
    created() {
      // this.socket = new WebSocket("ws://localhost:3000");
      // const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      // console.log(protocol);
      // const host = window.location.host;
      // const wsUrl = `${protocol}://${host}`;
      this.socket = new WebSocket(process.env.VUE_APP_BASE_URL);
      // this.socket = new WebSocket("wss://056c-80-114-243-74.ngrok-free.app");

      this.socket.onmessage = this.sockets.handleMessage.bind(this);
      this.socket.onopen = () => {
        // this.name = `Player ${this.players.length + 1}`;
        // this.joined = true;
        // this.socket.send(JSON.stringify({ type: "join", name: this.name }));
      };
    },
  };
</script>

<style>
  #app {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #4caf50;
    flex-direction: column;
  }
  .join-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .row {
    display: flex;
    flex-direction: row;
  }
  .letters {
    margin-top: 20px;
  }
  .letter-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .actions {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  .actions .btn {
    margin: 5px;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }
  .actions .btn i {
    margin-right: 5px;
  }
  .actions .btn-pass {
    background-color: #4caf50;
    color: white;
  }
  .actions .btn-cancel {
    background-color: #9c27b0;
    color: white;
  }
  .actions .btn-change {
    background-color: #ff9800;
    color: white;
  }
  .actions .btn-surrender {
    background-color: #f44336;
    color: white;
  }
  .actions .btn-shuffle {
    background-color: #3f51b5;
    color: white;
  }
  .btn-highlight {
    background-color: #00bcd4;
    color: white;
  }

  .btn-highlight i {
    margin-right: 5px;
  }
</style>
