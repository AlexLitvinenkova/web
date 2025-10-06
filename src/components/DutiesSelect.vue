<template>
  <div class="duties-select">
    <label for="duty-select" class="form-label">Должность:</label>
    <select 
      id="duty-select"
      :value="selectedDutyId" 
      @change="onDutyChange"
      class="form-select"
      :disabled="isLoading"
      required
    >
      <option value="">Выберите должность</option>
      <option 
        v-for="duty in duties" 
        :key="duty.id" 
        :value="duty.id"
      >
        {{ duty.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'DutiesSelect',
  props: {
    duties: {
      type: Array,
      default: () => []
    },
    selectedDutyId: {
      type: [String, Number],
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onDutyChange(event) {
      this.$emit('update:selectedDutyId', event.target.value);
    }
  }
}
</script>

<style scoped>
.duties-select {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}
</style>
