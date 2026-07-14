const BASE_URL = 'https://apitest.enricodelarosa.tech';
const TOKEN = CONFIG.API_TOKEN;

function getHeaders() {
  return {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `HTTP error ${response.status}`;
    try {
      const body = await response.json();
      if (body.message) errorMsg += `: ${body.message}`;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function checkHealth() {
  const response = await fetch(`${BASE_URL}/health`);
  return handleResponse(response);
}

async function getTodos() {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

async function getTodoById(id) {
  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
}

async function createTodo(title) {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error('Title cannot be empty');
  }
  const response = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title: trimmed })
  });
  return handleResponse(response);
}

async function updateTodo(id, updates) {
  const body = {};
  if (updates.title !== undefined) {
    const trimmed = updates.title.trim();
    if (!trimmed) throw new Error('Title cannot be empty');
    body.title = trimmed;
  }
  if (updates.completed !== undefined) {
    body.completed = updates.completed;
  }
  if (Object.keys(body).length === 0) {
    throw new Error('No valid fields to update');
  }
  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  return handleResponse(response);
}

async function deleteTodo(id) {
  const response = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

const todoList = document.getElementById('todoList');
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const messageEl = document.getElementById('message');

function showMessage(text, isError = true) {
  messageEl.textContent = text;
  messageEl.style.display = 'block';
  if (isError) {
    messageEl.style.background = '#f8d7da';
    messageEl.style.color = '#721c24';
    messageEl.style.borderColor = '#f5c6cb';
  } else {
    messageEl.style.background = '#d4edda';
    messageEl.style.color = '#155724';
    messageEl.style.borderColor = '#c3e6cb';
  }
  clearTimeout(window._msgTimeout);
  window._msgTimeout = setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

async function renderTodos() {
  try {
    todoList.innerHTML = '<li class="info-text">Loading...</li>';
    const todos = await getTodos();
    if (todos.length === 0) {
      todoList.innerHTML = '<li class="info-text">✨ No todos yet. Add one!</li>';
      return;
    }
    todoList.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item${todo.completed ? ' completed' : ''}`;
      li.dataset.id = todo.id;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'todo-title';
      titleSpan.textContent = todo.title;
      titleSpan.addEventListener('click', async () => {
        try {
          await updateTodo(todo.id, { completed: !todo.completed });
          await renderTodos();
        } catch (err) {
          showMessage(`Update failed: ${err.message}`);
        }
      });

      const badge = document.createElement('span');
      badge.className = 'status-badge';
      badge.textContent = todo.completed ? '✔ Done' : 'Pending';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        if (!confirm(`Delete "${todo.title}"?`)) return;
        try {
          await deleteTodo(todo.id);
          await renderTodos();
          showMessage('Todo deleted!', false);
        } catch (err) {
          showMessage(`Delete failed: ${err.message}`);
        }
      });

      li.appendChild(titleSpan);
      li.appendChild(badge);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  } catch (err) {
    todoList.innerHTML = `<li class="info-text" style="color:#dc3545;">❌ ${err.message}</li>`;
    showMessage(err.message);
  }
}

async function handleAddTodo() {
  const title = todoInput.value;
  if (!title.trim()) {
    showMessage('Please write something!');
    return;
  }
  try {
    await createTodo(title);
    todoInput.value = '';
    await renderTodos();
    showMessage('Todo added!', false);
  } catch (err) {
    showMessage(`Failed to add: ${err.message}`);
  }
}

addBtn.addEventListener('click', handleAddTodo);
todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleAddTodo();
  }
});

renderTodos();