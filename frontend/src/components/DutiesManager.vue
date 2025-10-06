<template>
  <div class="duties-manager">
    <h3>Управление должностями</h3>
    
    <!-- Форма добавления должности -->
    <div class="duty-form">
      <h4>{{ isEditing ? 'Редактирование должности' : 'Добавление новой должности' }}</h4>
      
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="duty-name" class="form-label">Название должности:</label>
          <input 
            id="duty-name"
            v-model="formData.name" 
            type="text" 
            class="form-input"
            :disabled="isSubmitting"
            placeholder="Введите название должности"
            required
          />
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isSubmitting || !isFormValid"
          >
            <span v-if="isSubmitting">Сохранение...</span>
            <span v-else>{{ isEditing ? 'Обновить' : 'Добавить' }} должность</span>
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

    <!-- Список должностей -->
    <div class="duties-list">
      <h4>Список должностей</h4>
      
      <div v-if="isLoading" class="loading">
        <Spinner :isLoading="true" text="Загрузка должностей..." />
      </div>
      
      <div v-else-if="duties.length === 0" class="empty-state">
        <p>Должности не найдены</p>
      </div>
      
      <div v-else class="duties-grid">
        <div 
          v-for="duty in duties" 
          :key="duty.id" 
          class="duty-card"
          :class="{ 'selected': selectedDutyId === duty.id }"
          @click="selectDuty(duty)"
        >
          <div class="duty-info">
            <h5>{{ duty.name }}</h5>
            <p>ID: {{ duty.id }}</p>
          </div>
          
          <div class="duty-actions">
            <button 
              class="btn btn-sm btn-warning"
              @click.stop="startEdit(duty)"
              :disabled="isSubmitting"
            >
              ✏️
            </button>
            
            <button 
              class="btn btn-sm btn-danger"
              @click.stop="deleteDuty(duty)"
              :disabled="isSubmitting"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Spinner from './Spinner.vue'

export default {
  name: 'DutiesManager',
  components: {
    Spinner
  },
  props: {
    duties: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        name: ''
      },
      errorMessage: '',
      isEditing: false,
      editingDuty: null,
      selectedDutyId: null
    }
  },
  computed: {
    isFormValid() {
      return this.formData.name.trim() !== '';
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.isFormValid) {
        this.errorMessage = 'Пожалуйста, введите название должности';
        return;
      }
      
      this.errorMessage = '';
      
      try {
        if (this.isEditing) {
          await this.$emit('update-duty', {
            id: this.editingDuty.id,
            name: this.formData.name
          });
        } else {
          await this.$emit('create-duty', this.formData);
        }
        
        this.resetForm();
      } catch (error) {
        this.errorMessage = error.message || 'Произошла ошибка при сохранении';
      }
    },
    
    resetForm() {
      this.formData = {
        name: ''
      };
      this.errorMessage = '';
      this.isEditing = false;
      this.editingDuty = null;
      this.selectedDutyId = null;
    },
    
    cancelEdit() {
      this.resetForm();
    },
    
    selectDuty(duty) {
      this.selectedDutyId = duty.id;
      this.$emit('duty-selected', duty);
    },
    
    startEdit(duty) {
      this.isEditing = true;
      this.editingDuty = duty;
      this.formData = {
        name: duty.name
      };
    },
    
    async deleteDuty(duty) {
      if (confirm(`Вы уверены, что хотите удалить должность "${duty.name}"?`)) {
        try {
          await this.$emit('delete-duty', duty.id);
        } catch (error) {
          this.errorMessage = error.message || 'Произошла ошибка при удалении';
        }
      }
    }
  }
}
</script>

<style scoped>
.duties-manager {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.duties-manager h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.duty-form {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.duty-form h4 {
  margin-bottom: 1rem;
  color: #333;
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
  margin-top: 1rem;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
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

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
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

.duties-list h4 {
  margin-bottom: 1rem;
  color: #333;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.duties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.duty-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.duty-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.duty-card.selected {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.duty-info h5 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
}

.duty-info p {
  margin: 0;
  color: #666;
  font-size: 0.8rem;
}

.duty-actions {
  display: flex;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .duties-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>


