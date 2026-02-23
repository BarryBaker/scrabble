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
        dragGhost: null,
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

        // Create a visual ghost element that follows the touch
        const rect = this.$el.getBoundingClientRect();
        this.dragGhost = document.createElement("div");
        this.dragGhost.className = "drag-ghost";
        this.dragGhost.innerHTML = `
          <span class="letter">${this.letter}</span>
          <span class="points">${this.points}</span>
        `;
        this.dragGhost.style.width = rect.width + "px";
        this.dragGhost.style.height = rect.height + "px";
        this.dragGhost.style.backgroundColor = "#f5deb3";
        this.dragGhost.style.border = "2px solid #000";
        this.dragGhost.style.borderRadius = "5px";
        this.dragGhost.style.position = "fixed";
        this.dragGhost.style.pointerEvents = "none";
        this.dragGhost.style.zIndex = "10000";
        this.dragGhost.style.opacity = "0.8";
        this.dragGhost.style.fontFamily = "Arial, sans-serif";
        this.dragGhost.style.fontWeight = "bold";
        this.dragGhost.style.fontSize = "24px";
        this.dragGhost.style.display = "flex";
        this.dragGhost.style.alignItems = "center";
        this.dragGhost.style.justifyContent = "center";
        this.dragGhost.style.color = "#000";

        document.body.appendChild(this.dragGhost);
      },
      handleTouchMove(event) {
        if (this.isDragging && this.dragGhost) {
          event.preventDefault();
          // Update ghost position to follow the touch
          const touch = event.touches[0];
          const ghostSize = 50; // Approximate size, centering on finger
          this.dragGhost.style.left = touch.clientX - ghostSize / 2 + "px";
          this.dragGhost.style.top = touch.clientY - ghostSize / 2 + "px";
        }
      },
      handleTouchEnd(event) {
        this.isDragging = false;

        // Clean up ghost element
        if (this.dragGhost) {
          this.dragGhost.remove();
          this.dragGhost = null;
        }

        if (!window.dragData) return;

        // Get the touch coordinates
        const touch = event.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        // Find the cell element
        let cellElement = element;
        while (cellElement && !cellElement.classList.contains("cell")) {
          cellElement = cellElement.parentElement;
        }

        if (cellElement) {
          // Emit custom event with drop data
          const dropEvent = new CustomEvent("touchdrop", {
            detail: {
              dragData: window.dragData,
              cellElement: cellElement,
            },
            bubbles: true,
          });
          cellElement.dispatchEvent(dropEvent);
        }

        // Clear drag data
        window.dragData = null;
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
