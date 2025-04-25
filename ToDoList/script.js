// DOM Elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

// Load tasks and theme from LocalStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let darkMode = localStorage.getItem('darkMode') !== 'false';

// Apply saved theme
if (!darkMode) document.body.classList.add('light-mode');

// Render tasks
function renderTasks(filter = 'all') {
  taskList.innerHTML = '';
  
  const filteredTasks = filter === 'all' 
    ? tasks 
    : filter === 'active' 
      ? tasks.filter(task => !task.completed) 
      : tasks.filter(task => task.completed);

  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskItem.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
      <span class="task-text">${task.text}</span>
      <button class="delete-btn">×</button>
    `;
    taskList.appendChild(taskItem);

    // Add event listeners
    const checkbox = taskItem.querySelector('.task-checkbox');
    const deleteBtn = taskItem.querySelector('.delete-btn');

    checkbox.addEventListener('change', () => {
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks(filter);
    });

    deleteBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks(filter);
    });
  });
}

// Add new task
function addTask() {
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    saveTasks();
    taskInput.value = '';
    renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
  }
}

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Toggle theme
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('light-mode');
  localStorage.setItem('darkMode', darkMode);
}

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks(btn.dataset.filter);
  });
});

themeToggle.addEventListener('click', toggleTheme);

// Initial render
renderTasks();