<template>
  <div id="app">
    <div v-if="!joined" class="join-container">
      <input v-model="name" placeholder="Enter your name" />
      <div v-if="players.length === 0">
        <label>Number of players:</label>
        <select v-model="requiredPlayers">
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
      <button @click="joinGame">Join Game</button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
    <div v-else>
      <ScrabbleBoard :players="players" :currentPlayer="name" />
      <!-- <p>Players:</p>
      <ul>
        <li v-for="player in players" :key="player">{{ player }}</li>
      </ul> -->
      <p v-if="gameStarted">Game started!</p>
      <div v-if="gameStarted" class="letters">
        <h3>Your Letters:</h3>
        <div class="letter-row">
          <LetterTile
            v-for="(letter, index) in letters"
            :key="index"
            :letter="letter.letter"
            :points="letter.points"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ScrabbleBoard from "./components/ScrabbleBoard.vue";
  import LetterTile from "./components/LetterTile.vue";

  export default {
    data() {
      return {
        name: "",
        joined: false,
        players: [],
        gameStarted: false,
        errorMessage: "",
        requiredPlayers: 2, // default value
        socket: null,
        letters: [],
      };
    },
    components: {
      ScrabbleBoard,
      LetterTile,
    },
    methods: {
      joinGame() {
        if (this.name.trim() === "") {
          this.errorMessage = "Name cannot be empty";
          return;
        }
        const message = {
          type: "join",
          name: this.name,
        };
        if (this.players.length === 0) {
          message.requiredPlayers = this.requiredPlayers;
        }
        this.socket.send(JSON.stringify(message));
      },
    },
    sockets: {
      handleMessage(event) {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "players":
            this.players = data.players;
            this.joined = true;
            break;

          case "new-player":
            if (!this.players.includes(data.name)) {
              this.players.push(data.name);
            }
            break;

          case "start-game":
            this.gameStarted = true;
            this.letters = data.letters;

            break;

          case "player-left":
            this.players = this.players.filter(
              (player) => player !== data.name
            );
            break;

          case "error":
            this.errorMessage = data.message;
            break;
        }
      },
    },
    created() {
      this.socket = new WebSocket("ws://localhost:3000");
      this.socket.onmessage = this.sockets.handleMessage.bind(this);
      this.socket.onopen = () => {
        console.log("Connected to server");
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
