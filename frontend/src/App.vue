<template>
  <div id="app">
    <header class="app-header">
      <h1>Отдел кадров - HR Department</h1>
      <button class="help-btn" @click="showHelp = true">?</button>
    </header>

    <main class="app-main">
      <Spinner 
        :isLoading="isLoading" 
        text="Загрузка данных..."
      />

      <div v-if="!isLoading" class="app-content">
        <!-- Список сотрудников -->
        <WorkersList
          :workers="linkedWorkers"
          :isLoading="isLoading"
          @worker-selected="onWorkerSelected"
          ref="workersList"
        />

        <!-- Форма для работы с сотрудниками -->
        <WorkerForm
          :duties="duties"
          :isSubmitting="isSubmitting"
          :editingWorker="editingWorker"
          @create-worker="createWorker"
          @update-worker="updateWorker"
          @cancel-edit="cancelEdit"
        />

        <!-- Кнопки действий -->
        <div class="actions-section">
          <h3>Действия с выбранными сотрудниками</h3>
          <div class="action-buttons">
            <button 
              class="btn btn-warning"
              @click="startEdit"
              :disabled="selectedWorkerIds.length !== 1 || isSubmitting"
            >
              Редактировать
            </button>
            
            <button 
              class="btn btn-danger"
              @click="deleteSelectedWorkers"
              :disabled="selectedWorkerIds.length === 0 || isSubmitting"
            >
              Удалить выбранных ({{ selectedWorkerIds.length }})
            </button>
          </div>
        </div>

        <!-- Управление должностями -->
        <DutiesManager
          :duties="duties"
          :isLoading="isLoading"
          :isSubmitting="isSubmitting"
          @create-duty="createDuty"
          @update-duty="updateDuty"
          @delete-duty="deleteDuty"
        />

        <!-- Статистика -->
        <div class="stats-section">
          <h3>Статистика</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <h4>{{ workers.length }}</h4>
              <p>Всего сотрудников</p>
            </div>
            <div class="stat-card">
              <h4>{{ duties.length }}</h4>
              <p>Должностей</p>
            </div>
            <div class="stat-card">
              <h4>{{ selectedWorkerIds.length }}</h4>
              <p>Выбрано</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Модальное окно справки -->
    <HelpModal 
      :isVisible="showHelp" 
      @close="showHelp = false" 
    />

    <!-- Уведомления -->
    <div v-if="notification" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import Spinner from './components/Spinner.vue'
import WorkersList from './components/WorkersList.vue'
import WorkerForm from './components/WorkerForm.vue'
import DutiesManager from './components/DutiesManager.vue'
import HelpModal from './components/HelpModal.vue'

