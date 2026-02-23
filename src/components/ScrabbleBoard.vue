<template>
  <div class="player-container">
    <div class="player" v-for="player of players" :key="player">
      <div class="player-name">{{ player }}</div>
      <div class="player-score">{{ scores[player] }}</div>
    </div>
  </div>

  <div class="board">
    <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        :class="['cell', cell.text]"
        @dragover.prevent
        @drop="handleDrop($event, rowIndex, colIndex)"
        @touchdrop="handleTouchDrop($event, rowIndex, colIndex)"
      >
        <!-- {{ getCellText(cell) }} -->
        <LetterTile
          v-if="cell.letter != null"
          :id="cell.id"
          :letter="cell.letter"
          :points="cell.points"
          :confirmed="cell.confirmed"
          :lastPacked="lastPackedids.includes(cell.id)"
          :isOnBoard="true"
        />
        <span v-else>{{ getCellText(cell.text) }}</span>
      </div>
    </div>
  </div>
  <PlayerTextInput
    v-if="showWildInput"
    :visible="showWildInput"
    placeholder="Enter a letter"
    buttonText="Submit"
    @confirm="setWild"
  />
</template>

<script>
  import LetterTile from "./LetterTile.vue";

  export default {
    // name: "ScrabbleBoard"},
    components: {
      LetterTile,
    },
    props: {
      players: Array,
      scores: Object,
      currentPlayer: String,
      isActivePlayer: Boolean,
      board: Array,
      socket: Object,
      lastPackedids: Array,
      roomId: Number,
    },
    data() {
      return {
        showWildInput: false,
        desiredLetter: "",
      };
    },
    computed: {
      boardData() {
        return {
          players: this.players,
          currentPlayer: this.currentPlayer,
          isActivePlayer: this.isActivePlayer,
        };
      },
      currentPlayerIndex() {
        return this.players.indexOf(this.currentPlayer);
      },
    },
    methods: {
      setWild(letter) {
        this.desiredLetter = letter;
        this.showWildInput = false;
      },
      getCellText(cell) {
        switch (cell) {
          case "triple-word":
            return "TRIPLE\nWORD";
          case "double-word":
            return "DOUBLE\nWORD";
          case "triple-letter":
            return "TRIPLE\nLETTER";
          case "double-letter":
            return "DOUBLE\nLETTER";
          default:
            return "";
        }
      },
      handleDrop(event, rowIndex, colIndex) {
        const id = event.dataTransfer.getData("id");
        const isWild = event.dataTransfer.getData("isWild") === "true";

        if (isWild) {
          const desiredLetter = prompt(
            "Enter the desired letter for the wild card:",
          ).toUpperCase();
          if (!desiredLetter || desiredLetter.length > 2) {
            alert("Invalid letter. Please enter a single letter.");
            return;
          }
          this.socket.send(
            JSON.stringify({
              type: "update-board-cell",
              rowIndex,
              colIndex,
              id,
              desiredLetter,
              roomId: this.roomId,
            }),
          );
        } else {
          this.socket.send(
            JSON.stringify({
              type: "update-board-cell",
              rowIndex,
              colIndex,
              id,
              roomId: this.roomId,
            }),
          );
        }
        // Emit the updated cell information to the parent component
      },
      handleTouchDrop(event, rowIndex, colIndex) {
        // Get drag data from the custom event detail
        const dragData = event.detail?.dragData;
        if (!dragData) return;

        const id = dragData.id;
        const isWild = dragData.isWild;

        if (isWild) {
          const desiredLetter = prompt(
            "Enter the desired letter for the wild card:",
          )?.toUpperCase();
          if (!desiredLetter || desiredLetter.length > 2) {
            alert("Invalid letter. Please enter a single letter.");
            return;
          }
          this.socket.send(
            JSON.stringify({
              type: "update-board-cell",
              rowIndex,
              colIndex,
              id,
              desiredLetter,
              roomId: this.roomId,
            }),
          );
        } else {
          this.socket.send(
            JSON.stringify({
              type: "update-board-cell",
              rowIndex,
              colIndex,
              id,
              roomId: this.roomId,
            }),
          );
        }
      },
    },
  };
</script>

<style scoped>
  .board-container {
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
    justify-items: center;
  }

  .player-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    font-family: "Inter", sans-serif;
    gap: 6px;
  }

  .player {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    padding: 10px 16px;
    background: rgba(67, 92, 132, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 10px;
    width: 280px;
    max-width: 300px;
    transition: all 0.2s ease;
  }

  .player:hover {
    background: rgba(30, 41, 59, 0.9);
  }

  .player-name {
    color: #e2e8f0;
  }

  .player-score {
    color: #a78bfa;
    font-weight: 700;
    font-size: 16px;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(15, 1fr);
    grid-template-rows: repeat(15, 1fr);
    gap: 1px;
    background: linear-gradient(
      145deg,
      rgba(15, 23, 42, 0.8),
      rgba(0, 0, 0, 0.5)
    );
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .row {
    display: contents;
  }

  .cell {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #6aab74;
    text-align: center;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.03em;
    border-radius: 3px;
    transition: background-color 0.15s ease;
  }

  .cell span {
    white-space: pre-line;
    line-height: 1.1;
    opacity: 0.7;
  }

  .triple-word {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: rgba(255, 255, 255, 0.9);
  }

  .double-word {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: rgba(0, 0, 0, 0.6);
  }

  .triple-letter {
    background: linear-gradient(135deg, #818cf8, #6366f1);
    color: rgba(255, 255, 255, 0.9);
  }

  .double-letter {
    background: linear-gradient(135deg, #67e8f9, #22d3ee);
    color: rgba(0, 0, 0, 0.5);
  }

  .middle-row {
    display: flex;
    flex-direction: row;
  }

  .highlight {
    background-color: rgba(99, 102, 241, 0.3);
  }
</style>
