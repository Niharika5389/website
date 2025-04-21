// Calendar Elements
const calendarDays = document.getElementById('calendarDays');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const eventTitleInput = document.getElementById('eventTitle');
const eventTimeInput = document.getElementById('eventTime');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const addEventButton = document.getElementById('addEvent');
const addTaskButton = document.getElementById('addTask');
const itemsList = document.getElementById('itemsList');
const eventPopup = document.getElementById('eventPopup');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const closePopupButton = document.getElementById('closePopup');
const eventModeButton = document.getElementById('eventMode');
const taskModeButton = document.getElementById('taskMode');
const eventInput = document.querySelector('.event-input');
const taskInput = document.querySelector('.task-input');

// Debug logs for DOM elements
console.log('Calendar elements:', {
    calendarDays,
    currentMonthElement,
    prevMonthButton,
    nextMonthButton,
    eventTitleInput,
    eventTimeInput,
    taskTitleInput,
    taskDescriptionInput,
    addEventButton,
    addTaskButton,
    itemsList,
    eventPopup,
    selectedDateDisplay,
    closePopupButton,
    eventModeButton,
    taskModeButton,
    eventInput,
    taskInput
});

// Calendar Variables
let currentDate = new Date();
let selectedDate = null;
let events = JSON.parse(localStorage.getItem('events')) || {};
let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

// Toggle between event and task input
eventModeButton.addEventListener('click', () => {
    eventModeButton.classList.add('active');
    taskModeButton.classList.remove('active');
    eventInput.style.display = 'flex';
    taskInput.style.display = 'none';
});

taskModeButton.addEventListener('click', () => {
    taskModeButton.classList.add('active');
    eventModeButton.classList.remove('active');
    taskInput.style.display = 'flex';
    eventInput.style.display = 'none';
});

// Calendar Functions
function updateCalendar() {
    console.log('Updating calendar...');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    currentMonthElement.textContent = new Date(year, month).toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear previous days
    calendarDays.innerHTML = '';
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    console.log('Calendar details:', { year, month, firstDay, totalDays });
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        // Create day number element
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        // Create items container
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'day-items';
        
        // Check for events
        const dateString = `${year}-${month + 1}-${day}`;
        const dayEvents = events[dateString] || [];
        const dayTasks = tasks[dateString] || [];
        
        // Add event indicators
        dayEvents.forEach((event, index) => {
            if (index < 3) {
                const eventDot = document.createElement('div');
                eventDot.className = `event-dot ${event.fullDay ? 'full-day' : ''}`;
                eventDot.title = event.title;
                itemsContainer.appendChild(eventDot);
            }
        });
        
        // Add task indicators
        dayTasks.forEach((task, index) => {
            if (index < 3) {
                const taskDot = document.createElement('div');
                taskDot.className = `task-dot ${task.completed ? 'completed' : ''} ${task.fullDay ? 'full-day' : ''}`;
                taskDot.title = task.title;
                itemsContainer.appendChild(taskDot);
            }
        });
        
        // Show count if there are more items
        const totalItems = dayEvents.length + dayTasks.length;
        if (totalItems > 3) {
            const moreItems = document.createElement('div');
            moreItems.className = 'more-items';
            moreItems.textContent = `+${totalItems - 3}`;
            itemsContainer.appendChild(moreItems);
        }
        
        dayElement.appendChild(itemsContainer);
        
        // Add click event
        dayElement.addEventListener('click', () => {
            console.log('Day clicked:', { year, month, day });
            selectDate(year, month, day);
        });
        
        calendarDays.appendChild(dayElement);
    }
    
    console.log('Calendar updated successfully');
}

function selectDate(year, month, day) {
    console.log('selectDate called with:', { year, month, day });
    selectedDate = new Date(year, month, day);
    
    // Update selected day styling
    document.querySelectorAll('.day').forEach(el => {
        el.classList.remove('selected');
        const dayNumber = el.querySelector('.day-number');
        if (dayNumber && dayNumber.textContent === day.toString()) {
            el.classList.add('selected');
        }
    });
    
    // Show popup with items for selected date
    showItemsPopup();
}

