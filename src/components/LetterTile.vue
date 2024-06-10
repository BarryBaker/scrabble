<template>
  <div class="tile" draggable="true" @dragstart="handleDragStart">
    <span class="letter">{{ letter }}</span>
    <span class="points">{{ points }}</span>
  </div>
</template>

<script>
  export default {
    name: "LetterTile",

    props: {
      letter: {
        type: String,
        required: true,
      },
      points: {
        type: Number,
        required: true,
      },
    },
    computed: {
      letterData() {
        return {
          letter: this.letter,
          points: this.points,
        };
      },
    },
    methods: {
      handleDragStart(event) {
        const letterData = {
          letter: this.letter,
          points: this.points,
        };
        event.dataTransfer.setData("letterData", JSON.stringify(letterData));
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
  }
  .letter {
    display: block;
  }
  .points {
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 12px;
  }
</style>
