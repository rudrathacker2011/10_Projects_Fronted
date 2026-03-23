// ===== DATA & SELECTORS =====
let entities = []; // Current workouts array [cite: 66]
let editId = null; // Track which workout to update [cite: 66]

const form = document.querySelector(".form");
const tbody = document.querySelector("tbody");

// Select inputs based on your HTML IDs
const nameInput = document.getElementById("name");
const durationInput = document.getElementById("duration");
const dateInput = document.getElementById("date");
const intensityInput = document.getElementById("intensity");

// Stats elements
const totalCount = document.getElementById("totalexercise");
const totalDuration = document.getElementById("totalduration");

// Day 3 Controls
const searchBar = document.getElementById("search-bar");
const filterSelect = document.getElementById("filter");
const exportBtn = document.getElementById("Export");

// ===== INITIAL LOAD =====
function load() {
    const data = localStorage.getItem('workoutData'); // [cite: 119]
    if (data) {
        entities = JSON.parse(data); // Convert string back to array [cite: 120]
    }
    renderTable();
    updateStats();
}
load();

// ===== FORM SUBMIT (ADD/UPDATE) =====
form.addEventListener("submit", function (e) {
    e.preventDefault(); // Stop page refresh [cite: 88]

    const workout = {
        id: editId || Date.now(), // Generate unique ID [cite: 89]
        name: nameInput.value,
        duration: Number(durationInput.value), // Ensure number for stats [cite: 91]
        date: dateInput.value,
        intensity: intensityInput.value
    };

    if (editId !== null) {
        // Update existing item [cite: 95]
        entities = entities.map(w => w.id === editId ? workout : w);
        editId = null;
    } else {
        // Add new item [cite: 170]
        entities.push(workout);
    }

    save(); // [cite: 116]
    renderTable();
    updateStats();
    form.reset();
});

// ===== SAVE TO LOCALSTORAGE =====
function save() {
    localStorage.setItem('workoutData', JSON.stringify(entities)); // [cite: 116]
}

// ===== RENDER TABLE =====
function renderTable(list = entities) {
    // .map() transforms objects into table rows [cite: 67-79]
    tbody.innerHTML = list.map(w => `
        <tr>
            <td>${w.name}</td>
            <td>${w.duration} mins</td>
            <td>${w.intensity}</td>
            <td>${w.date}</td>
            <td>
                <button onclick="startEdit(${w.id})">Edit</button>
                <button onclick="deleteWorkout(${w.id})">Delete</button>
            </td>
        </tr>
    `).join(""); 
}

// ===== DAY 3: SEARCH & FILTER =====
searchBar.addEventListener("input", function() {
    const term = this.value.toLowerCase(); // Case-insensitive [cite: 125]
    const list = entities.filter(w => 
        w.name.toLowerCase().includes(term) || w.intensity.toLowerCase().includes(term)
    ); // Find match in name or intensity [cite: 127-129]
    renderTable(list);
});

filterSelect.addEventListener("change", function() {
    const type = this.value;
    const list = type ? entities.filter(w => w.intensity === type) : entities;
    renderTable(list);
});

// ===== DAY 3: CSV EXPORT =====
exportBtn.addEventListener("click", function() {
    // 1. Prepare headers and data [cite: 141-142]
    const rows = [
        ["Name", "Duration", "Date", "Intensity"],
        ...entities.map(w => [w.name, w.duration, w.date, w.intensity])
    ];

    // 2. Format as CSV string [cite: 143]
    const csvContent = rows.map(r => r.join(",")).join("\n");
    
    // 3. Create file download [cite: 144-145]
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitness-tracker.csv';
    a.click();
});

// ===== DELETE & EDIT =====
function deleteWorkout(id) {
    entities = entities.filter(w => w.id !== id); // Remove item [cite: 178]
    save();
    renderTable();
    updateStats();
}

function startEdit(id) {
    const workout = entities.find(w => w.id === id); // Find object to edit [cite: 36]
    nameInput.value = workout.name;
    durationInput.value = workout.duration;
    dateInput.value = workout.date;
    intensityInput.value = workout.intensity;
    editId = id;
}

// ===== STATS =====
function updateStats() {
    totalCount.textContent = entities.length; // [cite: 83]
    // .reduce() sums up the duration field [cite: 84, 321]
    totalDuration.textContent = entities.reduce((sum, w) => sum + w.duration, 0); 
}