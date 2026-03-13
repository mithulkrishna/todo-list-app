// ============================================================
// VIEW — all DOM rendering, no business logic here
// ============================================================

const View = (() => {
  const inputEl        = document.getElementById('todo-input');
  const submitBtn      = document.getElementById('submit-btn');
  const pendingList    = document.getElementById('pending-list');
  const completedList  = document.getElementById('completed-list');
  const pendingCount   = document.getElementById('pending-count');
  const completedCount = document.getElementById('completed-count');
  const loadingOverlay = document.getElementById('loading-overlay');
  const toastEl        = document.getElementById('toast');

  let toastTimer = null;

  function showToast(message, type = 'success') {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className = `toast toast--${type} toast--visible`;
    toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, 2800);
  }

  function showLoading() { loadingOverlay.classList.add('active'); }
  function hideLoading() { loadingOverlay.classList.remove('active'); }

  const ICONS = {
    edit:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    save:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    del:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
    right: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    left:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  };

  // Demo layout:
  //   Pending:   [text] [edit][delete][→]
  //   Completed: [←] [text] [edit][delete]
  function createTodoItem(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;
    const id  = todo.id;
    const txt = escapeHTML(todo.todo);

    if (todo.completed) {
      li.innerHTML =
        `<button class="btn btn--toggle" data-action="toggle" data-id="${id}" title="Move to Pending">${ICONS.left}</button>` +
        `<span class="todo-text" data-id="${id}">${txt}</span>` +
        `<input class="todo-edit-input hidden" data-id="${id}" value="${txt}" />` +
        `<div class="todo-actions">` +
          `<button class="btn btn--edit"   data-action="edit"   data-id="${id}" title="Edit">${ICONS.edit}</button>` +
          `<button class="btn btn--delete" data-action="delete" data-id="${id}" title="Delete">${ICONS.del}</button>` +
        `</div>`;
    } else {
      li.innerHTML =
        `<span class="todo-text" data-id="${id}">${txt}</span>` +
        `<input class="todo-edit-input hidden" data-id="${id}" value="${txt}" />` +
        `<div class="todo-actions">` +
          `<button class="btn btn--edit"   data-action="edit"   data-id="${id}" title="Edit">${ICONS.edit}</button>` +
          `<button class="btn btn--delete" data-action="delete" data-id="${id}" title="Delete">${ICONS.del}</button>` +
          `<button class="btn btn--toggle" data-action="toggle" data-id="${id}" title="Mark Complete">${ICONS.right}</button>` +
        `</div>`;
    }
    return li;
  }

  function renderLists(pending, completed) {
    renderList(pendingList, pending);
    renderList(completedList, completed);
    pendingCount.textContent   = pending.length;
    completedCount.textContent = completed.length;
  }

  function renderList(container, items) {
    container.innerHTML = '';
    if (items.length === 0) {
      container.innerHTML = `<li class="empty-state">No tasks here</li>`;
      return;
    }
    items.forEach(todo => container.appendChild(createTodoItem(todo)));
  }

  function enterEditMode(id) {
    const li = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (!li) return;
    li.querySelector('.todo-text').classList.add('hidden');
    const inp = li.querySelector('.todo-edit-input');
    inp.classList.remove('hidden');
    inp.focus(); inp.select();
    const eb = li.querySelector('.btn--edit');
    eb.classList.add('btn--save');
    eb.title = 'Save';
    eb.innerHTML = ICONS.save;
  }

  function exitEditMode(id, newText) {
    const li = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (!li) return;
    const textEl = li.querySelector('.todo-text');
    textEl.textContent = newText;
    textEl.classList.remove('hidden');
    li.querySelector('.todo-edit-input').classList.add('hidden');
    const eb = li.querySelector('.btn--edit');
    eb.classList.remove('btn--save');
    eb.title = 'Edit';
    eb.innerHTML = ICONS.edit;
  }

  function getEditInputValue(id) {
    const input = document.querySelector(`.todo-edit-input[data-id="${id}"]`);
    return input ? input.value.trim() : '';
  }

  function isInEditMode(id) {
    const input = document.querySelector(`.todo-edit-input[data-id="${id}"]`);
    return input && !input.classList.contains('hidden');
  }

  function getInputValue()      { return inputEl.value.trim(); }
  function clearInput()         { inputEl.value = ''; inputEl.focus(); }
  function setSubmitLoading(on) { submitBtn.disabled = on; submitBtn.textContent = on ? 'Adding…' : 'Submit'; }

  function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function animateRemove(id, callback) {
    const li = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (!li) { callback(); return; }
    li.classList.add('removing');
    setTimeout(callback, 260);
  }

  return {
    inputEl, submitBtn, pendingList, completedList,
    renderLists, enterEditMode, exitEditMode,
    getEditInputValue, isInEditMode,
    getInputValue, clearInput, setSubmitLoading,
    showToast, showLoading, hideLoading, animateRemove,
  };
})();
