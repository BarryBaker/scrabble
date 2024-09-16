<template>
  <div class="player" v-for="player of players" :key="player">
    <div class="player-player">{{ player }}</div>
    <div>{{ scores[player] }}</div>
  </div>

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
        const id = event.dataTransfer.getData("id");
        const isWild = event.dataTransfer.getData("isWild") === "true";

        if (isWild) {
          const desiredLetter = prompt(
            "Enter the desired letter for the wild card:"
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
            })
          );
        } else {
          this.socket.send(
            JSON.stringify({
              type: "update-board-cell",
              rowIndex,
              colIndex,
              id,
              roomId: this.roomId,
            })
          );
        }
        // Emit the updated cell information to the parent component
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
    display: flex;
    flex-direction: row;
  }
  .player-player {
    margin-right: 20px;
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
  .highlight {
    background-color: lightblue;
  }
</style>
