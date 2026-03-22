// ===== DATA =====
let students = [];
let editId = null;

// ===== SELECT ELEMENTS =====
const form = document.querySelector(".form");
const tbody = document.querySelector("tbody");

const nameInput = document.getElementById("name");
const rollnoInput = document.getElementById("rollno");
const gradeInput = document.getElementById("grade");
const branchInput = document.getElementById("branch");

const totalStudents = document.getElementById("totalStudents");
const topGrade = document.getElementById("topGrade");
const lowGrade = document.getElementById("lowGrade");

// ===== FORM SUBMIT =====
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const rollno = Number(rollnoInput.value);
  const validGrades = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Validation
  if (rollno < 0) {
    alert("Roll no cannot be negative!");
    return;
  }

  if (!validGrades.includes(gradeInput.value.toUpperCase())) {
    alert("Grade should be between A & F");
    return;
  }

  if (editId !== null) {
    // ===== UPDATE =====
    students = students.map(s => {
      if (s.id === editId) {
        return {
          ...s,
          name: nameInput.value,
          rollno: rollno,
          grade: gradeInput.value.toUpperCase(),
          branch: branchInput.value
        };
      }
      return s;
    });

    editId = null;
  } else {
    // ===== ADD =====
    const student = {
      id: Date.now(),
      name: nameInput.value,
      rollno: rollno,
      grade: gradeInput.value.toUpperCase(),
      branch: branchInput.value
    };

    students.push(student);
  }

  renderStudents();
  updateStats();
  form.reset();
});

// ===== RENDER TABLE =====
function renderStudents() {
  const rows = students.map(s => {
    return `
      <tr>
        <td>${s.name}</td>
        <td>${s.rollno}</td>
        <td>${s.grade}</td>
        <td>${s.branch}</td>
        <td>
          <button onclick="startEdit(${s.id})">Edit</button>
          <button onclick="deleteStudent(${s.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rows;
}

// ===== EDIT START =====
function startEdit(id) {
  const student = students.find(s => s.id === id);

  nameInput.value = student.name;
  rollnoInput.value = student.rollno;
  gradeInput.value = student.grade;
  branchInput.value = student.branch;

  editId = id;
}

// ===== DELETE =====
function deleteStudent(id) {
  students = students.filter(s => s.id !== id);

  renderStudents();
  updateStats();
}

// ===== UPDATE STATS =====
function updateStats() {

  // Total students
  totalStudents.textContent = students.length;

  // Top grade (A)
  const top = students.filter(s => s.grade === 'A').length;
  topGrade.textContent = top;

  // Low grades (D, E, F)
  const low = students.filter(s => ['D','E','F'].includes(s.grade)).length;
  lowGrade.textContent = low;
}