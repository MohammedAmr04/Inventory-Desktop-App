let currentPage = 1;
const pageSize = 15;
let totalProducts = 0;
let categories = [];
let editingProductId = null;

const productsTableBody = document.querySelector("#productsTable tbody");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const addProductBtn = document.getElementById("addProductBtn");
const modalBg = document.getElementById("productModalBg");
const modalTitle = document.getElementById("modalTitle");
const productForm = document.getElementById("productForm");
const formError = document.getElementById("formError");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const submitModalBtn = document.getElementById("submitModalBtn");
const nameInput = document.getElementById("productName");
const categorySelect = document.getElementById("productCategory");
const quantityInput = document.getElementById("productQuantity");
const costInput = document.getElementById("productCost");
const wholesaleInput = document.getElementById("productWholesale");
const retailInput = document.getElementById("productRetail");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoryModalBg = document.getElementById("categoryModalBg");
const categoryForm = document.getElementById("categoryForm");
const categoryFormError = document.getElementById("categoryFormError");
const cancelCategoryModalBtn = document.getElementById(
  "cancelCategoryModalBtn"
);
const categoryNameInput = document.getElementById("categoryNameInput");
const filterForm = document.getElementById("filterForm");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const minQty = document.getElementById("minQty");
const maxQty = document.getElementById("maxQty");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

let currentFilters = {};

async function loadCategories() {
  categories = await window.electronAPI.getCategories();
  categorySelect.innerHTML =
    '<option value="">Select category</option>' +
    categories
      .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");
  // Populate filter dropdown
  filterCategory.innerHTML =
    '<option value="">All Categories</option>' +
    categories
      .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");
}

function showModal(isEdit = false, product = null) {
  formError.textContent = "";
  productForm.reset();
  editingProductId = null;
  submitModalBtn.textContent = isEdit ? "Save" : "Add";
  modalTitle.textContent = isEdit ? "Edit Product" : "Add Product";
  if (isEdit && product) {
    editingProductId = product.id;
    nameInput.value = product.name;
    categorySelect.value = product.category_id;
    quantityInput.value = product.quantity;
    costInput.value = product.cost_price;
    wholesaleInput.value = product.wholesale_price;
    retailInput.value = product.retail_price;
  } else {
    categorySelect.value = "";
  }
  modalBg.classList.add("active");
}

function hideModal() {
  modalBg.classList.remove("active");
  editingProductId = null;
}

function validateForm() {
  const name = nameInput.value.trim();
  const categoryId = categorySelect.value;
  const quantity = quantityInput.value;
  const cost = costInput.value;
  const wholesale = wholesaleInput.value;
  const retail = retailInput.value;
  if (!name) return "Product name cannot be empty.";
  if (!categoryId) return "Please select a category.";
  if (!/^[0-9]+$/.test(quantity) || parseInt(quantity) < 0)
    return "Quantity must be an integer ≥ 0.";
  if (cost === "" || isNaN(cost) || Number(cost) < 0)
    return "Cost price must be a number ≥ 0.";
  if (wholesale === "" || isNaN(wholesale) || Number(wholesale) < 0)
    return "Wholesale price must be a number ≥ 0.";
  if (retail === "" || isNaN(retail) || Number(retail) < 0)
    return "Retail price must be a number ≥ 0.";
  if (Number(cost) > Number(wholesale))
    return "Cost price cannot be greater than wholesale price.";
  if (Number(wholesale) > Number(retail))
    return "Wholesale price cannot be greater than retail price.";
  return null;
}

async function loadProducts(page = 1, filters = currentFilters) {
  try {
    const { products, total } = await window.electronAPI.getProducts(
      page,
      pageSize,
      filters
    );
    totalProducts = total;
    renderTable(products);
    updatePagination();
  } catch (err) {
    productsTableBody.innerHTML = `<tr><td colspan="8">Failed to load products.</td></tr>`;
    console.error(err);
  }
}

