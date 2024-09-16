<template>
  <div id="app">
    <div v-if="!joined" class="join-container">
      <div>
        <button v-if="sessionName" @click="reconnect" class="btn btn-reconnect">
          <i class="fas fa-sync-alt"></i> Reconnect
        </button>
      </div>
      <input v-model="name" placeholder="Enter your name" />
      <button @click="joinGame" :disabled="!selectedRoom">Join Game</button>
      <input
        v-model="newRoomName"
        placeholder="Enter Room Name"
        class="room-name-input"
      />
      <button @click="newGame(2)">NEW Game 2 Players</button>
      <button @click="newGame(3)">NEW Game 3 Players</button>
      <button @click="newGame(4)">NEW Game 4 Players</button>

      <p v-if="errorMessage">{{ errorMessage }}</p>
      <RoomList
        :rooms="rooms"
        :selectedRoom="selectedRoom"
        @select-room="selectRoom"
      />
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
        :lastPackedids="lastPackedids"
        :roomId="roomId"
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
            v-if="gameStarted"
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
  import RoomList from "./components/RoomList.vue";
  import "@fortawesome/fontawesome-free/css/all.css";
  import "@fortawesome/fontawesome-free/js/all.js";

  export default {
    data() {
      return {
        name: null,
        joined: false,
        roomId: null,
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
        lastPackedids: [],
        rooms: [],
        selectedRoom: null, // ID of the selected rooms
        newRoomName: "",
      };
    },
    components: {
      ScrabbleBoard,
      LetterTile,
      RoomList,
    },
    computed: {
      isActivePlayer() {
        return this.currentTurnPlayer === this.name;
      },
      sessionName() {
        return sessionStorage.getItem("playerName");
      },
    },
    methods: {
      joinGame() {
        if (this.selectedRoom) {
          console.log(this.selectedRoom);
          this.socket.send(
            JSON.stringify({
              type: "join",
              name: this.name,
              roomId: this.selectedRoom,
            })
          );
        }
      },
      selectRoom(id) {
        this.selectedRoom = id;
      },
      newGame(playerCnt) {
        this.socket.send(
          JSON.stringify({
            type: "create-game",
            playerCnt: playerCnt,
            name: this.newRoomName,
          })
        );
      },
      passTurn() {
        this.socket.send(
          JSON.stringify({
            type: "turn",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          })
        );
      },
      cancelTurn() {
        this.socket.send(
          JSON.stringify({
            type: "cancel-turn",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          })
        );
      },
      surrender() {
        this.socket.send(
          JSON.stringify({
            type: "surrender",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          })
        );
      },
      reconnect() {
        const storedName = sessionStorage.getItem("playerName");
        const storedRoomId = sessionStorage.getItem("roomId");
        if (storedName && storedRoomId) {
          this.name = storedName;
          this.roomId = storedRoomId;
          this.socket.send(
            JSON.stringify({
              type: "reconnect",
              player: this.name,
              roomId: this.roomId,
            })
          );
        }
      },
      changeAllLetters() {
        this.socket.send(
          JSON.stringify({
            type: "change-all-letters",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          })
        );
      },
      shuffle() {
        this.socket.send(
          JSON.stringify({
            type: "shuffle",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          })
        );
      },
      highlightLastPlacedLetters() {
        // const ids = [];
        for (let i of this.lastPacked) {
          this.lastPackedids.push(i.id);
        }
        setTimeout(() => {
          this.lastPackedids = [];
        }, 1000);
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
      fetchRooms() {
        fetch(process.env.VUE_APP_BASE_URL.replace("ws", "http") + "/rooms")
          .then((response) => response.json())
          .then((data) => {
            // console.log(data);
            this.rooms = data; // Convert rooms object to array
          })
          .catch((error) => {
            console.error("Error fetching rooms:", error);
          });
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
            this.name = data.name;
            sessionStorage.setItem("playerName", this.name);
            sessionStorage.setItem("roomId", data.roomId);
            this.fetchRooms();
            break;

          case "start-game":
            this.gameStarted = true;
            this.roomId = data.roomId;

            break;
          case "end-game":
            this.gameStarted = false;
            this.gameFinished = true;
            sessionStorage.removeItem("playerName");
            sessionStorage.removeItem("roomId");
            // this.letters = data.letters;

            break;
          case "turn":
            this.currentTurnPlayer = data.player;
            break;
          case "lastpacked":
            this.lastPacked = data.lastPacked;
            this.lastPackedids = [];
            // console.log(this.lastPacked, this.board);
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
            this.letters = data.letters;
            break;
          case "update-score":
            // console.log(data.scores);
            this.scores = data.scores;
            break;
          case "remaining-letters":
            this.remainingLetters = data.remainingLetters;

            break;
          case "game-created":
            this.fetchRooms();
            break;

          case "error":
            this.errorMessage = data.message;
            break;
        }
      },
    },
    watch: {
      rooms(newRooms) {
        // Check if rooms array is non-empty, and no room is selected yet
        if (newRooms.length > 0 && this.selectedRoom === null) {
          this.selectedRoom = newRooms[0].roomId; // Automatically select the first room
        }
        // If rooms become empty, set selectedRoom to null
        if (newRooms.length === 0) {
          this.selectedRoom = null;
        }
      },
    },
    created() {
      this.socket = new WebSocket(process.env.VUE_APP_BASE_URL);
      this.socket.onmessage = this.sockets.handleMessage.bind(this);

      this.socket.onopen = () => {};
    },
    mounted() {
      this.fetchRooms();
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
  .btn-reconnect {
    background-color: #ff9800; /* Orange color */
    color: #fff;
  }

  .btn-reconnect i {
    margin-right: 5px;
  }
  .game-item {
    padding: 10px;
    border: 1px solid #ccc;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .game-item.selected {
    background-color: lightblue;
  }
  .room-name-input {
    margin-bottom: 10px;
    padding: 5px;
  }
</style>
