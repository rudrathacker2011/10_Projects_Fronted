const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.')); // Frontend files serve karo

const dataFile = path.join(__dirname, 'tasks.json');

// ===== HELPER: Read tasks from JSON =====
function readTasks() {
  const data = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(data);
}

// ===== HELPER: Write tasks to JSON =====
function writeTasks(tasks) {
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2));
}

// ===== GET: Saari tasks fetch karo =====
app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// ===== POST: Naya task add karo =====
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title aur Description dono zaroori hain' });
  }

  const tasks = readTasks();
  const newTask = {
    id: Date.now(),
    title,
    description,
    completed: false
  };

  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json(newTask);
});

// ===== DELETE: Task remove karo =====
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  let tasks = readTasks();

  tasks = tasks.filter(t => t.id != id);
  writeTasks(tasks);

  res.json({ message: 'Task deleted successfully' });
});

// ===== PUT: Task update karo (toggle complete ya edit) =====
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  let tasks = readTasks();
  const task = tasks.find(t => t.id == id);

  if (!task) {
    return res.status(404).json({ error: 'Task nahi mila' });
  }

  if (title) task.title = title;
  if (description) task.description = description;
  if (typeof completed === 'boolean') task.completed = completed;

  writeTasks(tasks);
  res.json(task);
});

// ===== Server start =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});