export default {
  name: 'App',
  components: {
    Spinner,
    WorkersList,
    WorkerForm,
    DutiesManager,
    HelpModal
  },
  setup() {
    // Реактивные данные
    const workers = ref([])
    const duties = ref([])
    const isLoading = ref(false)
    const isSubmitting = ref(false)
    const selectedWorkerIds = ref([])
    const editingWorker = ref(null)
    const showHelp = ref(false)
    const notification = ref(null)

    // Вычисляемые свойства
    const linkedWorkers = computed(() => {
      return workers.value.map(worker => ({
        ...worker,
        duty_name: duties.value.find(d => d.id === worker.duty_id)?.name || 'Неизвестно'
      }))
    })

    // Методы для работы с API
    const apiCall = async (url, options = {}) => {
      const baseUrl = 'http://localhost:8080/api'
      const response = await fetch(`${baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return response.json()
    }

    // Загрузка данных
    const loadData = async () => {
      isLoading.value = true
      try {
        const [workersData, dutiesData] = await Promise.all([
          apiCall('/workers'),
          apiCall('/duties')
        ])
        
        workers.value = workersData
        duties.value = dutiesData
        
        console.log('Данные загружены:', { workers: workersData, duties: dutiesData })
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        showNotification('Ошибка загрузки данных: ' + error.message, 'error')
      } finally {
        isLoading.value = false
      }
    }

    // Создание сотрудника
    const createWorker = async (workerData) => {
      isSubmitting.value = true
      try {
        const newWorker = await apiCall('/workers', {
          method: 'POST',
          body: JSON.stringify(workerData)
        })
        
        workers.value.push(newWorker)
        showNotification('Сотрудник успешно добавлен', 'success')
        console.log('Сотрудник создан:', newWorker)
      } catch (error) {
        console.error('Ошибка создания сотрудника:', error)
        showNotification('Ошибка создания сотрудника: ' + error.message, 'error')
        throw error
      } finally {
        isSubmitting.value = false
      }
    }

    // Обновление сотрудника
    const updateWorker = async (workerData) => {
      isSubmitting.value = true
      try {
        const updatedWorker = await apiCall(`/workers/${workerData.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: workerData.name,
            duty_id: workerData.duty_id
          })
        })
        
        const index = workers.value.findIndex(w => w.id === workerData.id)
        if (index !== -1) {
          workers.value[index] = updatedWorker
        }
        
        showNotification('Сотрудник успешно обновлен', 'success')
        console.log('Сотрудник обновлен:', updatedWorker)
      } catch (error) {
        console.error('Ошибка обновления сотрудника:', error)
        showNotification('Ошибка обновления сотрудника: ' + error.message, 'error')
        throw error
      } finally {
        isSubmitting.value = false
      }
    }

    // Удаление сотрудников
    const deleteSelectedWorkers = async () => {
      if (selectedWorkerIds.value.length === 0) return
      
      isSubmitting.value = true
      try {
        const deletePromises = selectedWorkerIds.value.map(id => 
          apiCall(`/workers/${id}`, { method: 'DELETE' })
        )
        
        await Promise.all(deletePromises)
        
        // Удаляем из локального массива
        workers.value = workers.value.filter(w => !selectedWorkerIds.value.includes(w.id))
        
        showNotification(`Удалено сотрудников: ${selectedWorkerIds.value.length}`, 'success')
        selectedWorkerIds.value = []
        console.log('Сотрудники удалены')
      } catch (error) {
        console.error('Ошибка удаления сотрудников:', error)
        showNotification('Ошибка удаления сотрудников: ' + error.message, 'error')
      } finally {
        isSubmitting.value = false
      }
    }

    // Создание должности
    const createDuty = async (dutyData) => {
      isSubmitting.value = true
      try {
        const newDuty = await apiCall('/duties', {
          method: 'POST',
          body: JSON.stringify(dutyData)
        })
        
        duties.value.push(newDuty)
        showNotification('Должность успешно добавлена', 'success')
        console.log('Должность создана:', newDuty)
      } catch (error) {
        console.error('Ошибка создания должности:', error)
        showNotification('Ошибка создания должности: ' + error.message, 'error')
        throw error
      } finally {
        isSubmitting.value = false
      }
    }

    // Обновление должности
    const updateDuty = async (dutyData) => {
      isSubmitting.value = true
      try {
        const updatedDuty = await apiCall(`/duties/${dutyData.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: dutyData.name
          })
        })
        
        const index = duties.value.findIndex(d => d.id === dutyData.id)
        if (index !== -1) {
          duties.value[index] = updatedDuty
        }
        
        showNotification('Должность успешно обновлена', 'success')
        console.log('Должность обновлена:', updatedDuty)
      } catch (error) {
        console.error('Ошибка обновления должности:', error)
        showNotification('Ошибка обновления должности: ' + error.message, 'error')
        throw error
      } finally {
        isSubmitting.value = false
      }
    }

    // Удаление должности
    const deleteDuty = async (dutyId) => {
      isSubmitting.value = true
      try {
        await apiCall(`/duties/${dutyId}`, { method: 'DELETE' })
        
        // Удаляем из локального массива
        duties.value = duties.value.filter(d => d.id !== dutyId)
        
        showNotification('Должность успешно удалена', 'success')
        console.log('Должность удалена')
      } catch (error) {
        console.error('Ошибка удаления должности:', error)
        showNotification('Ошибка удаления должности: ' + error.message, 'error')
        throw error
      } finally {
        isSubmitting.value = false
      }
    }

    // Обработчики событий
    const onWorkerSelected = (workerIds) => {
      selectedWorkerIds.value = workerIds
      console.log('Выбраны сотрудники:', workerIds)
    }

    const startEdit = () => {
      if (selectedWorkerIds.value.length === 1) {
        const worker = workers.value.find(w => w.id === selectedWorkerIds.value[0])
        editingWorker.value = worker
        console.log('Начато редактирование:', worker)
      }
    }

    const cancelEdit = () => {
      editingWorker.value = null
      console.log('Редактирование отменено')
    }

    // Уведомления
    const showNotification = (message, type = 'info') => {
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 3000)
    }

    // Жизненный цикл
    onMounted(() => {
      console.log('Компонент смонтирован, загружаем данные...')
      loadData()
    })

    return {
      // Данные
      workers,
      duties,
      isLoading,
      isSubmitting,
      selectedWorkerIds,
      editingWorker,
      showHelp,
      notification,
      
      // Вычисляемые свойства
      linkedWorkers,
      
      // Методы
      createWorker,
      updateWorker,
      deleteSelectedWorkers,
      createDuty,
      updateDuty,
      deleteDuty,
      onWorkerSelected,
      startEdit,
      cancelEdit
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.help-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.help-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-content {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: 
    "workers form"
    "actions duties"
    "stats stats";
}

.workers-list {
  grid-area: workers;
}

.worker-form {
  grid-area: form;
}

.actions-section {
  grid-area: actions;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.duties-manager {
  grid-area: duties;
}

.actions-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stats-section {
  grid-area: stats;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-card h4 {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background-color: #28a745;
}

.notification.error {
  background-color: #dc3545;
}

.notification.info {
  background-color: #17a2b8;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .app-content {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "workers"
      "form"
      "actions"
      "duties"
      "stats";
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .app-header {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 1.2rem;
  }
}
</style>
