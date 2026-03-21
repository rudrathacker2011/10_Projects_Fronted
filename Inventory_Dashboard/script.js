// ===== DATA =====
let products = [];

// ===== SELECT ELEMENTS =====
const form = document.querySelector(".form");
const tbody = document.querySelector("tbody");

const nameInput = document.getElementById("name");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");

const totalItemsEl = document.getElementById("totalItems");
const totalValueEl = document.getElementById("totalValue");
const lowStockEl = document.getElementById("lowStock");


// ===== FORM SUBMIT =====
form.addEventListener("submit", function (e) {
  e.preventDefault();

    const quantity = Number(quantityInput.value);
    const price = Number(priceInput.value);

    // ✅ VALIDATION
     if (quantity < 0 || price < 0) {
      alert("Quantity and Price cannot be negative");
    return;
    }
    
  const product = {
    id: Date.now(),
    name: nameInput.value,
    quantity: Number(quantityInput.value),
    price: Number(priceInput.value),
    category: categoryInput.value
  };

  products.push(product);

  renderProducts();
  updateStats();

  form.reset();
});

// ===== RENDER TABLE (map + template literals) =====
function renderProducts() {
  const rows = products.map(p => {
    return `
      <tr>
        <td>${p.name}</td>
        <td>${p.quantity}</td>
        <td>${p.price}</td>
        <td>${p.category}</td>
        <td>
          <button class="delete-btn" onclick="deleteProduct(${p.id})">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rows;
}

// ===== DELETE (filter) =====
function deleteProduct(id) {
  products = products.filter(p => p.id !== id);

  renderProducts();
  updateStats();
}

// ===== FIND EXAMPLE (for learning) =====
function findProduct(id) {
  return products.find(p => p.id === id);
}

// ===== UPDATE STATS (reduce + filter) =====
function updateStats() {

  // total items
  totalItemsEl.textContent = products.length;

  // total value
  const totalValue = products.reduce((sum, p) => {
    return sum + (p.price * p.quantity);
  }, 0);

  totalValueEl.textContent = "Rs " + totalValue;

  // low stock
  const lowStock = products.filter(p => p.quantity < 5).length;

  lowStockEl.textContent = lowStock;
}