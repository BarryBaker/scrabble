<template>
  <div v-if="visible" class="text-input-overlay">
    <div class="text-input-container">
      <input
        v-model="inputValue"
        :placeholder="placeholder"
        class="input-field"
      />
      <button @click="confirmInput" class="btn btn-primary">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      visible: {
        type: Boolean,
        required: true,
      },
      placeholder: {
        type: String,
        default: "Enter value",
      },
      buttonText: {
        type: String,
        default: "Confirm",
      },
    },
    data() {
      return {
        inputValue: "",
      };
    },
    methods: {
      confirmInput() {
        this.$emit("confirm", this.inputValue);
      },
    },
  };
</script>

<style>
  .text-input-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .text-input-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .input-field {
    width: 200px;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
    font-size: 16px;
  }
  .btn-primary {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  .btn-primary:hover {
    background-color: #388e3c;
  }
</style>
