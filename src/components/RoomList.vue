<template>
  <div class="room-container">
    <p v-if="emptyRooms.length > 0">Rooms</p>
    <!-- <div v-if="emptyRooms.length" class="room-header" aria-hidden="true">
      <span class="header-flag">Flag</span>
      <span class="header-name">Room Name</span>
      <div class="header-slots">
        <span v-for="slot in slotHeaders" :key="slot" class="header-slot">
          {{ slot }}
        </span>
      </div>
    </div> -->
    <div
      v-for="room of emptyRooms"
      :key="room.roomId"
      :class="['room-row', { selected: selectedRoom === room.roomId }]"
      @click="selectRoom(room.roomId)"
    >
      <div class="room-flag">
        <img
          :src="getFlagIcon(room.language)"
          :alt="room.language"
          class="flag-icon"
        />
      </div>
      <div class="room-name">{{ room.roomName }}</div>
      <div class="player-slots">
        <div
          v-for="(slotPlayer, index) in getPlayerSlots(room)"
          :key="`${room.roomId}-${index}`"
          :class="['slot', { filled: !!slotPlayer }]"
        >
          {{ slotPlayer || "" }}
        </div>
      </div>
      <button
        v-if="registered && registeredRoomId === room.roomId"
        class="btn-unjoin-inline"
        @click.stop="$emit('leave-room')"
      >
        Leave
      </button>
    </div>
  </div>
</template>

<script>
  import gbFlag from "../assets/flags/gb.png";
  import huFlag from "../assets/flags/hu.png";
  import nlFlag from "../assets/flags/nl.png";
  export default {
    props: {
      rooms: {
        type: Array,
        default: () => [],
      },
      selectedRoom: {
        type: Number,
        default: null,
      },
      registered: {
        type: Boolean,
        default: false,
      },
      registeredRoomId: {
        type: Number,
        default: null,
      },
    },
    methods: {
      selectRoom(id) {
        this.$emit("select-room", id); // Emit selected room ID to parent
      },
      getPlayerSlots(room) {
        const requiredPlayers = Number(room.requiredPlayers) || 0;
        return Array.from({ length: requiredPlayers }, (_, index) => {
          return room.players[index] || "";
        });
      },
      getFlagIcon(language) {
        switch (language) {
          case "en_GB":
            return gbFlag;
          case "hu_HU":
            return huFlag;
          case "nl_NL":
            return nlFlag;
          default:
            return "/flags/default.png";
        }
      },
    },
    computed: {
      emptyRooms() {
        if (!Array.isArray(this.rooms)) {
          return []; // Return an empty array if 'rooms' is undefined or null
        }
        return this.rooms.filter((r) => r.players.length < r.requiredPlayers);
      },
      slotHeaders() {
        const maxSlots = this.emptyRooms.reduce((max, room) => {
          return Math.max(max, Number(room.requiredPlayers) || 0);
        }, 0);
        return Array.from({ length: maxSlots }, (_, index) => {
          return `Player ${index + 1}`;
        });
      },
    },
  };
</script>

<style scoped>
  .room-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
  }
  .room-container p {
    color: #94a3b8;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  /* .room-header {
    width: 100%;
    display: grid;
    grid-template-columns: 34px minmax(120px, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
    color: #93c5fd;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  } */

  .header-slots {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
  }

  .header-slot {
    min-width: 84px;
    text-align: center;
  }

  .room-row {
    width: 100%;
    /* display: grid; */
    /* grid-template-columns: 34px minmax(60px, 1fr) auto; */
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: rgba(30, 41, 59, 0.52);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .room-row:hover {
    border-color: rgba(148, 163, 184, 0.32);
    background: rgba(30, 41, 59, 0.7);
  }

  .room-row.selected {
    border-color: rgba(99, 102, 241, 0.6);
    background: rgba(99, 102, 241, 0.14);
    box-shadow: inset 0 0 0 1px rgba(129, 140, 248, 0.35);
  }

  .room-flag {
    width: 28px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .room-name {
    margin: 0;
    color: #e2e8f0;
    font-size: 80%;
    /* font-weight: 600; */
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    /* text-overflow: ellipsis;
    min-width: 0;
    flex-shrink: 1; */
  }

  .player-slots {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
  }

  .slot {
    min-width: 50px;
    height: 30px;
    padding: 0 10px;
    border-radius: 7px;
    border: 1px dashed rgba(148, 163, 184, 0.34);
    background: rgba(15, 23, 42, 0.44);
    color: rgba(148, 163, 184, 0.45);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .slot.filled {
    border-style: solid;
    border-color: rgba(56, 189, 248, 0.38);
    color: #dbeafe;
    background: rgba(14, 116, 144, 0.24);
  }

  .flag-icon {
    width: 28px;
    height: 20px;
    border-radius: 3px;
    object-fit: cover;
  }

  .btn-unjoin-inline {
    margin-left: auto;
    flex-shrink: 0;
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.35);
    border-radius: 8px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-unjoin-inline:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.6);
    color: #fecaca;
  }

  @media (max-width: 632px) {
    .room-header {
      grid-template-columns: 28px minmax(90px, 1fr);
      gap: 10px;
    }

    .header-slots {
      grid-column: 1 / -1;
      justify-content: flex-start;
      flex-wrap: wrap;
      padding-top: 4px;
    }

    .header-slot {
      min-width: 76px;
    }

    .room-row {
      grid-template-columns: 28px minmax(90px, 1fr);
      gap: 10px;
    }

    .player-slots {
      grid-column: 1 / -1;
      justify-content: flex-start;
      flex-wrap: wrap;
      padding-top: 4px;
    }

    .slot {
      min-width: 76px;
      height: 28px;
      font-size: 11px;
    }
  }
</style>
