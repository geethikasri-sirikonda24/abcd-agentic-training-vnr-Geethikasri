const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const db = new Database('todos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    const result = db.prepare('INSERT INTO todos (task) VALUES (?)').run(task);
    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    const newCompleted = todo.completed ? 0 : 1;
    db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(newCompleted, id);
    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Todo app is ready!`);
});