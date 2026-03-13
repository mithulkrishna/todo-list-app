// ============================================================
// MODEL — all data logic, API calls, localStorage persistence
// ============================================================

const Model = (() => {
  const API_BASE = 'https://dummyjson.com/todos';
  const STORAGE_KEY = 'todo_app_data';

  // In-memory store
  let todos = [];

  // ── localStorage helpers ──────────────────────────────────
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // ── API: fetch initial todos (first 20) ───────────────────
  async function fetchTodos() {
    const stored = loadFromStorage();
    if (stored && stored.length > 0) {
      todos = stored;
      return todos;
    }
    const res = await fetch(`${API_BASE}?limit=20&skip=0`);
    if (!res.ok) throw new Error('Failed to fetch todos');
    const data = await res.json();
    todos = data.todos.map(t => ({
      id: t.id,
      todo: t.todo,
      completed: t.completed,
      userId: t.userId,
    }));
    saveToStorage();
    return todos;
  }

  // ── API: add todo ─────────────────────────────────────────
  async function addTodo(text) {
    const res = await fetch(`${API_BASE}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo: text, completed: false, userId: 1 }),
    });
    if (!res.ok) throw new Error('Failed to add todo');
    const data = await res.json();
    // API returns a new item — give it a unique local id to avoid collisions
    const newTodo = {
      id: Date.now(),          // stable local id
      todo: data.todo,
      completed: false,
      userId: data.userId,
    };
    todos.unshift(newTodo);
    saveToStorage();
    return newTodo;
  }

  // ── API: toggle completed ─────────────────────────────────
  async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) throw new Error('Todo not found');
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    // dummyjson is read-only — update locally regardless of response status
    todo.completed = !todo.completed;
    saveToStorage();
    return todo;
  }

  // ── API: update todo text ─────────────────────────────────
  async function updateTodo(id, newText) {
    const todo = todos.find(t => t.id === id);
    if (!todo) throw new Error('Todo not found');
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo: newText }),
    });
    // update locally after API call
    todo.todo = newText;
    saveToStorage();
    return todo;
  }

  // ── API: delete todo ──────────────────────────────────────
  async function deleteTodo(id) {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    // remove locally after API call
    todos = todos.filter(t => t.id !== id);
    saveToStorage();
    return id;
  }

  // ── getters ───────────────────────────────────────────────
  function getPending() {
    return todos.filter(t => !t.completed);
  }

  function getCompleted() {
    return todos.filter(t => t.completed);
  }

  function getAll() {
    return [...todos];
  }

  return {
    fetchTodos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    getPending,
    getCompleted,
    getAll,
  };
})();
