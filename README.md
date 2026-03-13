# Todo List App

A vanilla JavaScript todo app built with the **MVC (Model-View-Controller)** pattern, using the [DummyJSON](https://dummyjson.com/docs/todos) API.

## Features

- **Add** new todos via the input form
- **Delete** todos with the red delete button
- **Toggle** todos between Pending and Completed lists using the arrow button
- **Edit** todo text inline — click the blue edit button, type, then click save (or press Enter)
- **Persistent storage** — all changes are saved to `localStorage` and survive page refresh
- **Event Delegation** used on list containers for efficient click handling
- **Toast notifications** for all user actions
- **Loading state** on initial data fetch

## Architecture

```
index.html      — markup only, no logic
style.css       — all styles
model.js        — data layer: API calls + localStorage + in-memory store
view.js         — DOM layer: rendering, edit mode, toast, loading
controller.js   — event binding: wires model and view together
```

## API Endpoints Used

| Method | Endpoint |
|--------|----------|
| GET | `https://dummyjson.com/todos?limit=20&skip=0` |
| POST | `https://dummyjson.com/todos/add` |
| PATCH | `https://dummyjson.com/todos/:id` |
| DELETE | `https://dummyjson.com/todos/:id` |

> **Note:** DummyJSON is a mock API and does not persist changes server-side. All mutations are applied locally after a successful API response, and persisted via `localStorage`.

## How to Run

No build step needed — open `index.html` directly in a browser, or serve with any static server:

```bash
# Option 1: Python
python3 -m http.server 3001

# Option 2: Node
npx serve .

# Option 3: VS Code Live Server extension
```

Then open `http://localhost:3001` in your browser.

## Tech Stack

- **Vanilla JavaScript** (ES6+, no frameworks or libraries)
- **HTML5**
- **CSS3** (CSS variables, animations, responsive grid)
