<template>
  <div class="player top-player" v-if="topPlayer">{{ topPlayer }}</div>
  <div class="player right-player" v-if="rightPlayer">{{ rightPlayer }}</div>
  <div class="player left-player" v-if="leftPlayer">{{ leftPlayer }}</div>

  <div class="board">
    <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        :class="['cell', cell.text]"
        @dragover.prevent
        @drop="handleDrop($event, rowIndex, colIndex)"
      >
        <!-- {{ getCellText(cell) }} -->
        <LetterTile
          v-if="cell.letter"
          :letter="cell.letter"
          :points="cell.points"
        />
        <span v-else>{{ getCellText(cell.text) }}</span>
      </div>
    </div>
  </div>

  <div class="player bottom-player">{{ currentPlayer }}</div>
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
      currentPlayer: String,
      isActivePlayer: Boolean,
      board: Array,
    },
    data() {
      return {
        // board: [
        //   // Data from server
        // ],
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
      topPlayer() {
        return this.players[(this.currentPlayerIndex + 1) % 4];
      },
      leftPlayer() {
        return this.players[(this.currentPlayerIndex + 3) % 4];
      },
      rightPlayer() {
        return this.players[(this.currentPlayerIndex + 2) % 4];
      },
    },
    methods: {
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
        const letterData = JSON.parse(event.dataTransfer.getData("letterData"));
        const updatedCell = {
          letter: letterData.letter,
          points: letterData.points,
          text: this.board[rowIndex][colIndex].text, // Preserve the original cell text
        };

        // Emit the updated cell information to the parent component
        this.$emit("update-board-cell", {
          rowIndex,
          colIndex,
          updatedCell,
          letter: letterData.letter,
        });
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
  .player {
    font-size: 14px;
    font-weight: bold;
  }
  .top-player {
    grid-row: 1;
    grid-column: 2;
  }
  .left-player {
    grid-row: 2;
    grid-column: 1;
  }
  .right-player {
    grid-row: 2;
    grid-column: 3;
  }
  .bottom-player {
    grid-row: 3;
    grid-column: 2;
  }
  .board {
    display: grid;
    grid-template-columns: repeat(15, 1fr);
    grid-template-rows: repeat(15, 1fr);
    gap: 2px;
    background-color: #ffffff;
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
    border: 1px solid #ddd;
    background-color: #89cd8b;
    text-align: center;
    font-size: 10px;
  }

  .triple-word {
    background-color: rgb(252, 63, 63);
    color: white;
  }

  .double-word {
    background-color: rgb(255, 255, 163);
  }

  .triple-letter {
    background-color: rgb(126, 126, 255);
    color: white;
  }

  .double-letter {
    background-color: rgb(196, 224, 233);
  }
  .middle-row {
    display: flex;
    flex-direction: row;
  }
</style>
