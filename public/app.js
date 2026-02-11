const API_URL = 'http://localhost:3000/api/todos';

window.addEventListener('DOMContentLoaded', loadTodos);

async function loadTodos() {
    try {
        const response = await fetch(API_URL);
        const todos = await response.json();
        displayTodos(todos);
    } catch (error) {
        console.error('Error loading todos:', error);
        alert('Failed to load todos. Make sure the server is running!');
    }
}

function displayTodos(todos) {
    const todoList = document.getElementById('todoList');
    
    if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No todos yet! Add one above 👆</div>';
        updateStats(0, 0);
        return;
    }
    
    todoList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox"
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.task)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
    `).join('');
    
    const completed = todos.filter(t => t.completed).length;
    updateStats(todos.length, completed);
}

async function addTodo() {
    const input = document.getElementById('todoInput');
    const task = input.value.trim();
    
    if (!task) {
        alert('Please enter a task!');
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task })
        });
        
        if (response.ok) {
            input.value = '';
            loadTodos();
        } else {
            alert('Failed to add todo');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add todo. Make sure the server is running!');
    }
}

async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            loadTodos();
        } else {
            alert('Failed to update todo');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo. Make sure the server is running!');
    }
}

async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTodos();
        } else {
            alert('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo. Make sure the server is running!');
    }
}

function updateStats(total, completed) {
    document.getElementById('totalCount').textContent = `Total: ${total}`;
    document.getElementById('completedCount').textContent = `Completed: ${completed}`;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}