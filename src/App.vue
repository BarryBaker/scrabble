<template>
  <div id="app">
    <div v-if="!joined">
      <input v-model="name" placeholder="Enter your name" />
      <button @click="joinGame">Join Game</button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
    <div v-else>
      <ScrabbleBoard />
      <p>Players:</p>
      <ul>
        <li v-for="player in players" :key="player">{{ player }}</li>
      </ul>
      <p v-if="gameStarted">Game started!</p>
    </div>
  </div>
</template>

<script>
  import ScrabbleBoard from "./components/ScrabbleBoard.vue";

  export default {
    data() {
      return {
        name: "",
        joined: false,
        players: [],
        gameStarted: false,
        errorMessage: "",
      };
    },
    components: {
      ScrabbleBoard,
    },
    methods: {
      joinGame() {
        this.$socket.sendObj({ type: "join", name: this.name });
      },
    },
    sockets: {
      onmessage(event) {
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
</style>
