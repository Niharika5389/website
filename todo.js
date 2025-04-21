// Todo Elements
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const addButton = document.getElementById('addTodo');

// Todo Functions
function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText === '') return;

    const todoItem = document.createElement('li');
    todoItem.className = 'todo-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    
    const todoTextSpan = document.createElement('span');
    todoTextSpan.className = 'todo-text';
    todoTextSpan.textContent = todoText;
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.onclick = () => {
        todoItem.remove();
        saveTodos();
    };
    
    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoTextSpan);
    todoItem.appendChild(deleteButton);
    
    todoList.appendChild(todoItem);
    todoInput.value = '';
    
    // Save todos to localStorage
    saveTodos();
}

function saveTodos() {
    const todos = [];
    document.querySelectorAll('.todo-item').forEach(item => {
        todos.push({
            text: item.querySelector('.todo-text').textContent,
            completed: item.querySelector('.todo-checkbox').checked
        });
    });
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.forEach(todo => {
        const todoItem = document.createElement('li');
        todoItem.className = 'todo-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        
        const todoTextSpan = document.createElement('span');
        todoTextSpan.className = 'todo-text';
        todoTextSpan.textContent = todo.text;
        if (todo.completed) {
            todoItem.classList.add('completed');
        }
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = () => {
            todoItem.remove();
            saveTodos();
        };
        
        todoItem.appendChild(checkbox);
        todoItem.appendChild(todoTextSpan);
        todoItem.appendChild(deleteButton);
        
        todoList.appendChild(todoItem);
    });
}

// Event Listeners
addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Handle checkbox changes
todoList.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        const todoItem = e.target.closest('.todo-item');
        if (e.target.checked) {
            todoItem.classList.add('completed');
        } else {
            todoItem.classList.remove('completed');
        }
        saveTodos();
    }
});

// Initialize
loadTodos(); 