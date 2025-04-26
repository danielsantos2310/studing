// DOM Elements
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const addBtn = document.getElementById('add-btn');
const transactionTable = document.getElementById('transaction-table').querySelector('tbody');
const balanceDisplay = document.getElementById('balance');
const themeToggle = document.getElementById('theme-toggle');
const categoryChartCtx = document.getElementById('category-chart').getContext('2d');

// Initialize Chart
let categoryChart = new Chart(categoryChartCtx, {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  }
});

// Theme Management
let darkMode = localStorage.getItem('darkMode') !== 'false';
if (!darkMode) document.body.classList.add('light-mode');

themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  document.body.classList.toggle('light-mode');
  localStorage.setItem('darkMode', darkMode);
});

// Load transactions from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Add new transaction
addBtn.addEventListener('click', addTransaction);

function addTransaction() {
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;

  if (!description || isNaN(amount)) {
    alert('Please enter valid description and amount');
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    type,
    category,
    date: new Date().toISOString()
  };

  transactions.push(transaction);
  saveTransactions();
  updateUI();
  clearForm();
}

function clearForm() {
  descriptionInput.value = '';
  amountInput.value = '';
  typeInput.value = 'income';
  categoryInput.value = 'food';
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  updateUI();
}

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateUI() {
  // Update balance
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  balanceDisplay.textContent = `$${balance.toFixed(2)}`;
  balanceDisplay.className = balance >= 0 ? 'income' : 'expense';

  // Update transaction table
  transactionTable.innerHTML = '';
  transactions.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.description}</td>
      <td class="${t.type}">${t.type === 'income' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}</td>
      <td>${t.category}</td>
      <td><button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button></td>
    `;
    transactionTable.appendChild(row);
  });

  // Update chart
  updateChart();
}

function updateChart() {
  const categories = ['food', 'transport', 'housing', 'entertainment', 'other'];
  const expensesByCategory = categories.map(cat => {
    return Math.abs(transactions
      .filter(t => t.type === 'expense' && t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0)
    );
  });

  categoryChart.data.labels = categories;
  categoryChart.data.datasets[0].data = expensesByCategory;
  categoryChart.update();
}

// Initialize
updateUI();
