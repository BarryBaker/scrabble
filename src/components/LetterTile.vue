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
    @dragend="handleDragEnd"
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
      handleInvalidDrop(event) {
        if (event.detail?.id == this.id) {
          this.isDragging = false;
        }
      },
      handleDragStart(event) {
        // Delay hiding the source tile until after the drag image is captured.
        setTimeout(() => {
          this.isDragging = true;
        }, 0);

        event.dataTransfer.setData("id", this.id);
        event.dataTransfer.setData("isWild", this.letter === "");
      },
      handleDragEnd(event) {
        // Reset only when no valid drop happened.
        if (event.dataTransfer?.dropEffect === "none") {
          this.isDragging = false;
        }
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
        this.dragGhost.style.backgroundColor = "#fde68a";
        this.dragGhost.style.border = "none";
        this.dragGhost.style.borderRadius = "8px";
        this.dragGhost.style.position = "fixed";
        this.dragGhost.style.pointerEvents = "none";
        this.dragGhost.style.zIndex = "10000";
        this.dragGhost.style.opacity = "0.85";
        this.dragGhost.style.fontFamily = "Inter, sans-serif";
        this.dragGhost.style.fontWeight = "bold";
        this.dragGhost.style.fontSize = "22px";
        this.dragGhost.style.display = "flex";
        this.dragGhost.style.alignItems = "center";
        this.dragGhost.style.justifyContent = "center";
        this.dragGhost.style.color = "#1e293b";
        this.dragGhost.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";

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

          // Broadcast the current touch-hovered board cell for live highlighting.
          const element = document.elementFromPoint(touch.clientX, touch.clientY);
          let cellElement = element;
          while (cellElement && !cellElement.classList.contains("cell")) {
            cellElement = cellElement.parentElement;
          }

          window.dispatchEvent(
            new CustomEvent("touchdragover", {
              detail: { cellElement },
            }),
          );
        }
      },
      handleTouchEnd(event) {
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
        } else {
          // Invalid drop: restore the original tile in the rack.
          this.isDragging = false;
        }

        // Clear drag data
        window.dragData = null;
        window.dispatchEvent(
          new CustomEvent("touchdragover", {
            detail: { cellElement: null },
          }),
        );
      },
    },
    mounted() {
      window.addEventListener("tile-drop-invalid", this.handleInvalidDrop);
    },
    beforeUnmount() {
      window.removeEventListener("tile-drop-invalid", this.handleInvalidDrop);
    },
  };
</script>

<style scoped>
  .tile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--hand-tile-size);
    height: var(--hand-tile-size);
    margin: 3px;
    background: linear-gradient(145deg, #fef3c7, #fde68a);
    border: none;
    border-radius: var(--hand-tile-radius);
    position: relative;
    font-family: "Inter", sans-serif;
    font-weight: 700;
    font-size: var(--hand-tile-font);
    text-align: center;
    vertical-align: middle;
    line-height: var(--hand-tile-size);
    color: #1e293b;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    transition: all 0.15s ease;
    cursor: grab;
  }

  .tile:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }

  .boardTile {
    width: var(--board-tile-size);
    height: var(--board-tile-size);
    margin: 0;
    background: linear-gradient(145deg, #fef3c7, #fde68a);
    border: none;
    border-radius: var(--board-tile-radius);
    font-size: var(--board-tile-font);
    line-height: var(--board-tile-size);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: default;
  }

  .boardTile:hover {
    transform: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .unconfirmed {
    background: linear-gradient(145deg, #fecaca, #fca5a5);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .lastPacked {
    background: linear-gradient(145deg, #c4b5fd, #a78bfa);
    box-shadow: 0 2px 12px rgba(139, 92, 246, 0.4);
  }

  .letter {
    display: block;
    color: #1e293b;
  }

  .points {
    position: absolute;
    top: 1px;
    right: 2px;
    font-size: var(--points-font);
    font-weight: 600;
    color: #64748b;
  }

  .dragging {
    visibility: hidden;
  }
</style>
