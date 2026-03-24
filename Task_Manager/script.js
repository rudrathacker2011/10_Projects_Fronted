// ===== SELECTORS =====
const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const taskBody = document.getElementById('taskBody');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const messageBar = document.getElementById('messageBar');
const loader = document.getElementById('loader');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

let tasks = [];

// ===== STATE: Edit mode track karo =====
// null = Add mode (naya task banana)
// koi id = Edit mode (purana task update karna)
let editingTaskId = null;

// ===== HELPER: Message dikhao =====
function showMessage(text, type = 'success') {
  messageBar.textContent = text;
  messageBar.className = `message-bar ${type}`;
  messageBar.classList.remove('hidden');

  setTimeout(() => {
    messageBar.classList.add('hidden');
  }, 3000);
}

// ===== HELPER: Loader show/hide =====
function showLoader(show) {
  if (show) {
    loader.classList.remove('hidden');
    taskBody.closest('table').classList.add('hidden');
  } else {
    loader.classList.add('hidden');
    taskBody.closest('table').classList.remove('hidden');
  }
}

// ===== PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
});

async function loadTasks() {
  showLoader(true);

  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    tasks = await response.json();
    renderTable();
    updateStats();
  } catch (error) {
    console.error('Error loading tasks:', error);
    showMessage('Tasks load nahi ho paaye! Server check karo.', 'error');
  } finally {
    showLoader(false);
  }
}

// ===== FORM SUBMIT: Add OR Edit (state ke hisaab se) =====
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    showMessage('Title daal bhai! Khali nahi chal sakta.', 'error');
    titleInput.focus();
    return;
  }
  if (!description) {
    showMessage('Description bhi zaroori hai!', 'error');
    descriptionInput.focus();
    return;
  }

  submitBtn.disabled = true;

  // ===== YAHA STATE CHECK HO RAHA HAI =====
  if (editingTaskId) {
    // EDIT MODE — PUT request
    submitBtn.textContent = 'Updating... ⏳';
    await updateTask(editingTaskId, title, description);
  } else {
    // ADD MODE — POST request
    submitBtn.textContent = 'Adding... ⏳';
    await addTask(title, description);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = editingTaskId ? 'Update Task ✏️' : 'Add Task ➕';
});

// ===== ADD TASK (POST) =====
async function addTask(title, description) {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Task add nahi ho paaya');
    }

    const addedTask = await response.json();
    tasks.push(addedTask);
    renderTable();
    updateStats();
    taskForm.reset();
    showMessage('Task add ho gaya! ✅', 'success');
  } catch (error) {
    console.error('Error adding task:', error);
    showMessage(error.message || 'Kuch gadbad ho gayi!', 'error');
  }
}

// ===== UPDATE TASK (PUT) =====
async function updateTask(id, title, description) {
  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) throw new Error('Update nahi ho paaya');

    const updatedTask = await response.json();
    tasks = tasks.map(t => t.id === id ? updatedTask : t);
    renderTable();
    updateStats();
    cancelEdit();  // Edit mode band karo, add mode pe wapas
    showMessage('Task update ho gaya! ✏️', 'success');
  } catch (error) {
    console.error('Error updating task:', error);
    showMessage('Update mein error aaya!', 'error');
  }
}

// ===== START EDITING — Form mein values bharo =====
function startEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // State change: Add → Edit mode
  editingTaskId = id;

  // Form mein purani values daal do
  titleInput.value = task.title;
  descriptionInput.value = task.description;

  // UI changes — user ko pata chale ki edit mode hai
  submitBtn.textContent = 'Update Task ✏️';
  cancelEditBtn.classList.remove('hidden');
  taskForm.classList.add('editing');  // Form highlight

  // Form pe scroll karo
  taskForm.scrollIntoView({ behavior: 'smooth' });
  titleInput.focus();
}

// ===== CANCEL EDIT — Wapas add mode pe =====
function cancelEdit() {
  editingTaskId = null;
  taskForm.reset();
  submitBtn.textContent = 'Add Task ➕';
  cancelEditBtn.classList.add('hidden');
  taskForm.classList.remove('editing');
}

// ===== RENDER TABLE =====
function renderTable() {
  taskBody.innerHTML = '';

  if (tasks.length === 0) {
    taskBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Koi task nahi - add karo! 📝</td></tr>';
    return;
  }

  tasks.forEach(task => {
    const row = document.createElement('tr');
    const statusText = task.completed ? 'Completed ✅' : 'Pending ⏳';
    const statusClass = task.completed ? 'status-completed' : 'status-pending';

    row.innerHTML = `
      <td><strong>${task.title}</strong></td>
      <td>${task.description}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>
        <button class="action-btn" onclick="toggleComplete(${task.id})">✓ Complete</button>
        <button class="action-btn edit" onclick="startEdit(${task.id})">✏️ Edit</button>
        <button class="action-btn delete" onclick="deleteTask(${task.id})">🗑️ Delete</button>
      </td>
    `;
    taskBody.appendChild(row);
  });
}

// ===== DELETE TASK =====
async function deleteTask(id) {
  if (!confirm('Pakka delete karna hai?')) return;

  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Delete nahi ho paaya');

    tasks = tasks.filter(t => t.id !== id);
    renderTable();
    updateStats();

    // Agar wahi task edit ho raha tha jo delete kiya, toh cancel edit
    if (editingTaskId === id) cancelEdit();

    showMessage('Task delete ho gaya! 🗑️', 'success');
  } catch (error) {
    console.error('Error deleting task:', error);
    showMessage('Delete mein error aaya!', 'error');
  }
}

// ===== TOGGLE COMPLETE =====
async function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);

  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    });
    if (!response.ok) throw new Error('Update nahi ho paaya');

    const updatedTask = await response.json();
    tasks = tasks.map(t => t.id === id ? updatedTask : t);
    renderTable();
    updateStats();

    const msg = updatedTask.completed ? 'Task complete! 🎉' : 'Task pending mein daala ⏳';
    showMessage(msg, 'success');
  } catch (error) {
    console.error('Error updating task:', error);
    showMessage('Update mein error aaya!', 'error');
  }
}

// ===== UPDATE STATS =====
function updateStats() {
  totalTasksEl.textContent = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  completedTasksEl.textContent = completed;
}