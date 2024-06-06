<template>
  <div class="board">
    <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        :class="['cell', cell]"
      >
        {{ getCellText(cell) }}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "ScrabbleBoard",
    data() {
      return {
        board: [
          [
            "triple-word",
            "",
            "",
            "double-letter",
            "",
            "",
            "",
            "triple-word",
            "",
            "",
            "",
            "double-letter",
            "",
            "",
            "triple-word",
          ],
          [
            "",
            "double-word",
            "",
            "",
            "",
            "triple-letter",
            "",
            "",
            "",
            "triple-letter",
            "",
            "",
            "",
            "double-word",
            "",
          ],
          [
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "double-letter",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-word",
            "",
            "",
          ],
          [
            "double-letter",
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-word",
            "",
            "",
            "double-letter",
          ],
          [
            "",
            "",
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "",
          ],
          [
            "",
            "triple-letter",
            "",
            "",
            "",
            "triple-letter",
            "",
            "",
            "",
            "triple-letter",
            "",
            "",
            "",
            "triple-letter",
            "",
          ],
          [
            "",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-letter",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-letter",
            "",
            "",
          ],
          [
            "triple-word",
            "",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "double-letter",
            "",
            "",
            "triple-word",
          ],
          [
            "",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-letter",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-letter",
            "",
            "",
          ],
          [
            "",
            "triple-letter",
            "",
            "",
            "",
            "triple-letter",
            "",
            "",
            "",
            "triple-letter",
            "",
            "",
            "",
            "triple-letter",
            "",
          ],
          [
            "",
            "",
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "",
          ],
          [
            "double-letter",
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-word",
            "",
            "",
            "double-letter",
          ],
          [
            "",
            "",
            "double-word",
            "",
            "",
            "",
            "double-letter",
            "",
            "double-letter",
            "",
            "",
            "",
            "double-word",
            "",
            "",
          ],
          [
            "",
            "double-word",
            "",
            "",
            "",
            "triple-letter",
            "",
            "",
            "",
            "triple-letter",
            "",
            "",
            "",
            "double-word",
            "",
          ],
          [
            "triple-word",
            "",
            "",
            "double-letter",
            "",
            "",
            "",
            "triple-word",
            "",
            "",
            "",
            "double-letter",
            "",
            "",
            "triple-word",
          ],
        ],
      };
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
    },
  };
</script>

<style scoped>
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
    background-color: #85ad82;
    text-align: center;
    font-size: 10px;
  }

  .triple-word {
    background-color: red;
    color: white;
  }

  .double-word {
    background-color: yellow;
  }

  .triple-letter {
    background-color: rgb(79, 79, 209);
    color: white;
  }

  .double-letter {
    background-color: lightblue;
  }
</style>
