let display = document.querySelector('.display');

// Append values to display
function appendToDisplay(value) {
  if (value === '±') {
    toggleSign();
  } else if (value === '%') {
    calculatePercentage();
  } else {
    display.value += value;
  }
}

// Clear display
function clearDisplay() {
  display.value = '';
}

// Calculate result (using eval)
function calculate() {
  try {
    let result = eval(display.value);
    display.value = result;
  } catch (error) {
    display.value = 'Error';
  }
}

// Backspace (remove last character)
function backspace() {
  display.value = display.value.slice(0, -1);
}

// Toggle +/- sign
function toggleSign() {
  if (display.value.startsWith('-')) {
    display.value = display.value.substring(1);
  } else {
    display.value = '-' + display.value;
  }
}

// Calculate percentage
function calculatePercentage() {
  try {
    display.value = eval(display.value) / 100;
  } catch (error) {
    display.value = 'Error';
  }
}