// Add Note
document.getElementById('add-note').addEventListener('click', function () {
  const noteText = document.getElementById('note-text').value.trim();
  const noteDeadline = document.getElementById('note-deadline').value;
  if (noteText) {
    const noteContainer = document.getElementById('notes-container');
    const noteElement = document.createElement('div');
    noteElement.className = 'note';

    const noteContent = document.createElement('span');
    noteContent.textContent = noteText;
    noteContent.addEventListener('click', function () {
      const newText = prompt('Edit your note:', noteContent.textContent);
      if (newText !== null) {
        noteContent.textContent = newText;
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
      noteContainer.removeChild(noteElement);
    });

    noteElement.appendChild(noteContent);

    if (noteDeadline) {
      const deadlineSpan = document.createElement('span');
      deadlineSpan.className = 'deadline';
      deadlineSpan.textContent = ` (Deadline: ${new Date(noteDeadline).toLocaleString()})`;
      noteElement.appendChild(deadlineSpan);

      // Schedule notification
      const deadlineTime = new Date(noteDeadline).getTime();
      const currentTime = new Date().getTime();
      const timeUntilDeadline = deadlineTime - currentTime;

      if (timeUntilDeadline > 0) {
        setTimeout(() => {
          showNotification(`Reminder: Your note "${noteText}" is due!`);
        }, timeUntilDeadline);
      }
    }

    noteElement.appendChild(deleteButton);
    noteContainer.appendChild(noteElement);

    document.getElementById('note-text').value = ''; // Clear the textarea
    document.getElementById('note-deadline').value = ''; // Clear the deadline
    updateCharCounter(); // Reset character counter
  } else {
    alert('Please write something before adding a note.');
  }
});

// Character Counter
document.getElementById('note-text').addEventListener('input', updateCharCounter);

function updateCharCounter() {
  const noteText = document.getElementById('note-text').value;
  const charCounter = document.getElementById('char-counter');
  charCounter.textContent = `${noteText.length}/200`;
}

// Dark Theme Toggle
document.getElementById('theme-toggle').addEventListener('click', function () {
  document.body.classList.toggle('dark');
});

// Show Notification
function showNotification(message) {
  const notificationContainer = document.getElementById('notification-container');
  notificationContainer.textContent = message;
  notificationContainer.style.display = 'block';
  setTimeout(() => {
    notificationContainer.style.display = 'none';
  }, 5000); // Hide after 5 seconds
}