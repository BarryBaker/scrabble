<template>
  <div id="app">
    <div v-if="!socketConnected">Connecting...</div>
    <div v-if="!showGame" class="landing-page">
      <SiteHeader />

      <!-- Reconnect banner -->
      <div
        v-if="activeRoom.roomName && activeRoom.player"
        class="reconnect-banner"
      >
        <div class="reconnect-inner">
          <button @click="reconnect" class="btn btn-reconnect">
            <i class="fas fa-sync-alt"></i> Reconnect to
            {{ activeRoom.roomName }} as {{ activeRoom.player }}
          </button>
        </div>
      </div>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">Play Scrabble Online</h1>
          <p class="hero-subtitle">
            The classic word game in <strong>English</strong>,
            <strong>Dutch</strong> and <strong>Hungarian</strong>. Start a solo
            game in English or Dutch, or create a room and play with others in
            real time.
          </p>
        </div>
      </section>

      <!-- Quick Play Section -->
      <section class="section quick-play-section">
        <div class="section-inner">
          <h2 class="section-title">Quick Play vs Computer</h2>
          <p class="section-desc">
            Jump straight into a solo game in English or Dutch.
          </p>
          <div class="quick-play-cards">
            <div class="qp-card" @click="createRoom(true, 'en_GB')">
              <img src="./assets/flags/gb.png" alt="English" class="qp-flag" />
              <span class="qp-lang">English</span>
              <span class="qp-action"
                >Play now <i class="fas fa-arrow-right"></i
              ></span>
            </div>
            <div class="qp-card" @click="createRoom(true, 'nl_NL')">
              <img src="./assets/flags/nl.png" alt="Dutch" class="qp-flag" />
              <span class="qp-lang">Dutch</span>
              <span class="qp-action"
                >Play now <i class="fas fa-arrow-right"></i
              ></span>
            </div>
          </div>
        </div>
      </section>

      <!-- Multiplayer Section -->
      <section class="section multiplayer-section">
        <div class="section-inner">
          <h2 class="section-title">Multiplayer</h2>
          <p class="section-desc">
            Create a room and invite friends, or join an open game.
          </p>
          <div class="mp-actions">
            <button @click="openCreateRoom" class="btn btn-create-room">
              <i class="fas fa-plus"></i> Create Room
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
            :registered="registered"
            :registeredRoomId="roomId"
            @select-room="selectRoom"
            @leave-room="leaveRoom"
          />
        </div>
      </section>

      <!-- Features Section -->
      <section class="section features-section">
        <div class="section-inner">
          <h2 class="section-title">Why Play Here?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon"><i class="fas fa-globe"></i></div>
              <h3>3 Languages</h3>
              <p>
                Full dictionaries for English, Dutch and Hungarian — including
                unique letter sets and scoring.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon"><i class="fas fa-users"></i></div>
              <h3>2–4 Players</h3>
              <p>
                Play solo against the computer or create a room for up to 4
                players in real time.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon"><i class="fas fa-bolt"></i></div>
              <h3>Real-Time</h3>
              <p>
                WebSocket-powered gameplay — instant turns, live board updates,
                no page reloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      <!-- Modals (keep outside sections) -->
      <PlayerTextInput
        v-if="showNameInput"
        :visible="showNameInput"
        placeholder="Enter your name"
        buttonText="Join"
        @confirm="confirmName"
        @cancel="closeNameInput"
      />
    </div>
    <div v-else class="table-container">
      <p v-if="roomCanceled" class="room-canceled-message">
        {{ roomCanceledPlayerName }} left the game, game is over
      </p>
      <div v-if="!gameOn" class="winner-celebration">
        <div class="winner-content">
          <p class="winner-title">{{ winnerLabel }}</p>
          <div class="winner-names">
            <div
              v-for="player in highestScorers"
              :key="player"
              class="winner-name"
            >
              {{ player }}
            </div>
          </div>
          <p v-if="winnerScore !== null" class="winner-score">
            Final score: {{ winnerScore }}
          </p>
        </div>
        <div v-if="showCelebration" class="fireworks" aria-hidden="true">
          <span class="firework firework-1"></span>
          <span class="firework firework-2"></span>
          <span class="firework firework-3"></span>
          <span class="firework firework-4"></span>
          <span class="firework firework-5"></span>
          <span class="firework firework-6"></span>
        </div>
      </div>
      <ScrabbleBoard
        :players="players"
        :scores="scores"
        :currentPlayer="name"
        :board="board"
        :socket="socket"
        :socketConnected="socketConnected"
        :lastPackedids="lastPackedids"
        :roomId="roomId"
        :gameOn="gameOn"
        @leave-room="leaveRoom"
        @exit-finished-game="exitFinishedGame"
      />

      <p v-if="gameOn">{{ remainingLetters }} letters remaining</p>
      <p v-if="gameOn && isActivePlayer">It's your turn!</p>
      <p v-if="gameOn && !isActivePlayer">
        Waiting for {{ currentTurnPlayer }}'s turn...
      </p>

      <div class="letters">
        <!-- <h3>Your Letters:</h3> -->
        <div class="letter-row">
          <LetterTile
            v-for="letter in letters"
            :key="letter.id"
            :id="letter.id"
            :letter="letter.letter"
            :points="letter.points"
            :isDraggable="isActivePlayer && gameOn"
          />
        </div>
      </div>
      <div class="actions">
        <div>
          <button
            v-if="isActivePlayer && gameOn"
            @click="passTurn"
            class="btn btn-control btn-pass"
          >
            <i class="fas fa-check"></i> Ready
          </button>
          <button
            v-if="isActivePlayer && gameOn"
            @click="cancelTurn"
            class="btn btn-control btn-cancel"
          >
            <i class="fas fa-times"></i> Cancel
          </button>
          <button
            v-if="isActivePlayer && gameOn"
            @click="changeAllLetters"
            class="btn btn-control btn-change"
          >
            <i class="fas fa-exchange-alt"></i> Change
          </button>
          <button
            v-if="isActivePlayer && gameOn"
            @click="shuffle"
            class="btn btn-control btn-shuffle"
          >
            <i class="fas fa-random"></i> Shuffle
          </button>
          <button
            v-if="gameOn"
            @click="highlightLastPlacedLetters"
            class="btn btn-control btn-highlight"
          >
            <i class="fas fa-highlighter"></i> Last
          </button>
        </div>
        <div>
          <button
            v-if="isActivePlayer && gameOn && remainingLetters === 0"
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
  import SiteHeader from "./components/SiteHeader.vue";
  import SiteFooter from "./components/SiteFooter.vue";

  import "@fortawesome/fontawesome-free/css/all.css";
  import "@fortawesome/fontawesome-free/js/all.js";

  export default {
    data() {
      return {
        name: null,
        registered: false,
        showGame: false,
        roomId: null,
        roomName: null,
        players: [],
        scores: [],
        gameOn: false,

        errorMessage: "",
        requiredPlayers: 2, // default valuee
        socket: null,
        socketConnected: false,
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
        showCelebration: false,
        celebrationTimer: null,
        roomCanceled: false,
        roomCanceledPlayerName: "",
      };
    },
    components: {
      ScrabbleBoard,
      LetterTile,
      RoomList,
      PlayerTextInput,
      SiteHeader,
      SiteFooter,
    },
    computed: {
      isActivePlayer() {
        return this.currentTurnPlayer === this.name;
      },
      playerName() {
        return this.name || sessionStorage.getItem("playerName") || "Player";
      },
      activeRoom() {
        return {
          roomName: sessionStorage.getItem("roomName"),
          player: sessionStorage.getItem("playerName"),
        };
      },
      highestScorers() {
        return this.findHighestScorers(this.scores);
      },
      winnerLabel() {
        return this.highestScorers.length > 1 ? "Winners" : "Winner";
      },
      winnerScore() {
        const values = Object.values(this.scores || {});
        if (!values.length) {
          return null;
        }
        return Math.max(...values);
      },
    },
    methods: {
      onSocketOpen() {
        this.socketConnected = true;
        this.reconnect();
      },
      onSocketClose() {
        this.socketConnected = false;
      },
      onSocketError() {
        this.socketConnected = false;
      },
      openCreateRoom() {
        this.showCreateRoomInput = true;
      },
      closeCreateRoom() {
        this.showCreateRoomInput = false;
      },
      createRoom(bot, bot_lang = null) {
        this.socket.send(
          JSON.stringify({
            type: bot ? "create-solo-game" : "create-game",
            playerCnt: Number(this.requiredPlayers),
            lang: bot ? bot_lang : this.selectedLanguage,
            name: this.newRoomName,
          }),
        );
        this.showCreateRoomInput = false;
      },
      joinGame(inputName) {
        if (this.selectedRoom) {
          this.socket.send(
            JSON.stringify({
              type: "join",
              name: inputName,
              roomId: this.selectedRoom,
            }),
          );
        }
      },
      selectRoom(id) {
        this.selectedRoom = id;
        // console.log(this.rooms);
        const selectedRoom = this.rooms.find((room) => room.roomId === id);

        if (selectedRoom && !this.registered) {
          this.showNameInput = true;
        }
      },
      confirmName(inputValue) {
        // if (inputValue) {
        // this.name = inputValue;
        this.showNameInput = false;
        this.joinGame(inputValue);
        // }
      },
      closeNameInput() {
        this.showNameInput = false;
      },
      leaveRoom() {
        this.socket.send(
          JSON.stringify({
            type: "leave-room",
          }),
        );
        this.exitFinishedGame();
      },
      exitFinishedGame() {
        sessionStorage.removeItem("roomId");
        sessionStorage.removeItem("roomName");
        sessionStorage.removeItem("playerName");
        this.registered = false;
        this.roomId = null;
        this.roomName = null;
        this.name = null;
        this.showGame = false;
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
      // fetchRooms() {
      //   fetch(process.env.VUE_APP_BASE_URL.replace("ws", "http") + "/rooms")
      //     .then((response) => response.json())
      //     .then((data) => {
      //       // console.log(data);
      //       this.rooms = data; // Convert rooms object to array
      //       // console.log(this.rooms);
      //     })
      //     .catch((error) => {
      //       console.error("Error fetching rooms:", error);
      //     });
      // },
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
      triggerWinnerCelebration() {
        this.showCelebration = true;
        clearTimeout(this.celebrationTimer);
        this.celebrationTimer = setTimeout(() => {
          this.showCelebration = false;
        }, 2600);
      },
    },
    sockets: {
      handleMessage(event) {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "players":
            this.players = data.players;
            // this.joined = true;

            break;
          case "rooms":
            this.rooms = data.rooms;

            break;

          case "registered":
            this.registered = true;
            this.roomId = data.roomId;
            this.roomName = data.roomName;
            this.name = data.name;

            // this.fetchRooms();
            break;

          case "new-player":
            this.name = data.name;
            sessionStorage.setItem("playerName", this.name);
            sessionStorage.setItem("roomId", data.roomId);
            sessionStorage.setItem("roomName", data.roomName);
            // this.fetchRooms();
            break;

          case "start-game":
            this.gameOn = true;
            this.showGame = true;
            this.roomId = data.roomId;
            this.roomCanceled = false;
            this.roomCanceledPlayerName = "";

            break;
          case "end-game":
            this.gameOn = false;

            sessionStorage.removeItem("playerName");
            sessionStorage.removeItem("roomId");
            sessionStorage.removeItem("roomName");
            // this.letters = data.letters;

            break;
          case "room-canceled":
            this.gameOn = false;
            this.roomCanceled = true;
            this.roomCanceledPlayerName = data.playerName || "A player";

            sessionStorage.removeItem("playerName");
            sessionStorage.removeItem("roomId");
            sessionStorage.removeItem("roomName");
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
            console.log(this.letters);
            break;
          case "update-score":
            console.log("scores", data.scores);
            this.scores = data.scores;
            break;
          case "remaining-letters":
            this.remainingLetters = data.remainingLetters;

            break;

          case "error":
            this.errorMessage = data.message;
            break;
          case "connection-success":
            console.log("connected");
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
      gameOn(newValue) {
        if (!newValue) {
          this.triggerWinnerCelebration();
        }
      },
    },
    created() {
      this.socket = new WebSocket(process.env.VUE_APP_BASE_URL);
      this.socketConnected = this.socket.readyState === WebSocket.OPEN;
      this.socket.onmessage = this.sockets.handleMessage.bind(this);
      this.socket.onopen = () => this.onSocketOpen();
      this.socket.onclose = () => this.onSocketClose();
      this.socket.onerror = () => this.onSocketError();
    },
    beforeUnmount() {
      this.stopFlashingTab();
      clearTimeout(this.celebrationTimer);
      if (this.socket) {
        this.socket.onopen = null;
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket.onmessage = null;
      }
    },
    mounted() {
      // this.fetchRooms();
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
    --table-padding: 12px;
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

  /* ===== Landing Page Layout ===== */
  .landing-page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Reconnect banner */
  .reconnect-banner {
    width: 100%;
    padding: 10px 24px;
    background: rgba(245, 158, 11, 0.1);
    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    margin-top: 60px;
  }

  .reconnect-inner {
    max-width: 1100px;
    margin: 0 auto;
    text-align: center;
  }

  /* Hero */
  .hero {
    padding: 140px 24px 60px;
    text-align: center;
  }

  .hero-content {
    max-width: 640px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: clamp(36px, 6vw, 56px);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin: 0 0 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: clamp(16px, 2.2vw, 19px);
    line-height: 1.65;
    color: #94a3b8;
    margin: 0;
    font-weight: 400;
  }

  .hero-subtitle strong {
    color: #f59e0b;
    font-weight: 600;
  }

  /* Sections */
  .section {
    padding: 48px 24px;
  }

  .section-inner {
    max-width: 820px;
    margin: 0 auto;
  }

  .section-title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 6px;
    color: #f1f5f9;
    text-align: center;
  }

  .section-desc {
    color: #64748b;
    font-size: 15px;
    text-align: center;
    margin: 0 0 28px;
    font-weight: 400;
  }

  /* Quick Play Cards */
  .quick-play-cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    max-width: 560px;
    margin: 0 auto;
  }

  .qp-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 28px 16px;
    border-radius: 16px;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.1);
    cursor: pointer;
    transition: all 0.25s ease;
    text-align: center;
  }

  .qp-card:hover {
    border-color: rgba(245, 158, 11, 0.45);
    background: rgba(30, 41, 59, 0.9);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }

  .qp-flag {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    object-fit: cover;
  }

  .qp-lang {
    font-size: 16px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .qp-action {
    font-size: 13px;
    font-weight: 600;
    color: #f59e0b;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .qp-card:hover .qp-action {
    opacity: 1;
  }

  /* Multiplayer Section */
  .multiplayer-section {
    padding-top: 20px;
  }

  .mp-actions {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .btn-create-room {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    padding: 14px 32px;
    font-size: 15px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-create-room:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
    transform: translateY(-2px);
  }

  /* Features Section */
  .features-section {
    padding-bottom: 60px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .feature-card {
    padding: 24px 20px;
    border-radius: 16px;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.08);
    text-align: center;
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.12);
    color: #818cf8;
    font-size: 18px;
  }

  .feature-card h3 {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 8px;
    color: #e2e8f0;
  }

  .feature-card p {
    font-size: 13px;
    line-height: 1.6;
    color: #64748b;
    margin: 0;
  }

  /* ===== Original join-container kept for compatibility ===== */
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
    padding: var(--table-padding) 0;
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

  .room-canceled-message {
    color: #fecaca !important;
    background: rgba(239, 68, 68, 0.16);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 10px;
    padding: 10px 12px;
    margin: 12px auto 8px;
    width: fit-content;
    max-width: calc(100% - 24px);
  }

  .winner-celebration {
    position: relative;
    margin: 14px auto 10px;
    width: min(92vw, 520px);
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(251, 191, 36, 0.35);
    background: radial-gradient(
        circle at 18% 18%,
        rgba(245, 158, 11, 0.25),
        transparent 40%
      ),
      radial-gradient(
        circle at 85% 15%,
        rgba(34, 197, 94, 0.2),
        transparent 40%
      ),
      linear-gradient(145deg, rgba(22, 31, 49, 0.95), rgba(16, 24, 38, 0.9));
    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.35),
      inset 0 0 32px rgba(245, 158, 11, 0.08);
  }

  .winner-content {
    padding: 18px 18px 16px;
    position: relative;
    z-index: 2;
  }

  .winner-title {
    margin: 0;
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #fcd34d;
    font-weight: 800;
  }

  .winner-names {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }

  .winner-name {
    font-size: clamp(20px, 4.2vw, 30px);
    font-weight: 800;
    color: #f8fafc;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(71, 85, 105, 0.45);
    border: 1px solid rgba(148, 163, 184, 0.3);
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .winner-score {
    margin: 12px 0 0;
    color: #e2e8f0;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.03em;
  }

  .fireworks {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  .firework {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    opacity: 0;
    transform: scale(0.2);
    animation: firework-burst 900ms ease-out forwards;
  }

  .firework-1 {
    top: 18%;
    left: 14%;
    background: #f59e0b;
  }

  .firework-2 {
    top: 28%;
    left: 82%;
    background: #f43f5e;
    animation-delay: 120ms;
  }

  .firework-3 {
    top: 12%;
    left: 52%;
    background: #22c55e;
    animation-delay: 220ms;
  }

  .firework-4 {
    top: 62%;
    left: 76%;
    background: #38bdf8;
    animation-delay: 320ms;
  }

  .firework-5 {
    top: 66%;
    left: 24%;
    background: #facc15;
    animation-delay: 420ms;
  }

  .firework-6 {
    top: 40%;
    left: 50%;
    background: #fb7185;
    animation-delay: 500ms;
  }

  @keyframes firework-burst {
    0% {
      opacity: 0;
      box-shadow: 0 0 0 0 currentColor;
      transform: translate(-50%, -50%) scale(0.15);
    }
    18% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(0.9);
      box-shadow: 0 -18px 0 0 currentColor, 12px -12px 0 0 currentColor,
        18px 0 0 0 currentColor, 12px 12px 0 0 currentColor,
        0 18px 0 0 currentColor, -12px 12px 0 0 currentColor,
        -18px 0 0 0 currentColor, -12px -12px 0 0 currentColor;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.35);
      box-shadow: 0 -32px 0 -2px currentColor, 22px -22px 0 -2px currentColor,
        32px 0 0 -2px currentColor, 22px 22px 0 -2px currentColor,
        0 32px 0 -2px currentColor, -22px 22px 0 -2px currentColor,
        -32px 0 0 -2px currentColor, -22px -22px 0 -2px currentColor;
    }
  }

  @media (max-width: 632px) {
    .winner-content {
      padding: 14px 12px;
    }

    .winner-name {
      font-size: clamp(17px, 5vw, 24px);
      padding: 7px 11px;
    }
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
    flex-direction: row;
    width: 100%;
    margin-bottom: 12px;
    gap: 12px;
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
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-reconnect:hover {
    background: linear-gradient(135deg, #d97706, #dc2626);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
    transform: translateY(-1px);
  }

  .btn-reconnect i {
    margin-right: 6px;
  }

  /* Responsive landing page */
  @media (max-width: 632px) {
    .hero {
      padding: 100px 16px 40px;
    }

    .section {
      padding: 32px 16px;
    }

    .quick-play-cards {
      grid-template-columns: 1fr;
      max-width: 320px;
      margin: 0 auto;
    }

    .features-grid {
      grid-template-columns: 1fr;
      max-width: 360px;
      margin: 0 auto;
    }
  }

  @media (min-width: 633px) and (max-width: 768px) {
    .quick-play-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .features-grid {
      grid-template-columns: repeat(3, 1fr);
    }
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

  .registered-row {
    max-width: 820px;
    margin: 0 auto 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .registered-message {
    color: #cbd5e1;
    text-align: left;
    font-size: 14px;
    margin: 0;
  }

  .btn-unjoin {
    width: auto;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 13px;
    background: rgba(239, 68, 68, 0.15);
    color: #fecaca;
    border: 1px solid rgba(239, 68, 68, 0.45);
  }

  .btn-unjoin:hover {
    background: rgba(239, 68, 68, 0.25);
    color: #fee2e2;
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.25);
  }

  @media (max-width: 632px) {
    .registered-row {
      flex-direction: column;
      align-items: stretch;
    }

    .registered-message {
      text-align: center;
    }
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
    padding: 16px;
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
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: min(100%, 760px);
    max-width: 760px;
    gap: 14px;
    color: #e2e8f0;
  }

  .language-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
    width: 100%;
  }

  .language-options label,
  .player-options label {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    width: 100%;
    min-height: 48px;
    border-radius: 12px;
    padding: 10px 12px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(30, 41, 59, 0.75);
    transition: all 0.2s ease;
  }

  .language-options input[type="radio"],
  .player-options input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .language-options input[type="radio"] + label:hover,
  .player-options input[type="radio"] + label:hover {
    border-color: rgba(129, 140, 248, 0.55);
    background: rgba(51, 65, 85, 0.75);
  }

  .language-options input[type="radio"]:checked + label,
  .player-options input[type="radio"]:checked + label {
    border-color: rgba(99, 102, 241, 0.95);
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.22),
      rgba(139, 92, 246, 0.2)
    );
    color: #eef2ff;
    box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.45);
  }

  .flag-icon {
    width: 20px;
    height: 20px;
    margin-right: 4px;
    border-radius: 2px;
  }

  .player-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    width: 100%;
  }

  .create-room-container .btn {
    margin: 0;
  }

  .create-room-container .btn-cancel {
    margin-top: -2px;
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

  @media (max-width: 632px) {
    .create-room-container {
      padding: 18px;
      border-radius: 16px;
      gap: 12px;
    }

    .language-options,
    .player-options {
      grid-template-columns: 1fr;
    }
  }
</style>
