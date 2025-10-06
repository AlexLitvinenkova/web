<template>
  <div class="workers-list">
    <h3>Список сотрудников</h3>
    
    <div class="list-container">
      <select 
        v-model="selectedWorkerIds" 
        @change="onSelectionChange"
        class="workers-select"
        size="5"
        multiple
        :disabled="isLoading"
      >
        <option 
          v-for="worker in workers" 
          :key="worker.id" 
          :value="worker.id"
        >
          {{ worker.name }} - {{ worker.duty_name }}
        </option>
      </select>
      
      <div v-if="workers.length === 0 && !isLoading" class="empty-state">
        <p>Список сотрудников пуст</p>
      </div>
    </div>
    
    <div class="worker-info" v-if="selectedWorker">
      <h4>Информация о выбранном сотруднике:</h4>
      <div class="info-card">
        <p><strong>ID:</strong> {{ selectedWorker.id }}</p>
        <p><strong>Имя:</strong> {{ selectedWorker.name }}</p>
        <p><strong>Должность:</strong> {{ selectedWorker.duty_name }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkersList',
  props: {
    workers: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedWorkerIds: []
    }
  },
  computed: {
    selectedWorker() {
      if (this.selectedWorkerIds.length === 1) {
        return this.workers.find(w => w.id === this.selectedWorkerIds[0]);
      }
      return null;
    }
  },
  methods: {
    onSelectionChange() {
      this.$emit('worker-selected', this.selectedWorkerIds);
    },
    clearSelection() {
      this.selectedWorkerIds = [];
      this.$emit('worker-selected', []);
    }
  }
}
</script>

<style scoped>
.workers-list {
  margin-bottom: 2rem;
}

.workers-list h3 {
  margin-bottom: 1rem;
  color: #333;
}

.list-container {
  position: relative;
}

.workers-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  min-height: 120px;
}

.workers-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.workers-select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.worker-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.worker-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.info-card {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.info-card p {
  margin: 0.25rem 0;
  color: #555;
}
</style>

