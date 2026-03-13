// ============================================================
// CONTROLLER — wires Model and View, handles all user events
// ============================================================

const Controller = (() => {

  // ── Re-render both lists from model ──────────────────────
  function refreshView() {
    View.renderLists(Model.getPending(), Model.getCompleted());
  }

  // ── Submit: add new todo ──────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const text = View.getInputValue();
    if (!text) {
      View.showToast('Please enter a task first.', 'error');
      return;
    }
    View.setSubmitLoading(true);
    try {
      await Model.addTodo(text);
      View.clearInput();
      refreshView();
      View.showToast('Task added!', 'success');
    } catch (err) {
      View.showToast('Failed to add task. Try again.', 'error');
    } finally {
      View.setSubmitLoading(false);
    }
  }

  // ── Event delegation on both list containers ──────────────
  function handleListClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id     = parseInt(btn.dataset.id);

    if (action === 'toggle')  handleToggle(id);
    if (action === 'delete')  handleDelete(id);
    if (action === 'edit')    handleEdit(id);
  }

  // ── Toggle: move between lists ────────────────────────────
  async function handleToggle(id) {
    try {
      await Model.toggleTodo(id);
      refreshView();
      View.showToast('Task moved!', 'success');
    } catch (err) {
      View.showToast('Failed to update task.', 'error');
    }
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete(id) {
    View.animateRemove(id, async () => {
      try {
        await Model.deleteTodo(id);
        refreshView();
        View.showToast('Task deleted.', 'success');
      } catch (err) {
        refreshView(); // re-render anyway since item may still be gone
        View.showToast('Failed to delete task.', 'error');
      }
    });
  }

  // ── Edit / Save (toggle inline edit mode) ─────────────────
  async function handleEdit(id) {
    if (View.isInEditMode(id)) {
      // Currently editing → save
      const newText = View.getEditInputValue(id);
      if (!newText) {
        View.showToast('Task cannot be empty.', 'error');
        return;
      }
      try {
        await Model.updateTodo(id, newText);
        View.exitEditMode(id, newText);
        View.showToast('Task updated!', 'success');
      } catch (err) {
        View.showToast('Failed to update task.', 'error');
      }
    } else {
      // Not editing → enter edit mode
      View.enterEditMode(id);
    }
  }

  // ── Save on Enter key inside edit input ───────────────────
  function handleEditKeydown(e) {
    if (e.key !== 'Enter') return;
    const input = e.target.closest('.todo-edit-input');
    if (!input) return;
    const id = parseInt(input.dataset.id);
    handleEdit(id);
  }

  // ── Cancel edit on Escape ─────────────────────────────────
  function handleEditKeyup(e) {
    if (e.key !== 'Escape') return;
    const input = e.target.closest('.todo-edit-input');
    if (!input) return;
    // Restore original text without saving
    refreshView();
  }

  // ── Init: fetch data and bind all events ──────────────────
  async function init() {
    View.showLoading();
    try {
      await Model.fetchTodos();
      refreshView();
    } catch (err) {
      View.showToast('Failed to load todos. Please refresh.', 'error');
    } finally {
      View.hideLoading();
    }

    // Form submit
    document.getElementById('todo-form').addEventListener('submit', handleSubmit);

    // Event delegation on both lists
    View.pendingList.addEventListener('click', handleListClick);
    View.completedList.addEventListener('click', handleListClick);

    // Keyboard shortcuts for edit inputs (delegated to document)
    document.addEventListener('keydown', handleEditKeydown);
    document.addEventListener('keyup', handleEditKeyup);
  }

  return { init };
})();

// ── Bootstrap ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', Controller.init);
