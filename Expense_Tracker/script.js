function updateClock() {
    const clockElement = document.getElementById('live-clock');
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const dateTimeString = now.toLocaleDateString('en-US', options);
    clockElement.textContent = dateTimeString;
}

setInterval(updateClock, 1000);
updateClock();

let expenses = JSON.parse(localStorage.getItem('myExpenses')) || [];

const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total-display');

function renderAll() {
    expenseList.innerHTML = '';
    expenses.forEach(item => addExpenseToTable(item));
    updateTotal();
}

expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newExpense = { 
        amount, 
        description, 
        category, 
        time: timeString, 
        id: Date.now() 
    };
    
    expenses.push(newExpense);
    localStorage.setItem('myExpenses', JSON.stringify(expenses));

    addExpenseToTable(newExpense);
    updateTotal();
    expenseForm.reset();
});

function deleteExpense(id) {
    expenses = expenses.filter(item => item.id !== id);
    localStorage.setItem('myExpenses', JSON.stringify(expenses));
    renderAll();
}

function addExpenseToTable(expense) {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.padding = '8px 0';
    li.style.borderBottom = '1px solid #eee';
    li.style.alignItems = 'center';

    li.innerHTML = `
        <div>
            <small style="display:block; color:#888;">${expense.time}</small>
            <strong>${expense.description}</strong> (${expense.category})
        </div>
        <div>
            <span style="font-weight:bold; margin-right:10px;">$${expense.amount.toFixed(2)}</span>
            <button onclick="deleteExpense(${expense.id})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">×</button>
        </div>
    `;
    
    expenseList.appendChild(li);
}

function updateTotal() {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    totalDisplay.textContent = total.toFixed(2);
}

renderAll();