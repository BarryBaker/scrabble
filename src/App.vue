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
          }),
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
            }),
          );
        }
      },
      selectRoom(id) {
        this.selectedRoom = id;
        // console.log(this.rooms);
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
          }),
        );
      },
      cancelTurn() {
        this.socket.send(
          JSON.stringify({
            type: "cancel-turn",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          }),
        );
      },
      surrender() {
        this.socket.send(
          JSON.stringify({
            type: "surrender",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          }),
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
            }),
          );
        }
      },
      changeAllLetters() {
        this.socket.send(
          JSON.stringify({
            type: "change-all-letters",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          }),
        );
      },
      shuffle() {
        this.socket.send(
          JSON.stringify({
            type: "shuffle",
            player: this.currentTurnPlayer,
            roomId: this.roomId,
          }),
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
              (player) => player !== data.name,
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
          this.highlightLastPlacedLetters();
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
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
  }

  :root {
    --cell-size: 40px;
    --cell-font: 9px;
    --cell-radius: 3px;
    --board-tile-size: 38px;
    --board-tile-font: 17px;
    --board-tile-radius: 4px;
    --hand-tile-size: 50px;
    --hand-tile-font: 22px;
    --hand-tile-radius: 8px;
    --points-font: 10px;
    --board-padding: 8px;
    --board-radius: 16px;
    --table-padding: 40px;
  }

  @media (max-width: 632px) {
    :root {
      --cell-size: calc((100vw - 16px) / 15);
      --cell-font: clamp(5px, 1.4vw, 9px);
      --cell-radius: 2px;
      --board-tile-size: calc((100vw - 16px) / 15 - 2px);
      --board-tile-font: clamp(11px, 2.6vw, 17px);
      --board-tile-radius: 2px;
      --hand-tile-size: clamp(32px, 8vw, 50px);
      --hand-tile-font: clamp(16px, 3.5vw, 22px);
      --hand-tile-radius: 6px;
      --points-font: clamp(7px, 1.5vw, 10px);
      --board-padding: 4px;
      --board-radius: 10px;
      --table-padding: 12px;
    }
  }

  #app {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    flex-direction: column;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
    color: #e2e8f0;
  }

  .join-container {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 380px;
  }

  .join-container p {
    color: #94a3b8;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .table-container {
    background: rgba(47, 64, 92, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(155, 171, 194, 0.08);
    /* padding: var(--table-padding); */
    border-radius: 24px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    color: #e2e8f0;
    max-width: 100vw;
  }

  .table-container p {
    text-align: center;
    font-weight: 500;
    color: #94a3b8;
    font-size: 14px;
    margin: 8px 0;
  }

  .form-group {
    width: 100%;
  }

  .form-group label {
    color: #cbd5e1;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
    display: block;
  }

  .input-field {
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.6);
    color: #e2e8f0;
    font-size: 15px;
    font-family: "Inter", sans-serif;
    transition: all 0.2s ease;
    outline: none;
  }

  .input-field:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  .input-field::placeholder {
    color: #64748b;
  }

  /* Button styles */
  .button-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 12px;
  }

  .btn {
    margin: 4px 0;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    cursor: pointer;
    border-radius: 12px;
    width: 100%;
    text-align: center;
    transition: all 0.2s ease;
    border: none;
    letter-spacing: 0.01em;
  }

  .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn-control {
    width: auto;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }

  .btn-primary:disabled {
    background: #334155;
    color: #64748b;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .btn-secondary {
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: white;
    border: none;
  }

  .btn-secondary:hover {
    background: linear-gradient(135deg, #d97706, #ea580c);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
  }

  .reconnect-container {
    margin-bottom: 16px;
    width: 100%;
  }

  .btn-reconnect {
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    color: white;
    border: none;
    font-size: 13px;
    padding: 10px 16px;
    border-radius: 10px;
  }

  .btn-reconnect:hover {
    background: linear-gradient(135deg, #d97706, #dc2626);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
  }

  .btn-reconnect i {
    margin-right: 6px;
  }

  /* Error message */
  .error-message {
    color: #fb7185;
    font-weight: 600;
    margin-top: 12px;
    font-size: 14px;
    background: rgba(244, 63, 94, 0.1);
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(244, 63, 94, 0.2);
  }

  .game-container {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
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
    gap: 2px;
  }

  .actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .actions .btn {
    margin: 3px;
    padding: 10px 16px;
    font-size: 13px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    border-radius: 10px;
  }

  .actions .btn i {
    margin-right: 6px;
  }

  .actions .btn-pass {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  .actions .btn-pass:hover {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }

  .actions .btn-cancel {
    background: linear-gradient(135deg, #a855f7, #7c3aed);
    color: white;
  }

  .actions .btn-cancel:hover {
    box-shadow: 0 6px 20px rgba(168, 85, 247, 0.3);
  }

  .actions .btn-change {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
  }

  .actions .btn-change:hover {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
  }

  .actions .btn-surrender {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }

  .actions .btn-surrender:hover {
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
  }

  .actions .btn-shuffle {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
  }

  .actions .btn-shuffle:hover {
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
  }

  .btn-highlight {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    color: white;
  }

  .btn-highlight:hover {
    box-shadow: 0 6px 20px rgba(6, 182, 212, 0.3);
  }

  .btn-highlight i {
    margin-right: 6px;
  }

  .game-item {
    padding: 12px;
    border: 1px solid rgba(148, 163, 184, 0.15);
    margin-bottom: 10px;
    cursor: pointer;
    border-radius: 10px;
    background: rgba(30, 41, 59, 0.5);
    transition: all 0.2s ease;
  }

  .game-item:hover {
    background: rgba(51, 65, 85, 0.6);
  }

  .game-item.selected {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.4);
  }

  .room-name-input {
    margin-bottom: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(15, 23, 42, 0.6);
    color: #e2e8f0;
  }

  .create-room-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .create-room-container {
    background: linear-gradient(145deg, #1e293b, #0f172a);
    border: 1px solid rgba(148, 163, 184, 0.12);
    /* padding: 32px; */
    border-radius: 20px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 340px;
    color: #e2e8f0;
  }

  .language-options {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .language-options label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #cbd5e1;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .language-options input[type="radio"] {
    accent-color: #6366f1;
  }

  .flag-icon {
    width: 20px;
    height: 20px;
    margin-right: 4px;
    border-radius: 2px;
  }

  .player-options {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;
  }

  .player-options label {
    color: #cbd5e1;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .player-options input[type="radio"] {
    accent-color: #6366f1;
  }

  .btn-cancel {
    background: rgba(100, 116, 139, 0.3);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.15);
    margin-top: 8px;
  }

  .btn-cancel:hover {
    background: rgba(100, 116, 139, 0.5);
    color: #e2e8f0;
  }
</style>
