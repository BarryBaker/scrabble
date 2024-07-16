<template>
  <div id="app">
    <div v-if="!joined" class="join-container">
      <input v-model="name" placeholder="Enter your name" />
      <button @click="joinGame">Join Game</button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
    <div v-else>
      <ScrabbleBoard
        :players="players"
        :scores="scores"
        :currentPlayer="name"
        :board="board"
        :socket="socket"
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
      <button v-if="isActivePlayer && gameStarted" @click="passTurn">
        Pass Turn
      </button>
      <button v-if="isActivePlayer && gameStarted" @click="cancelTurn">
        Cancel Turn
      </button>
      <button v-if="isActivePlayer && gameStarted" @click="changeAllLetters">
        Change All Letters
      </button>
      <button v-if="isActivePlayer && gameStarted" @click="surrender">
        Surrender
      </button>
      <button v-if="isActivePlayer && gameStarted" @click="shuffle">
        Shuffle
      </button>
    </div>
  </div>
</template>

<script>
  import ScrabbleBoard from "./components/ScrabbleBoard.vue";
  import LetterTile from "./components/LetterTile.vue";

  export default {
    data() {
      return {
        name: null,
        joined: false,
        players: [],
        scores: [],
        gameStarted: false,
        errorMessage: "",
        requiredPlayers: 2, // default value
        socket: null,
        letters: [],
        allLetters: [],
        board: [],
        currentTurnPlayer: "",
        remainingLetters: 0,
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
            // this.letters = data.letters;

            break;
          case "turn":
            this.currentTurnPlayer = data.player;
            break;
          case "player-left":
            this.players = this.players.filter(
              (player) => player !== data.name
            );
            break;
          case "update-board":
            this.board = data.board;

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
            this.remainingLetters = data.remainingLetters; // Add this line
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
      // const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      // const host = window.location.host;
      // const wsUrl = `${protocol}://${host}`;
      this.socket = new WebSocket(process.env.VUE_APP_BASE_URL);

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
</style>
