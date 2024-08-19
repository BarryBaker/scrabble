<template>
  <button :class="['btn', btnClass]" @click="handleClick">
    <i :class="iconClass"></i> {{ label }}
  </button>
</template>

<script>
  export default {
    name: "ActionButton",
    props: {
      iconClass: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
      btnClass: {
        type: String,
        required: true,
      },
      clickAction: {
        type: Function,
        required: true,
      },
    },
    methods: {
      handleClick() {
        this.clickAction();
      },
    },
  };
</script>

<style scoped>
  .btn {
    margin: 5px;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    color: white;
  }

  .btn i {
    margin-right: 5px;
  }

  .btn-pass {
    background-color: #4caf50;
  }

  .btn-cancel {
    background-color: #f44336;
  }

  .btn-change {
    background-color: #ff9800;
  }

  .btn-surrender {
    background-color: #9c27b0;
  }

  .btn-shuffle {
    background-color: #3f51b5;
  }
</style>
