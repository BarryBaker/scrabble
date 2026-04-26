<template>
  <div v-if="!socket">Connecting...</div>

  <template v-else>
    <div class="player-container">
      <div class="player-grid">
        <div
          v-for="(slot, index) in playerGridSlots"
          :key="slot?.name ?? `empty-${index}`"
          :class="['player-slot', `player-slot-${index + 1}`]"
        >
          <div v-if="slot" class="player">
            <div class="player-name">{{ slot.name }}</div>
            <div class="player-score">{{ scores[slot.name] }}</div>
          </div>
        </div>
      </div>
      <div class="player-controls">
        <button class="leave-room-btn" @click="handleTopAction">
          {{ !gameOn ? "Exit game" : "Leave room" }}
        </button>
      </div>
    </div>

    <div class="board">
      <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :class="[
            'cell',
            cell.text,
            isDropTarget(rowIndex, colIndex) ? 'drop-target' : '',
          ]"
          :data-row-index="rowIndex"
          :data-col-index="colIndex"
          @dragover.prevent="handleDragOver(rowIndex, colIndex)"
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
    <transition name="fade">
      <div
        v-if="wildModal.visible"
        class="wild-letter-overlay"
        @click.self="closeWildModal"
      >
        <div class="wild-letter-modal" role="dialog" aria-modal="true">
          <h3>Place the empty tile</h3>
          <p class="wild-letter-subtitle">
            Pick the letter(s) the wild card should act as.
          </p>
          <input
            class="wild-letter-input"
            v-model="wildModal.inputValue"
            placeholder=""
            maxlength="2"
            @keyup.enter="confirmWildLetter"
            @keyup.esc="closeWildModal"
            autocomplete="off"
            autocapitalize="characters"
            ref="wildInput"
          />
          <p v-if="wildModal.errorMessage" class="wild-letter-error">
            {{ wildModal.errorMessage }}
          </p>
          <div class="wild-letter-actions">
            <button class="btn btn-primary" @click="confirmWildLetter">
              Confirm
            </button>
            <button class="btn btn-secondary" @click="closeWildModal">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="leaveModalVisible"
        class="leave-room-overlay"
        @click.self="closeLeaveModal"
      >
        <div class="leave-room-modal" role="dialog" aria-modal="true">
          <h3>Leave room?</h3>
          <p class="leave-room-message">
            Are you sure you want to leave the room? The game will be finished.
          </p>
          <div class="leave-room-actions">
            <button class="btn btn-primary" @click="confirmLeaveRoom">
              Yes
            </button>
            <button class="btn btn-secondary" @click="closeLeaveModal">
              No
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
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
      gameOn: Boolean,
    },
    data() {
      return {
        dropTarget: {
          rowIndex: null,
          colIndex: null,
        },
        leaveModalVisible: false,
        wildModal: {
          visible: false,
          rowIndex: null,
          colIndex: null,
          tileId: null,
          inputValue: "",
          errorMessage: "",
        },
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
      playerGridSlots() {
        const slotMap = {
          2: [this.players[0], null, this.players[1], null],
          3: [this.players[0], this.players[1], this.players[2], null],
          4: [
            this.players[0],
            this.players[1],
            this.players[2],
            this.players[3],
          ],
        };

        return (slotMap[this.players.length] || this.players)
          .slice(0, 4)
          .map((player) => (player ? { name: player } : null));
      },
      currentPlayerIndex() {
        return this.players.indexOf(this.currentPlayer);
      },
    },
    methods: {
      isDropTarget(rowIndex, colIndex) {
        return (
          this.dropTarget.rowIndex === rowIndex &&
          this.dropTarget.colIndex === colIndex
        );
      },
      setDropTarget(rowIndex, colIndex) {
        this.dropTarget.rowIndex = rowIndex;
        this.dropTarget.colIndex = colIndex;
      },
      clearDropTarget() {
        this.dropTarget.rowIndex = null;
        this.dropTarget.colIndex = null;
      },
      handleDragOver(rowIndex, colIndex) {
        this.setDropTarget(rowIndex, colIndex);
      },
      handleTouchDragOver(event) {
        const cellElement = event.detail?.cellElement;
        if (!cellElement) {
          this.clearDropTarget();
          return;
        }

        const rowIndex = Number(cellElement.dataset.rowIndex);
        const colIndex = Number(cellElement.dataset.colIndex);

        if (Number.isNaN(rowIndex) || Number.isNaN(colIndex)) {
          this.clearDropTarget();
          return;
        }

        this.setDropTarget(rowIndex, colIndex);
      },
      openLeaveModal() {
        this.leaveModalVisible = true;
      },
      handleTopAction() {
        if (!this.gameOn) {
          this.$emit("exit-finished-game");
          return;
        }
        this.openLeaveModal();
      },
      closeLeaveModal() {
        this.leaveModalVisible = false;
      },
      confirmLeaveRoom() {
        this.closeLeaveModal();
        this.$emit("leave-room");
      },
      openWildModal(rowIndex, colIndex, tileId) {
        this.wildModal.visible = true;
        this.wildModal.rowIndex = rowIndex;
        this.wildModal.colIndex = colIndex;
        this.wildModal.tileId = tileId;
        this.wildModal.inputValue = "";
        this.wildModal.errorMessage = "";
        this.$nextTick(() => {
          this.$refs.wildInput?.focus();
        });
      },
      closeWildModal(restoreTile = true) {
        if (restoreTile && this.wildModal.tileId) {
          window.dispatchEvent(
            new CustomEvent("tile-drop-invalid", {
              detail: { id: this.wildModal.tileId },
            }),
          );
        }

        this.wildModal.visible = false;
        this.wildModal.rowIndex = null;
        this.wildModal.colIndex = null;
        this.wildModal.tileId = null;
        this.wildModal.inputValue = "";
        this.wildModal.errorMessage = "";
      },
      confirmWildLetter() {
        const letter = this.wildModal.inputValue?.trim().toUpperCase();
        const letterPattern = /^\p{Lu}+$/u;
        if (!letter || letter.length > 2 || !letterPattern.test(letter)) {
          this.wildModal.errorMessage =
            "Enter one to two uppercase letters (e.g. S, SZ, CS).";
          return;
        }

        const { rowIndex, colIndex, tileId } = this.wildModal;
        if (rowIndex === null || colIndex === null || !tileId) {
          this.closeWildModal();
          return;
        }

        this.socket.send(
          JSON.stringify({
            type: "update-board-cell",
            rowIndex,
            colIndex,
            id: tileId,
            desiredLetter: letter,
            roomId: this.roomId,
          }),
        );

        this.closeWildModal(false);
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
        this.clearDropTarget();
        const id = event.dataTransfer.getData("id");
        const isWild = event.dataTransfer.getData("isWild") === "true";
        const targetCell = this.board?.[rowIndex]?.[colIndex];

        if (targetCell?.letter != null) {
          window.dispatchEvent(
            new CustomEvent("tile-drop-invalid", {
              detail: { id },
            }),
          );
          return;
        }

        if (isWild) {
          this.openWildModal(rowIndex, colIndex, id);
          return;
        }
        this.socket.send(
          JSON.stringify({
            type: "update-board-cell",
            rowIndex,
            colIndex,
            id,
            roomId: this.roomId,
          }),
        );
        // Emit the updated cell information to the parent component
      },
      handleTouchDrop(event, rowIndex, colIndex) {
        this.clearDropTarget();
        // Get drag data from the custom event detail
        const dragData = event.detail?.dragData;
        if (!dragData) return;

        const id = dragData.id;
        const isWild = dragData.isWild;
        const targetCell = this.board?.[rowIndex]?.[colIndex];

        if (targetCell?.letter != null) {
          window.dispatchEvent(
            new CustomEvent("tile-drop-invalid", {
              detail: { id },
            }),
          );
          return;
        }

        if (isWild) {
          this.openWildModal(rowIndex, colIndex, id);
          return;
        }
        this.socket.send(
          JSON.stringify({
            type: "update-board-cell",
            rowIndex,
            colIndex,
            id,
            roomId: this.roomId,
          }),
        );
      },
    },
    mounted() {
      window.addEventListener("dragend", this.clearDropTarget);
      window.addEventListener("drop", this.clearDropTarget);
      window.addEventListener("touchdragover", this.handleTouchDragOver);
      window.addEventListener("touchend", this.clearDropTarget);
    },
    beforeUnmount() {
      window.removeEventListener("dragend", this.clearDropTarget);
      window.removeEventListener("drop", this.clearDropTarget);
      window.removeEventListener("touchdragover", this.handleTouchDragOver);
      window.removeEventListener("touchend", this.clearDropTarget);
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
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-family: "Inter", sans-serif;
    gap: 6px;
  }

  .player-grid {
    display: grid;
    width: 80%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 14px;
  }

  .player-slot {
    /* width: 45%; */
    /* max-width: 300px; */
  }

  .player-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 4px;
  }

  .leave-room-btn {
    border: 1px solid rgba(148, 163, 184, 0.45);
    background: rgba(30, 41, 59, 0.55);
    height: 50%;
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 999px;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .leave-room-btn:hover {
    background: rgba(51, 65, 85, 0.8);
    border-color: rgba(226, 232, 240, 0.55);
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
    width: 100%;
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
    grid-template-columns: repeat(15, var(--cell-size));
    grid-template-rows: repeat(15, var(--cell-size));
    gap: 1px;
    background: linear-gradient(
      145deg,
      rgba(15, 23, 42, 0.8),
      rgba(0, 0, 0, 0.5)
    );
    border-radius: var(--board-radius);
    /* padding: var(--board-padding); */
    /* box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.4); */
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .row {
    display: contents;
  }

  .cell {
    width: var(--cell-size);
    height: var(--cell-size);
    display: flex;
    justify-content: center;
    align-items: center;
    background: #6aab74;
    text-align: center;
    font-size: var(--cell-font);
    font-weight: 700;
    letter-spacing: 0.03em;
    border-radius: var(--cell-radius);
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

  .drop-target {
    box-shadow: inset 0 0 0 3px rgba(250, 204, 21, 0.95),
      0 0 12px rgba(250, 204, 21, 0.55);
    filter: brightness(1.08);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .wild-letter-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 20px;
  }

  .wild-letter-modal {
    width: min(400px, 100%);
    background: linear-gradient(145deg, #0f172a, #1e293b);
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    padding: 28px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
    text-align: center;
    color: #e2e8f0;
  }

  .wild-letter-modal h3 {
    margin-bottom: 6px;
    font-size: 20px;
    letter-spacing: 0.04em;
  }

  .wild-letter-subtitle {
    margin-bottom: 18px;
    color: rgba(226, 232, 240, 0.8);
    font-size: 14px;
  }

  .wild-letter-input {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: rgba(15, 23, 42, 0.4);
    color: #fff;
    font-size: 18px;
    letter-spacing: 0.2em;
    text-align: center;
    text-transform: uppercase;
  }

  .wild-letter-input:focus {
    outline: none;
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.24);
  }

  .wild-letter-error {
    margin-top: 12px;
    color: #f87171;
    font-size: 13px;
  }

  .wild-letter-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .wild-letter-actions .btn {
    width: 120px;
  }

  .leave-room-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 210;
    padding: 20px;
  }

  .leave-room-modal {
    width: min(420px, 100%);
    background: linear-gradient(145deg, #0f172a, #1e293b);
    border: 1px solid rgba(148, 163, 184, 0.32);
    border-radius: 16px;
    padding: 24px;
    color: #e2e8f0;
    text-align: center;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  }

  .leave-room-modal h3 {
    margin: 0 0 8px;
    font-size: 20px;
  }

  .leave-room-message {
    margin: 0;
    color: rgba(226, 232, 240, 0.88);
    line-height: 1.4;
  }

  .leave-room-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .leave-room-actions .btn {
    width: 110px;
  }
</style>