function renderTable(products) {
  if (!products.length) {
    productsTableBody.innerHTML = `<tr><td colspan="8">No products found.</td></tr>`;
    return;
  }
  productsTableBody.innerHTML = products
    .map(
      (prod) => `
    <tr>
      <td>${prod.id}</td>
      <td>${prod.name}</td>
      <td>${prod.category || "-"}</td>
      <td>${prod.quantity}</td>
      <td>${prod.cost_price.toFixed(2)}</td>
      <td>${prod.wholesale_price.toFixed(2)}</td>
      <td>${prod.retail_price.toFixed(2)}</td>
      <td>
        <button class="icon-btn edit" title="Edit" data-id="${
          prod.id
        }"><i class="fa fa-pencil-alt"></i></button>
        <button class="icon-btn delete" title="Delete" data-id="${
          prod.id
        }"><i class="fa fa-trash"></i></button>
      </td>
    </tr>
  `
    )
    .join("");
}

function updatePagination() {
  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

productsTableBody.addEventListener("click", async (e) => {
  if (e.target.closest(".edit")) {
    const id = e.target.closest(".edit").dataset.id;
    try {
      const product = await window.electronAPI.getProductById(Number(id));
      showModal(true, product);
    } catch (err) {
      alert("Failed to load product details.");
      console.error(err);
    }
  } else if (e.target.closest(".delete")) {
    const id = e.target.closest(".delete").dataset.id;
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await window.electronAPI.deleteProduct(Number(id));
        await loadProducts(currentPage);
      } catch (err) {
        alert("Failed to delete product.");
        console.error(err);
      }
    }
  }
});

addProductBtn.addEventListener("click", () => {
  showModal(false);
});

cancelModalBtn.addEventListener("click", hideModal);
modalBg.addEventListener("click", (e) => {
  if (e.target === modalBg) hideModal();
});

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";
  const error = validateForm();
  if (error) {
    formError.textContent = error;
    return;
  }
  const product = {
    name: nameInput.value.trim(),
    category_id: Number(categorySelect.value),
    quantity: Number(quantityInput.value),
    cost_price: Number(costInput.value),
    wholesale_price: Number(wholesaleInput.value),
    retail_price: Number(retailInput.value),
  };
  try {
    if (editingProductId) {
      product.id = editingProductId;
      await window.electronAPI.editProduct(product);
    } else {
      await window.electronAPI.addProduct(product);
    }
    hideModal();
    await loadProducts(currentPage);
  } catch (err) {
    formError.textContent = "Failed to save product.";
    console.error(err);
  }
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadProducts(currentPage);
  }
});
nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
  if (currentPage < totalPages) {
    currentPage++;
    loadProducts(currentPage);
  }
});

addCategoryBtn.addEventListener("click", () => {
  categoryFormError.textContent = "";
  categoryForm.reset();
  categoryModalBg.classList.add("active");
  categoryNameInput.focus();
});
cancelCategoryModalBtn.addEventListener("click", () => {
  categoryModalBg.classList.remove("active");
});
categoryModalBg.addEventListener("click", (e) => {
  if (e.target === categoryModalBg) categoryModalBg.classList.remove("active");
});
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  categoryFormError.textContent = "";
  const name = categoryNameInput.value.trim();
  if (!name) {
    categoryFormError.textContent = "Category name cannot be empty.";
    return;
  }
  try {
    await window.electronAPI.addCategory(name);
    categoryModalBg.classList.remove("active");
    await loadCategories();
  } catch (err) {
    if (err && err.message && err.message.includes("UNIQUE")) {
      categoryFormError.textContent = "Category already exists.";
    } else {
      categoryFormError.textContent = "Failed to add category.";
    }
    console.error(err);
  }
});

filterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  currentFilters = {
    search: searchInput.value.trim(),
    category: filterCategory.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    minQty: minQty.value,
    maxQty: maxQty.value,
  };
  currentPage = 1;
  loadProducts(currentPage, currentFilters);
});

clearFiltersBtn.addEventListener("click", () => {
  filterForm.reset();
  currentFilters = {};
  currentPage = 1;
  loadProducts(currentPage, currentFilters);
});

// Initial load
(async function init() {
  await loadCategories();
  await loadProducts(currentPage);
})();
