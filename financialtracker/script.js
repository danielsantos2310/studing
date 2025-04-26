// DOM Elements
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const addBtn = document.getElementById('add-btn');
const timeFilter = document.getElementById('time-filter');
const exportBtn = document.getElementById('export-btn');
const monthlyBudgetInput = document.getElementById('monthly-budget');
const transactionTable = document.getElementById('transaction-table').querySelector('tbody');
const balanceDisplay = document.getElementById('balance');
const monthIncomeDisplay = document.getElementById('month-income');
const monthExpenseDisplay = document.getElementById('month-expense');
const budgetProgress = document.getElementById('budget-progress');
const themeToggle = document.getElementById('theme-toggle');
const categoryChartCtx = document.getElementById('category-chart').getContext('2d');
const monthlyChartCtx = document.getElementById('monthly-chart').getContext('2d');

// Set default date to today
dateInput.valueAsDate = new Date();

// Initialize Charts
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

let monthlyChart = new Chart(monthlyChartCtx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Income',
        data: [],
        backgroundColor: '#4CAF50'
      },
      {
        label: 'Expenses',
        data: [],
        backgroundColor: '#f44336'
      }
    ]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
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

// Load data from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let monthlyBudget = localStorage.getItem('monthlyBudget') || 2000;
monthlyBudgetInput.value = monthlyBudget;

// Event Listeners
addBtn.addEventListener('click', addTransaction);
timeFilter.addEventListener('change', updateUI);
exportBtn.addEventListener('click', exportToCSV);
monthlyBudgetInput.addEventListener('change', updateBudget);

function addTransaction() {
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;

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
    date
  };

  transactions.push(transaction);
  saveData();
  updateUI();
  clearForm();
}

function clearForm() {
  descriptionInput.value = '';
  amountInput.value = '';
  typeInput.value = 'income';
  categoryInput.value = 'food';
  dateInput.valueAsDate = new Date();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  updateUI();
}

function updateBudget() {
  monthlyBudget = parseFloat(monthlyBudgetInput.value) || 0;
  localStorage.setItem('monthlyBudget', monthlyBudget);
  updateUI();
}

function saveData() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function filterTransactions() {
  const filter = timeFilter.value;
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return transactions.filter(t => {
    const tDate = new Date(t.date);
    
    switch(filter) {
      case 'today':
        return t.date === today;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return tDate >= weekStart;
      case 'month':
        return tDate.getMonth() === now.getMonth() && 
               tDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
}

function updateUI() {
  const filteredTransactions = filterTransactions();
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  const currentMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const now = new Date();
    return tDate.getMonth() === now.getMonth() && 
           tDate.getFullYear() === now.getFullYear();
  });
  
  const monthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthExpense = Math.abs(currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));
  
  // Update displays
  balanceDisplay.textContent = `$${balance.toFixed(2)}`;
  balanceDisplay.className = balance >= 0 ? 'income' : 'expense';
  
  monthIncomeDisplay.textContent = `Income: $${monthIncome.toFixed(2)}`;
  monthExpenseDisplay.textContent = `Expenses: $${monthExpense.toFixed(2)}`;
  
  // Update budget progress
  const budgetUsed = (monthExpense / monthlyBudget) * 100;
  budgetProgress.style.setProperty('--width', `${Math.min(budgetUsed, 100)}%`);
  
  // Update transaction table
  transactionTable.innerHTML = '';
  filteredTransactions.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(t.date).toLocaleDateString()}</td>
      <td>${t.description}</td>
      <td class="${t.type}">${t.type === 'income' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}</td>
      <td>${t.category}</td>
      <td><button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button></td>
    `;
    transactionTable.appendChild(row);
  });

  // Update charts
  updateCharts(currentMonthTransactions);
}

function updateCharts(monthTransactions) {
  // Category Chart
  const categories = ['food', 'transport', 'housing', 'entertainment', 'other'];
  const expensesByCategory = categories.map(cat => {
    return Math.abs(monthTransactions
      .filter(t => t.type === 'expense' && t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0)
    );
  });

  categoryChart.data.labels = categories;
  categoryChart.data.datasets[0].data = expensesByCategory;
  categoryChart.update();

  // Monthly Trend Chart
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthLabels = Array.from({length: daysInMonth}, (_, i) => i + 1);
  
  const dailyIncome = Array(daysInMonth).fill(0);
  const dailyExpense = Array(daysInMonth).fill(0);
  
  monthTransactions.forEach(t => {
    const day = new Date(t.date).getDate() - 1;
    if (t.type === 'income') {
      dailyIncome[day] += t.amount;
    } else {
      dailyExpense[day] += Math.abs(t.amount);
    }
  });

  monthlyChart.data.labels = monthLabels;
  monthlyChart.data.datasets[0].data = dailyIncome;
  monthlyChart.data.datasets[1].data = dailyExpense;
  monthlyChart.update();
}

function exportToCSV() {
  const csv = Papa.unparse(transactions.map(t => ({
    Date: t.date,
    Description: t.description,
    Amount: t.type === 'income' ? t.amount : -t.amount,
    Type: t.type,
    Category: t.category
  })));
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `budget-export-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

// Initialize
updateUI();