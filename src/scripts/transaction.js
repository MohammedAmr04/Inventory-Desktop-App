// Transaction state
let transactionItems = [];
let products = [];

const transactionItemsTableBody = document.querySelector(
  "#transactionItemsTable tbody"
);
const addItemBtn = document.getElementById("addItemBtn");
const itemModalBg = document.getElementById("itemModalBg");
const itemForm = document.getElementById("itemForm");
const itemFormError = document.getElementById("itemFormError");
const itemProductSelect = document.getElementById("itemProductSelect");
const itemQuantity = document.getElementById("itemQuantity");
const itemPrice = document.getElementById("itemPrice");
const cancelItemModalBtn = document.getElementById("cancelItemModalBtn");
const submitItemModalBtn = document.getElementById("submitItemModalBtn");
const customerNameInput = document.getElementById("customerName");
const transactionTotalLabel = document.getElementById("transactionTotal");
const saveTransactionBtn = document.getElementById("saveTransactionBtn");
const productSearchInput = document.getElementById("productSearchInput");
const productSearchResults = document.getElementById("productSearchResults");

// Fetch all products for dropdowns/search
async function loadProducts() {
  products = await window.electronAPI.getAllProducts();
  renderProductSelect();
}

function renderProductSelect() {
  itemProductSelect.innerHTML =
    '<option value="">Select product</option>' +
    products.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
}

function renderTransactionTable() {
  if (!transactionItems.length) {
    transactionItemsTableBody.innerHTML =
      '<tr><td colspan="4">No items added.</td></tr>';
    updateTotal();
    return;
  }
  transactionItemsTableBody.innerHTML = transactionItems
    .map(
      (item, idx) => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toFixed(2)}</td>
      <td><button class="icon-btn delete" data-idx="${idx}" title="Delete"><i class="fa fa-trash"></i></button></td>
    </tr>
  `
    )
    .join("");
  updateTotal();
}

function updateTotal() {
  const total = transactionItems.reduce((sum, item) => sum + item.price, 0);
  transactionTotalLabel.textContent = total.toFixed(2);
}

addItemBtn.addEventListener("click", () => {
  itemFormError.textContent = "";
  itemForm.reset();
  renderProductSelect();
  itemModalBg.classList.add("active");
});
cancelItemModalBtn.addEventListener("click", () => {
  itemModalBg.classList.remove("active");
});
itemModalBg.addEventListener("click", (e) => {
  if (e.target === itemModalBg) itemModalBg.classList.remove("active");
});

itemProductSelect.addEventListener("change", () => {
  const prod = products.find((p) => p.id == itemProductSelect.value);
  if (prod) {
    itemQuantity.value = 1;
    itemPrice.value = prod.retail_price.toFixed(2);
  } else {
    itemQuantity.value = "";
    itemPrice.value = "";
  }
});
itemQuantity.addEventListener("input", () => {
  const prod = products.find((p) => p.id == itemProductSelect.value);
  if (prod && itemQuantity.value) {
    itemPrice.value = (prod.retail_price * Number(itemQuantity.value)).toFixed(
      2
    );
  }
});

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  itemFormError.textContent = "";
  const productId = itemProductSelect.value;
  const quantity = Number(itemQuantity.value);
  const price = Number(itemPrice.value);
  const prod = products.find((p) => p.id == productId);
  if (!productId || !prod) {
    itemFormError.textContent = "Please select a product.";
    return;
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    itemFormError.textContent = "Quantity must be greater than 0.";
    return;
  }
  if (quantity > prod.quantity) {
    itemFormError.textContent = `Only ${prod.quantity} in stock.`;
    return;
  }
  if (price < 0) {
    itemFormError.textContent = "Price must be ≥ 0.";
    return;
  }
  transactionItems.push({
    productId: prod.id,
    productName: prod.name,
    quantity,
    price,
  });
  renderTransactionTable();
  itemModalBg.classList.remove("active");
});

transactionItemsTableBody.addEventListener("click", (e) => {
  if (e.target.closest(".delete")) {
    const idx = e.target.closest(".delete").dataset.idx;
    transactionItems.splice(idx, 1);
    renderTransactionTable();
  }
});

// Product search
productSearchInput.addEventListener("input", () => {
  const q = productSearchInput.value.trim().toLowerCase();
  if (!q) {
    productSearchResults.classList.remove("active");
    productSearchResults.innerHTML = "";
    return;
  }
  const matches = products
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 8);
  if (!matches.length) {
    productSearchResults.classList.remove("active");
    productSearchResults.innerHTML = "";
    return;
  }
  productSearchResults.innerHTML = matches
    .map(
      (p) =>
        `<div data-id="${p.id}">${
          p.name
        } <span style="color:#888;font-size:0.95em;">($${p.retail_price.toFixed(
          2
        )}, ${p.quantity} in stock)</span></div>`
    )
    .join("");
  productSearchResults.classList.add("active");
});
productSearchResults.addEventListener("click", (e) => {
  const div = e.target.closest("div[data-id]");
  if (!div) return;
  const prod = products.find((p) => p.id == div.dataset.id);
  if (!prod) return;
  // Add with quantity 1, default price
  if (prod.quantity < 1) {
    alert("No stock available for this product.");
    return;
  }
  transactionItems.push({
    productId: prod.id,
    productName: prod.name,
    quantity: 1,
    price: prod.retail_price,
  });
  renderTransactionTable();
  productSearchResults.classList.remove("active");
  productSearchInput.value = "";
});
document.addEventListener("click", (e) => {
  if (
    !productSearchResults.contains(e.target) &&
    e.target !== productSearchInput
  ) {
    productSearchResults.classList.remove("active");
  }
});

// Save transaction
saveTransactionBtn.addEventListener("click", async () => {
  const customerName = customerNameInput.value.trim();
  if (!customerName) {
    alert("Customer name is required.");
    return;
  }
  if (!transactionItems.length) {
    alert("Add at least one item to the transaction.");
    return;
  }
  try {
    await window.electronAPI.saveTransaction({
      customer_name: customerName,
      items: transactionItems,
    });
    alert("Transaction saved!");
    transactionItems = [];
    customerNameInput.value = "";
    renderTransactionTable();
  } catch (err) {
    alert("Failed to save transaction.");
    console.error(err);
  }
});

// Initial load
(async function init() {
  await loadProducts();
  renderTransactionTable();
})();
