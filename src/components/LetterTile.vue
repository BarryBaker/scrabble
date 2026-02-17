<template>
  <div
    class="tile"
    :class="{
      boardTile: isOnBoard,
      unconfirmed: !confirmed,
      lastPacked: lastPacked,
      dragging: isDragging,
    }"
    :draggable="isDraggable"
    @dragstart="handleDragStart"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <span class="letter">{{ letter }}</span>
    <span class="points">{{ points }}</span>
  </div>
</template>

<script>
  export default {
    name: "LetterTile",

    props: {
      id: {
        type: Number,
        required: true,
      },
      letter: {
        type: String,
        required: true,
      },
      points: {
        type: Number,
        required: true,
      },
      confirmed: {
        type: Boolean,
        default: false,
      },
      isOnBoard: {
        type: Boolean,
        default: false,
      },
      isDraggable: {
        type: Boolean,
        default: false,
      },
      lastPacked: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        isDragging: false,
      };
    },
    computed: {},
    methods: {
      handleDragStart(event) {
        event.dataTransfer.setData("id", this.id);
        event.dataTransfer.setData("isWild", this.letter === "");
      },
      handleTouchStart() {
        if (!this.isDraggable) return;
        this.isDragging = true;
        // Store drag data in window for access in drop handler
        window.dragData = {
          id: this.id,
          isWild: this.letter === "",
        };
      },
      handleTouchMove(event) {
        if (this.isDragging) {
          event.preventDefault();
        }
      },
      handleTouchEnd() {
        this.isDragging = false;
      },
    },
  };
</script>

<style scoped>
  .tile {
    display: inline-block;
    width: 50px;
    height: 50px;
    margin: 5px;
    background-color: #f5deb3;
    border: 2px solid #000;
    border-radius: 5px;
    position: relative;
    font-family: Arial, sans-serif;
    font-weight: bold;
    font-size: 24px;
    text-align: center;
    vertical-align: middle;
    line-height: 50px;
    color: #000; /* Ensure text color is black */
  }

  .boardTile {
    width: 38px;
    height: 38px;
    margin: 1px;
    background-color: #ffebcd; /* Different color for board tiles */
    border: 1px solid #000;
    border-radius: 2px;
    font-size: 18px;
    line-height: 38px;
  }
  .unconfirmed {
    background-color: #ffcccc; /* Color for unconfirmed letters */
  }
  .lastPacked {
    background-color: #fc9797; /* Color for unconfirmed letters */
  }
  .letter {
    display: block;
    color: #000; /* Ensure letter color is black */
  }
  .points {
    position: absolute;
    top: 1px;
    right: 1px;
    font-size: 12px;
    color: #000; /* Ensure points color is black */
  }

  .dragging {
    opacity: 0.7;
    background-color: #d4a574;
  }
</style>
