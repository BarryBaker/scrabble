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
    margin: 3px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    color: white;
    border: none;
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .btn:hover {
    transform: translateY(-1px);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn i {
    margin-right: 6px;
  }

  .btn-pass {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .btn-pass:hover {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }

  .btn-cancel {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  .btn-cancel:hover {
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
  }

  .btn-change {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }

  .btn-change:hover {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
  }

  .btn-surrender {
    background: linear-gradient(135deg, #a855f7, #7c3aed);
  }

  .btn-surrender:hover {
    box-shadow: 0 6px 20px rgba(168, 85, 247, 0.3);
  }

  .btn-shuffle {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
  }

  .btn-shuffle:hover {
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
  }
</style>
