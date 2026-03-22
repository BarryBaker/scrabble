<template>
  <div class="room-container">
    <div
      v-for="room of empthyRooms"
      :key="room.roomId"
      :class="['room-card', { selected: selectedRoom === room.roomId }]"
      @click="selectRoom(room.roomId)"
    >
      <h3>{{ room.roomName }}</h3>
      <div class="language-flag">
        <img
          :src="getFlagIcon(room.language)"
          :alt="room.language"
          class="flag-icon"
        />
      </div>
      <p>
        {{ room.players.length }} out of {{ room.requiredPlayers }} players
        joined.
      </p>

      <div class="players">
        <span v-for="player of room.players" :key="player" class="player">
          {{ player }},
        </span>
      </div>
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
    },
    methods: {
      selectRoom(id) {
        this.$emit("select-room", id); // Emit selected room ID to parent
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
      empthyRooms() {
        if (!Array.isArray(this.rooms)) {
          return []; // Return an empty array if 'rooms' is undefined or null
        }
        return this.rooms.filter((r) => r.players.length < r.requiredPlayers);
      },
    },
  };
</script>

<style scoped>
  .room-card {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 14px;
    padding: 16px;
    width: 220px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    font-family: "Inter", sans-serif;
    margin: 8px auto;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .room-card:hover {
    background: rgba(30, 41, 59, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .room-card h3 {
    font-size: 1.1rem;
    color: #e2e8f0;
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .room-card p {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 4px 0;
  }

  .room-card .players {
    display: block;
    margin-top: 10px;
    color: #a78bfa;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .room-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .room-card.selected {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
  }

  .flag-icon {
    width: 22px;
    height: 22px;
    margin-bottom: 8px;
    border-radius: 3px;
  }
</style>
