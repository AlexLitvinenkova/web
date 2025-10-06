<template>
  <div class="worker-form">
    <h3>{{ isEditing ? 'Редактирование сотрудника' : 'Добавление нового сотрудника' }}</h3>
    
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="worker-name" class="form-label">Имя сотрудника:</label>
        <input 
          id="worker-name"
          v-model="formData.name" 
          type="text" 
          class="form-input"
          :disabled="isSubmitting"
          placeholder="Введите ФИО сотрудника"
          required
        />
      </div>
      
      <DutiesSelect
        :duties="duties"
        :selectedDutyId="formData.duty_id"
        :isLoading="isSubmitting"
        @update:selectedDutyId="updateDutyId"
      />
      
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="isSubmitting || !isFormValid"
        >
          <span v-if="isSubmitting">Сохранение...</span>
          <span v-else>{{ isEditing ? 'Обновить' : 'Добавить' }} сотрудника</span>
        </button>
        
        <button 
          type="button" 
          class="btn btn-secondary"
          @click="resetForm"
          :disabled="isSubmitting"
        >
          Очистить
        </button>
        
        <button 
          v-if="isEditing"
          type="button" 
          class="btn btn-outline"
          @click="cancelEdit"
          :disabled="isSubmitting"
        >
          Отмена
        </button>
      </div>
    </form>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import DutiesSelect from './DutiesSelect.vue'

export default {
  name: 'WorkerForm',
  components: {
    DutiesSelect
  },
  props: {
    duties: {
      type: Array,
      default: () => []
    },
    isSubmitting: {
      type: Boolean,
      default: false
    },
    editingWorker: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formData: {
        name: '',
        duty_id: ''
      },
      errorMessage: '',
      isEditing: false
    }
  },
  computed: {
    isFormValid() {
      return this.formData.name.trim() !== '' && this.formData.duty_id !== '';
    }
  },
  watch: {
    editingWorker: {
      handler(newWorker) {
        if (newWorker) {
          this.isEditing = true;
          this.formData = {
            name: newWorker.name,
            duty_id: newWorker.duty_id
          };
        } else {
          this.resetForm();
        }
      },
      immediate: true
    }
  },
  methods: {
    updateDutyId(dutyId) {
      this.formData.duty_id = dutyId;
    },
    
    async handleSubmit() {
      if (!this.isFormValid) {
        this.errorMessage = 'Пожалуйста, заполните все поля';
        return;
      }
      
      this.errorMessage = '';
      
      try {
        if (this.isEditing) {
          await this.$emit('update-worker', {
            id: this.editingWorker.id,
            ...this.formData
          });
        } else {
          await this.$emit('create-worker', this.formData);
        }
        
        this.resetForm();
      } catch (error) {
        this.errorMessage = error.message || 'Произошла ошибка при сохранении';
      }
    },
    
    resetForm() {
      this.formData = {
        name: '',
        duty_id: ''
      };
      this.errorMessage = '';
      this.isEditing = false;
      this.$emit('cancel-edit');
    },
    
    cancelEdit() {
      this.resetForm();
    }
  }
}
</script>

<style scoped>
.worker-form {
  margin-bottom: 2rem;
}

.worker-form h3 {
  margin-bottom: 1rem;
  color: #333;
}

.form {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-outline {
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>

