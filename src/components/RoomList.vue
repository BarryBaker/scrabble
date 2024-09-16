<template>
  <div class="room-container">
    <div
      v-for="room of empthyRooms"
      :key="room.roomId"
      :class="['room-card', { selected: selectedRoom === room.roomId }]"
      @click="selectRoom(room.roomId)"
    >
      <h3>{{ room.roomName }}</h3>
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

  /* .room-card button {
    background-color: #8ecae6;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .room-card button:hover {
    background-color: #219ebc;
  } */

  .room-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  .room-card.selected {
    background-color: #e0f7fa;
    border-color: #007483;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }
</style>