function showItemsPopup() {
    console.log('showItemsPopup called, selectedDate:', selectedDate);
    if (!selectedDate) {
        console.log('No date selected');
        return;
    }
    
    const dateString = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    const formattedDate = selectedDate.toLocaleDateString('default', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    console.log('Showing popup for date:', { dateString, formattedDate });
    
    selectedDateDisplay.textContent = formattedDate;
    
    // Clear previous items
    itemsList.innerHTML = '';
    
    // Add events
    const dayEvents = events[dateString] || [];
    dayEvents.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.className = `item event-item ${event.fullDay ? 'full-day' : ''}`;
        eventElement.innerHTML = `
            <div class="item-content">
                <span class="item-time">${event.time}</span>
                <span class="item-title">${event.title}</span>
                ${event.fullDay ? '<span class="full-day-badge">Full Day</span>' : ''}
            </div>
            <button class="delete-btn" data-type="event" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        itemsList.appendChild(eventElement);
    });
    
    // Add tasks
    const dayTasks = tasks[dateString] || [];
    dayTasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = `item task-item ${task.completed ? 'completed' : ''} ${task.fullDay ? 'full-day' : ''}`;
        taskElement.innerHTML = `
            <div class="item-content">
                <span class="item-title">${task.title}</span>
                ${task.description ? `<span class="item-description">${task.description}</span>` : ''}
                ${task.fullDay ? '<span class="full-day-badge">Full Day</span>' : ''}
            </div>
            <div class="task-controls">
                <button class="complete-btn ${task.completed ? 'completed' : ''}" data-index="${index}">
                    <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                </button>
                <button class="delete-btn" data-type="task" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        itemsList.appendChild(taskElement);
    });
    
    // Add delete and complete event listeners
    itemsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.closest('.delete-btn').dataset.type;
            const index = parseInt(e.target.closest('.delete-btn').dataset.index);
            deleteItem(dateString, type, index);
        });
    });
    
    itemsList.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.complete-btn').dataset.index);
            toggleTaskCompletion(dateString, index);
        });
    });
    
    // Show popup
    eventPopup.classList.add('active');
    console.log('Popup should be visible now');
}

function hideItemsPopup() {
    eventPopup.classList.remove('active');
}

function addEvent() {
    if (!selectedDate) return;
    
    const title = eventTitleInput.value.trim();
    const time = eventTimeInput.value;
    const isFullDay = document.getElementById('eventFullDay').checked;
    
    if (!title || (!time && !isFullDay)) {
        alert('Please enter both title and time, or mark as full day event');
        return;
    }
    
    const dateString = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    
    if (!events[dateString]) {
        events[dateString] = [];
    }
    
    events[dateString].push({ 
        title, 
        time: isFullDay ? 'All Day' : time,
        fullDay: isFullDay
    });
    localStorage.setItem('events', JSON.stringify(events));
    
    // Clear inputs
    eventTitleInput.value = '';
    eventTimeInput.value = '';
    document.getElementById('eventFullDay').checked = false;
    
    // Update calendar and items
    updateCalendar();
    showItemsPopup();
}

function addTask() {
    if (!selectedDate) return;
    
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const isFullDay = document.getElementById('taskFullDay').checked;
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    const dateString = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    
    if (!tasks[dateString]) {
        tasks[dateString] = [];
    }
    
    tasks[dateString].push({ 
        title, 
        description,
        completed: false,
        fullDay: isFullDay
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Clear inputs
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
    document.getElementById('taskFullDay').checked = false;
    
    // Update calendar and items
    updateCalendar();
    showItemsPopup();
}

function deleteItem(dateString, type, index) {
    if (type === 'event') {
        events[dateString].splice(index, 1);
        if (events[dateString].length === 0) {
            delete events[dateString];
        }
        localStorage.setItem('events', JSON.stringify(events));
    } else {
        tasks[dateString].splice(index, 1);
        if (tasks[dateString].length === 0) {
            delete tasks[dateString];
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Update calendar and items
    updateCalendar();
    showItemsPopup();
}

function toggleTaskCompletion(dateString, index) {
    tasks[dateString][index].completed = !tasks[dateString][index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Update calendar and items
    updateCalendar();
    showItemsPopup();
}

// Event Listeners
prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

addEventButton.addEventListener('click', addEvent);
addTaskButton.addEventListener('click', addTask);
closePopupButton.addEventListener('click', hideItemsPopup);

// Close popup when clicking outside
eventPopup.addEventListener('click', (e) => {
    if (e.target === eventPopup) {
        hideItemsPopup();
    }
});

// Initialize
console.log('Initializing calendar...');
updateCalendar();
console.log('Calendar initialization complete'); 