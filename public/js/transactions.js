// Wait for the entire DOM to load before running anything
document.addEventListener("DOMContentLoaded", async () => {

  // === 🔐 AUTH CHECK ===========================================
  // Try to get the JWT token from either localStorage or sessionStorage
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // If there’s no token, redirect user back to signin
  if (!token) {
    window.location.href = "/api/users/signin";
    return;
  }

  // Common headers for all API requests
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // === 🌟 UNIVERSAL ELEMENT REFERENCES ==========================
  const form = document.querySelector("form");
  const amountInput = form.querySelector('input[name="amount"]');
  const typeInput = form.querySelector('select[name="type"]');
  const categoryInput = form.querySelector('input[name="category"]');
  const descriptionInput = form.querySelector('textarea[name="description"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorBox = document.querySelector(".error-message");
  const successBox = document.querySelector(".success-message");
  const transactionsTable = document.querySelector(".transactions tbody");
  const welcomeText = document.getElementById("welcome_text");

  // === 🌍 UNIVERSAL HELPERS =====================================
  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = message ? "block" : "none";

      if (message) {
      setTimeout(() => {
        errorBox.style.display = "none";
      }, 3000);
    }
    } else if (message) {
      alert(message);
    }
  }

  function showSuccess(message) {
    if (successBox) {
      successBox.textContent = message;
      successBox.style.display = message ? "block" : "none";

      if (message) {
      setTimeout(() => {
        successBox.style.display = "none";
      }, 3000);
    }
    } else if (message) {
      alert(message);
    }
  }

  // === 🔄 INITIAL DATA LOAD =====================================
  // Loads profile, summary, and transactions at once
  async function loadDashboardData() {
    try {
      // 1️⃣ Load profile (for welcome text)
      const profileRes = await fetch("/api/users/profile", { headers });
      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profile = await profileRes.json();
      welcomeText.textContent = `Welcome, ${profile.name}`;

      // 2️⃣ Load summary (for cards)
      await updateSummary();

      // 3️⃣ Load transactions (for table)
      const transactionsRes = await fetch("/api/transactions", { headers });
      if (!transactionsRes.ok) throw new Error("Failed to fetch transactions");
      const transactions = await transactionsRes.json();

      renderTransactions(transactions);
    } catch (error) {
      console.error("Dashboard load error:", error);
      showError("Failed to load dashboard data.");
    }
  }

  // === 🧾 RENDER TRANSACTIONS TABLE ==============================
  function renderTransactions(transactions) {
    transactionsTable.innerHTML = "";

    if (!transactions.length) {
      transactionsTable.innerHTML =
        '<tr><td colspan="5">No transactions found</td></tr>';
      return;
    }

    transactions.forEach((transaction) => {
      const tr = document.createElement("tr");
      const date = new Date(transaction.date).toLocaleDateString();
      const type =
        transaction.type.charAt(0).toUpperCase() +
        transaction.type.slice(1).toLowerCase();
      const tooltip = transaction.description
        ? transaction.description.replace(/"/g, "'")
        : "No description";

      tr.innerHTML = `
        <td title="${tooltip}">${date}</td>
        <td title="${tooltip}">₦${transaction.amount.toLocaleString()}</td>
        <td title="${tooltip}">${type}</td>
        <td title="${tooltip}">${transaction.category}</td>
        <td title="${tooltip}">
          <button class="edit" data-id="${transaction._id}">✏️</button>
          <button class="delete" data-id="${transaction._id}">🗑</button>
        </td>
      `;

      transactionsTable.appendChild(tr);
    });
  }

  // === ➕ ADD NEW TRANSACTION (NO RELOAD) ========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = amountInput.value.trim();
    const type = typeInput.value.trim();
    const category = categoryInput.value.trim();
    const description = descriptionInput.value.trim();
    const date = Date.now();

    if (!amount || !type || !category) {
      return showError("Amount, Type, and Category are required fields.");
    }

    submitBtn.disabled = true;
    showError("");

    try {
      // Send new transaction to the backend
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers,
        body: JSON.stringify({ amount, type, category, description, date }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error adding transaction.");
      }

      showSuccess("Transaction added successfully!");

      // Immediately show it in the table (prepend to top)
      const newRow = document.createElement("tr");
      const formattedDate = new Date(date).toLocaleDateString();
      const typeLabel =
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      const tooltip = description || "No description";

      newRow.innerHTML = `
        <td title="${tooltip}">${formattedDate}</td>
        <td title="${tooltip}">₦${Number(amount).toLocaleString()}</td>
        <td title="${tooltip}">${typeLabel}</td>
        <td title="${tooltip}">${category}</td>
        <td title="${tooltip}">
          <button class="edit" data-id="${data._id}">✏️</button>
          <button class="delete" data-id="${data._id}">🗑</button>
        </td>
      `;

      transactionsTable.prepend(newRow);

      // Reset form fields
      form.reset();

      // Update summary cards after addition
      updateSummary();
    } catch (error) {
      console.error("Transaction add error:", error);
      showError(error.message || "Failed to add transaction.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  // === 📊 UPDATE SUMMARY CARDS ==================================
  async function updateSummary() {
    try {
      const res = await fetch("/api/transactions/summary", { headers });
      if (!res.ok) return;

      const summary = await res.json();
      const cards = document.querySelectorAll(".card p");

      if (cards.length >= 3) {
        cards[0].textContent = `₦${summary.balance.toLocaleString()}`;
        cards[1].textContent = `₦${summary.income.toLocaleString()}`;
        cards[2].textContent = `₦${summary.expenses.toLocaleString()}`;
      }
    } catch (e) {
      console.error("Failed to update summary:", e);
    }
  }

  // === ❌ DELETE TRANSACTION =====================================
  transactionsTable.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete")) return;

    const id = e.target.dataset.id;
    if (!id) return showError("No ID found for this transaction");

    const confirmDelete = confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        e.target.closest("tr").remove();
        showSuccess("Transaction deleted successfully!");
        updateSummary();
      } else {
        showError("Failed to delete transaction.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showError("Error deleting transaction.");
    }
  });

  // === ✏️ UPDATE TRANSACTION (MODAL) =============================
  const modal = document.getElementById("editModal");
  const closeBtn = document.querySelector(".close");
  const editForm = document.getElementById("editForm");

  // Open modal and fill fields
  transactionsTable.addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit")) return;

    const id = e.target.dataset.id;
    const row = e.target.closest("tr");
    const [dateTd, amountTd, typeTd, categoryTd] = row.children;

    editForm.elements.id.value = id;
    editForm.elements.amount.value = amountTd.textContent
      .replace("₦", "")
      .replace(/,/g, "")
      .trim();
    editForm.elements.type.value = typeTd.textContent.toLowerCase();
    editForm.elements.category.value = categoryTd.textContent.trim();
    editForm.elements.description.value = "";

    modal.style.display = "block";
  });

  // Close modal logic
  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };

  // Handle update form submit
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = editForm.elements.id.value;
    const amount = editForm.elements.amount.value.trim();
    const type = editForm.elements.type.value.trim();
    const category = editForm.elements.category.value.trim();
    const description = editForm.elements.description.value.trim();

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ amount, type, category, description }),
      });

      if (!res.ok) throw new Error("Failed to update transaction.");

      showSuccess("Transaction updated successfully!");
      modal.style.display = "none";
      await loadDashboardData(); // reload table only (not page)
    } catch (err) {
      console.error("Update error:", err);
      showError(err.message);
    }
  });

  // === 📂 SIDEBAR NAVIGATION ====================================
  document.getElementById("dashboard").addEventListener("click", () => {
    window.location.href = "/api/users/dashboard";
  });

  document.getElementById("transationBtn").addEventListener("click", () => {
    window.location.href = "/api/users/transactions";
  });

  document.getElementById("summaryBtn").addEventListener("click", () => {
    window.location.href = "/api/users/summary";
  });

  // === 🚪 LOGOUT ================================================
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/api/users/signin";
  });

  // Finally, load the dashboard data once everything is ready
  await loadDashboardData();
});
