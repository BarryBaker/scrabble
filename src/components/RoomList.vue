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
        <span v-for="player of room.players" :key="player.name" class="player">
          {{ player.name }},
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
    background-color: #f0f9ff; /* Light blue background */
    border-radius: 10px;
    padding: 10px;
    width: 200px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    margin: 10px auto;
  }

  .room-card h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 5px;
  }

  .room-card p {
    font-size: 0.9rem;
    color: #555;
  }

  .room-card .players {
    display: block;
    margin-top: 10px;
  }

  .room-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  .room-card.selected {
    background-color: #94f2ff;
    border-color: #007483;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }
  .flag-icon {
    width: 20px;
    height: 20px;
    margin-bottom: 10px;
  }
</style>
