<template>
  <div id="app">
    <div v-if="!joined" class="join-container">
      <div v-if="sessionName" class="reconnect-container">
        <button @click="reconnect" class="btn btn-reconnect">
          <i class="fas fa-sync-alt"></i> Reconnect
        </button>
      </div>
      <div><p>Create Room or Join an open Room</p></div>
      <div class="button-group">
        <button @click="createRoom(true)" class="btn btn-secondary">
          Play computer (ENG)
        </button>
      </div>
      <div class="button-group">
        <button @click="openCreateRoom" class="btn btn-secondary">
          Create Room
        </button>
      </div>

      <div v-if="showCreateRoomInput" class="create-room-overlay">
        <div class="create-room-container">
          <input
            v-model="newRoomName"
            placeholder="Enter Room Name"
            class="input-field"
          />
          <div class="form-group">
            <label>Language:</label>
            <div class="language-options">
              <input
                type="radio"
                id="lang-en"
                value="en_GB"
                v-model="selectedLanguage"
              />
              <label for="lang-en"
                ><img
                  src="./assets/flags//gb.png"
                  alt="English"
                  class="flag-icon"
                />
                English</label
              >
              <input
                type="radio"
                id="lang-hu"
                value="hu_HU"
                v-model="selectedLanguage"
              />
              <label for="lang-hu"
                ><img
                  src="./assets/flags/hu.png"
                  alt="Hungarian"
                  class="flag-icon"
                />
                Hungarian</label
              >
              <input
                type="radio"
                id="lang-nl"
                value="nl_NL"
                v-model="selectedLanguage"
              />
              <label for="lang-nl"
                ><img
                  src="./assets/flags/nl.png"
                  alt="Dutch"
                  class="flag-icon"
                />
                Dutch</label
              >
            </div>
          </div>
          <div class="form-group">
            <label>Number of Players:</label>
            <div class="player-options">
              <input
                type="radio"
                id="players-2"
                value="2"
                v-model="requiredPlayers"
              />
              <label for="players-2">2 Players</label>
              <input
                type="radio"
                id="players-3"
                value="3"
                v-model="requiredPlayers"
              />
              <label for="players-3">3 Players</label>
              <input
                type="radio"
                id="players-4"
                value="4"
                v-model="requiredPlayers"
              />
              <label for="players-4">4 Players</label>
            </div>
          </div>
          <button @click="createRoom(false)" class="btn btn-primary">
            Create Room
          </button>
          <button @click="closeCreateRoom" class="btn btn-cancel">
            Cancel
          </button>
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <RoomList
        :rooms="rooms"
        :selectedRoom="selectedRoom"
        @select-room="selectRoom"
      />
      <PlayerTextInput
        v-if="showNameInput"
        :visible="showNameInput"
        placeholder="Enter your name"
        buttonText="Join"
        @confirm="confirmName"
      />
    </div>
    <div v-else class="table-container">
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
            class="btn btn-control btn-pass"
          >
            <i class="fas fa-check"></i> Ready
          </button>
          <button
            v-if="isActivePlayer && gameStarted"
            @click="cancelTurn"
            class="btn btn-control btn-cancel"
          >
            <i class="fas fa-times"></i> Cancel
          </button>
          <button
            v-if="isActivePlayer && gameStarted"
            @click="changeAllLetters"
            class="btn btn-control btn-change"
          >
            <i class="fas fa-exchange-alt"></i> Change
          </button>
          <button
            v-if="isActivePlayer && gameStarted"
            @click="shuffle"
            class="btn btn-control btn-shuffle"
          >
            <i class="fas fa-random"></i> Shuffle
          </button>
          <button
            v-if="gameStarted"
            @click="highlightLastPlacedLetters"
            class="btn btn-control btn-highlight"
          >
            <i class="fas fa-highlighter"></i> Last
          </button>
        </div>
        <div>
          <button
            v-if="isActivePlayer && gameStarted && remainingLetters === 0"
            @click="surrender"
            class="btn btn-control btn-surrender"
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
  import PlayerTextInput from "./components/PlayerTextInput.vue";

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
        requiredPlayers: 2, // default valuee
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
        showNameInput: false,
        showWildInput: false,
        showCreateRoomInput: false,
        selectedLanguage: "hu_HU",
        originalTitle: document.title,
        flashingInterval: null,
      };
    },
    components: {
      ScrabbleBoard,
      LetterTile,
      RoomList,
      PlayerTextInput,
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
      openCreateRoom() {
        this.showCreateRoomInput = true;
      },
      closeCreateRoom() {
        this.showCreateRoomInput = false;
      },
      createRoom(bot) {
        this.socket.send(
          JSON.stringify({
            type: bot ? "create-solo-game" : "create-game",
            playerCnt: Number(this.requiredPlayers),
            lang: this.selectedLanguage,
            name: this.newRoomName,
          })
        );
        this.showCreateRoomInput = false;
      },
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
        console.log(this.rooms);
        const selectedRoom = this.rooms.find((room) => room.roomId === id);

        if (selectedRoom) {
          this.showNameInput = true;
        }
      },
      confirmName(inputValue) {
        // if (inputValue) {
        this.name = inputValue;
        this.showNameInput = false;
        this.joinGame();
        // }
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
            console.log(this.rooms);
          })
          .catch((error) => {
            console.error("Error fetching rooms:", error);
          });
      },
      startFlashingTab() {
        if (!this.flashingInterval) {
          this.flashingInterval = setInterval(() => {
            document.title =
              document.title === "Your Turn!"
                ? this.originalTitle
                : "Your Turn!";
          }, 1000);
        }
      },
      stopFlashingTab() {
        clearInterval(this.flashingInterval);
        this.flashingInterval = null;
        document.title = this.originalTitle;
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
      isActivePlayer(newValue) {
        if (newValue) {
          this.startFlashingTab();
        } else {
          this.stopFlashingTab();
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
    background-color: #135d67;
    flex-direction: column;
    font-family: "Roboto", sans-serif;
  }
  .join-container {
    background-color: rgb(41, 105, 174);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 300px;
  }
  .table-container {
    background-color: #2794a2;
    padding: 50px;
    border-radius: 10px;
  }
  .form-group {
    width: 100%;
    /* margin-bottom: 20px; */
  }

  .input-field {
    width: 93%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
    font-size: 16px;
  }

  /* Button styles */
  .button-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 20px;
  }

  .btn {
    margin: 5px 0;
    padding: 10px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    width: 100%;
    text-align: center;
    transition: background-color 0.2s;
  }
  .btn-control {
    width: 100px;
  }
  .btn-primary {
    background-color: #4caf50;
    color: white;
    border: none;
  }

  .btn-primary:disabled {
    background-color: #ccc;
  }

  .btn-secondary {
    background-color: #ff9800;
    color: white;
    border: none;
  }
  .reconnect-container {
    margin-bottom: 20px;
  }

  .btn-reconnect {
    background-color: #f44336; /* Red color */
    color: white;
    border: none;
    font-size: 14px;
    padding: 8px 12px;
  }

  .btn-reconnect i {
    margin-right: 5px;
  }

  /* Error message */
  .error-message {
    color: #e53935;
    font-weight: bold;
    margin-top: 10px;
  }
  .game-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 300px;
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
  .btn:hover {
    background-color: #388e3c; /* Darker green for primary buttons */
  }
  .btn-secondary:hover {
    background-color: #e65100; /* Darker orange */
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
  .create-room-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .create-room-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .language-options {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  .flag-icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  .player-options {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
</style>
