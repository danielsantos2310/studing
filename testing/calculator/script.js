// Initialize variables
const display = document.querySelector('.display');
let history = [];
let memory = 0;

// Display functions
function appendToDisplay(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = '';
}

function backspace() {
  display.value = display.value.slice(0, -1);
}

// Calculation functions
function calculate() {
  try {
    const expression = display.value;
    const result = eval(expression);
    
    if (isNaN(result) || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    display.value = result;
    updateHistory(expression, result);
  } catch (error) {
    display.value = 'Error';
  }
}

function calculatePercentage() {
  try {
    const value = eval(display.value);
    display.value = value / 100;
  } catch (error) {
    display.value = 'Error';
  }
}

function toggleSign() {
  if (display.value.startsWith('-')) {
    display.value = display.value.substring(1);
  } else if (display.value !== '') {
    display.value = '-' + display.value;
  }
}

// Scientific operations
function scientificOperation(op) {
  try {
    const value = parseFloat(display.value);
    let result;
    
    switch (op) {
      case 'sqrt':
        if (value < 0) throw new Error('Invalid input');
        result = Math.sqrt(value);
        break;
      case 'pow':
        result = Math.pow(value, 2);
        break;
      case 'log':
        if (value <= 0) throw new Error('Invalid input');
        result = Math.log10(value);
        break;
      case 'ln':
        if (value <= 0) throw new Error('Invalid input');
        result = Math.log(value);
        break;
      case 'pi':
        result = Math.PI;
        break;
      default:
        return;
    }
    
    display.value = result;
    updateHistory(`${op}(${value})`, result);
  } catch (error) {
    display.value = 'Error';
  }
}

// Memory functions
function memoryOperation(op) {
  const currentValue = parseFloat(display.value) || 0;
  
  switch (op) {
    case 'M+':
      memory += currentValue;
      break;
    case 'M-':
      memory -= currentValue;
      break;
    case 'MR':
      display.value = memory;
      break;
    case 'MC':
      memory = 0;
      break;
  }
}

// History functions
function updateHistory(expression, result) {
  history.push(`${expression} = ${result}`);
  const list = document.getElementById('history-list');
  list.innerHTML = history.map(item => `<li>${item}</li>`).join('');
}

// Theme functions
function toggleTheme() {
  document.body.classList.toggle('light-theme');
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;
  
  if (/[0-9+\-*/.%]/.test(key)) {
    appendToDisplay(key);
  } else if (key === 'Enter') {
    calculate();
  } else if (key === 'Escape') {
    clearDisplay();
  } else if (key === 'Backspace') {
    backspace();
  }
});

// Unit conversion (example)
function convertUnit(value, from, to) {
  const conversions = {
    'cm-in': value * 0.393701,
    'in-cm': value * 2.54,
    'kg-lb': value * 2.20462,
    'lb-kg': value * 0.453592,
    'c-f': (value * 9/5) + 32,
    'f-c': (value - 32) * 5/9
  };
  
  return conversions[`${from}-${to}`] || value;
}function clearHistory() {
  history = []; // Empty the history array
  document.getElementById('history-list').innerHTML = ''; // Clear the display
}
function clearHistory() {
  if (history.length === 0) return;
  
  if (confirm('Are you sure you want to clear all history?')) {
    history = [];
    document.getElementById('history-list').innerHTML = '';
  }
}