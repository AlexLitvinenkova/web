<template>
  <div class="modal-overlay" v-if="isVisible" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Справка по использованию</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <h4>Основные функции:</h4>
        <ul>
          <li><strong>Просмотр сотрудников:</strong> Выберите сотрудника из списка для просмотра его данных</li>
          <li><strong>Добавление сотрудника:</strong> Заполните форму и нажмите "Добавить сотрудника"</li>
          <li><strong>Редактирование:</strong> Выберите сотрудника и нажмите "Редактировать" для изменения данных</li>
          <li><strong>Удаление:</strong> Выберите сотрудника и нажмите "Удалить" для удаления записи</li>
        </ul>
        
        <h4>Требования к данным:</h4>
        <ul>
          <li>Имя сотрудника не должно быть пустым</li>
          <li>Необходимо выбрать должность из списка</li>
        </ul>
        
        <h4>Техническая информация:</h4>
        <p>Приложение использует Vue 3 с Composition API и подключается к Express.js API на порту 8080.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="closeModal">Понятно</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1rem;
}

.modal-body h4 {
  color: #333;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.modal-body h4:first-child {
  margin-top: 0;
}

.modal-body ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.modal-body li {
  margin: 0.25rem 0;
  line-height: 1.4;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  text-align: right;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>

