<template>
  <div v-if="visible" class="text-input-overlay">
    <div class="text-input-container">
      <input
        v-model="inputValue"
        :placeholder="placeholder"
        class="input-field"
      />
      <div class="button-row">
        <button @click="confirmInput" class="btn btn-primary">
          {{ buttonText }}
        </button>
        <button @click="cancelInput" class="btn btn-cancel">Cancel</button>
      </div>
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
      cancelInput() {
        this.$emit("cancel");
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
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  .text-input-container {
    background: linear-gradient(145deg, #1e293b, #0f172a);
    border: 1px solid rgba(148, 163, 184, 0.12);
    padding: 32px;
    border-radius: 20px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 300px;
  }
  .text-input-container .input-field {
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.6);
    color: #e2e8f0;
    font-size: 15px;
    font-family: "Inter", sans-serif;
    transition: all 0.2s ease;
    outline: none;
  }
  .text-input-container .input-field:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
  .text-input-container .input-field::placeholder {
    color: #64748b;
  }
  .text-input-container .btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    padding: 12px 32px;
    font-size: 14px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.2s ease;
    width: 100%;
  }
  .text-input-container .btn-primary:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
  }
  .text-input-container .button-row {
    width: 100%;
    display: flex;
    gap: 8px;
  }
  .text-input-container .btn-cancel {
    background: rgba(100, 116, 139, 0.3);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.15);
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.2s ease;
    width: 100%;
  }
  .text-input-container .btn-cancel:hover {
    background: rgba(100, 116, 139, 0.5);
    color: #e2e8f0;
    transform: translateY(-1px);
  }
</style>
