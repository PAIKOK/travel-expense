document.addEventListener("DOMContentLoaded", loadExpenses);
let editingRow = null;

// Handle form submission
document.getElementById("expense-form").addEventListener("submit", function (event) {
    event.preventDefault();

    let date = document.getElementById("date").value;
    let place = document.getElementById("place").value;
    let booking = parseFloat(document.getElementById("booking").value) || 0;
    let travel = parseFloat(document.getElementById("travel").value) || 0;
    let local = parseFloat(document.getElementById("local").value) || 0;
    let sightseeing = parseFloat(document.getElementById("sightseeing").value) || 0;
    let food = parseFloat(document.getElementById("food").value) || 0;
    let additionalName = document.getElementById("additional-name").value || "-";
    let additionalInput = document.getElementById("additional").value.trim();

    // Evaluate additional expenses safely
    let additional = evaluateExpression(additionalInput);

    // Ensure the evaluated result is a valid number
    if (isNaN(additional)) {
        alert("Invalid additional expenses. Please enter a valid number or expression.");
        return;
    }

    document.getElementById("additional").value = additional; // Replace field with computed value

    let total = booking + travel + local + sightseeing + food + additional;
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    if (editingRow) {
        let rowIndex = editingRow.rowIndex - 1;
        expenses[rowIndex] = { date, place, booking, travel, local, sightseeing, food, additionalName, additional, total };
        localStorage.setItem("expenses", JSON.stringify(expenses));
        updateRow(editingRow, date, place, booking, travel, local, sightseeing, food, additionalName, additional, total);
        editingRow = null;
    } else {
        expenses.push({ date, place, booking, travel, local, sightseeing, food, additionalName, additional, total });
        localStorage.setItem("expenses", JSON.stringify(expenses));
        addExpenseToTable(date, place, booking, travel, local, sightseeing, food, additionalName, additional, total);
    }

    updateDailyTotals();
    document.getElementById("expense-form").reset();
});

// Function to evaluate mathematical expressions safely
function evaluateExpression(expression) {
    try {
        return new Function("return " + expression)();  // Evaluates "900+800" correctly
    } catch (error) {
        return 0;
    }
}

// Function to add an expense row to the table
function addExpenseToTable(date, place, booking, travel, local, sightseeing, food, additionalName, additional, total) {
    let table = document.getElementById("expense-table");
    let row = document.createElement("tr");

    row.innerHTML = `
        <td>${date}</td>
        <td>${place}</td>
        <td>${booking}</td>
        <td>${travel}</td>
        <td>${local}</td>
        <td>${sightseeing}</td>
        <td>${food}</td>
        <td>${additionalName}</td>
        <td>${additional}</td>
        <td>${total}</td>
        <td class="action-buttons">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", function () {
        editExpense(row);
    });

    row.querySelector(".delete-btn").addEventListener("click", function () {
        deleteExpense(row);
    });

    table.appendChild(row);
    updateDailyTotals();
}

// Load saved expenses from localStorage
function loadExpenses() {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.forEach(expense => {
        addExpenseToTable(expense.date, expense.place, expense.booking, expense.travel, expense.local, expense.sightseeing, expense.food, expense.additionalName, expense.additional, expense.total);
    });
    updateDailyTotals();
}

// Edit an existing expense
function editExpense(row) {
    let cells = row.cells;
    document.getElementById("date").value = cells[0].textContent;
    document.getElementById("place").value = cells[1].textContent;
    document.getElementById("booking").value = cells[2].textContent;
    document.getElementById("travel").value = cells[3].textContent;
    document.getElementById("local").value = cells[4].textContent;
    document.getElementById("sightseeing").value = cells[5].textContent;
    document.getElementById("food").value = cells[6].textContent;
    document.getElementById("additional-name").value = cells[7].textContent;
    document.getElementById("additional").value = cells[8].textContent;

    editingRow = row;
}

// Update an existing row with new values
function updateRow(row, date, place, booking, travel, local, sightseeing, food, additionalName, additional, total) {
    row.cells[0].textContent = date;
    row.cells[1].textContent = place;
    row.cells[2].textContent = booking;
    row.cells[3].textContent = travel;
    row.cells[4].textContent = local;
    row.cells[5].textContent = sightseeing;
    row.cells[6].textContent = food;
    row.cells[7].textContent = additionalName;
    row.cells[8].textContent = additional;
    row.cells[9].textContent = total;
}

// Delete an expense from the table and localStorage
function deleteExpense(row) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let rowIndex = row.rowIndex - 1;

    expenses.splice(rowIndex, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    row.remove();
    updateDailyTotals();
}

// Update the daily total for each date
function updateDailyTotals() {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let dailyTotals = {};

    expenses.forEach(expense => {
        if (!dailyTotals[expense.date]) {
            dailyTotals[expense.date] = 0;
        }
        dailyTotals[expense.date] += expense.total;
    });

    let dailyTotalContainer = document.getElementById("daily-total-container");
    dailyTotalContainer.innerHTML = "";

    Object.keys(dailyTotals).forEach(date => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="9"><strong>Total for ${date}</strong></td>
            <td>${dailyTotals[date]}</td>
            <td></td>
        `;
        dailyTotalContainer.appendChild(row);
    });
}
document.getElementById("download-btn").addEventListener("click", function () {
    let table = document.getElementById("expense-table");
    let rows = table.querySelectorAll("tr");
    let csvContent = "";

    rows.forEach(row => {
        let cols = row.querySelectorAll("td, th");
        let rowData = [];
        cols.forEach(col => rowData.push(`"${col.textContent}"`));
        csvContent += rowData.join(",") + "\n";
    });

    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "expenses.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
