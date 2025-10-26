document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return (window.location.href = "/api/users/signin");

  const params = new URLSearchParams(window.location.search);
  const transactionId = params.get("id");
  if (!transactionId) {
    alert("No transaction ID found!");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const amountEl = document.getElementById("amount");
  const typeEl = document.getElementById("type");
  const categoryEl = document.getElementById("category");
  const dateEl = document.getElementById("date");
  const descriptionEl = document.getElementById("description");

  const successBox = document.querySelector(".success-message");
  const errorBox = document.querySelector(".error-message");

  try {
    const res = await fetch(`/api/transactions/${transactionId}`, { headers });
    if (!res.ok) throw new Error("Transaction not found");
    const t = await res.json();

    amountEl.textContent = `₦${t.amount.toLocaleString()}`;
    typeEl.textContent = t.type.charAt(0).toUpperCase() + t.type.slice(1);
    categoryEl.textContent = t.category;
    dateEl.textContent = new Date(t.date).toLocaleString();
    descriptionEl.textContent = t.description || "—";
  } catch (err) {
    showError(err.message);
  }

  document.getElementById("editBtn").addEventListener("click", () => {
    window.location.href = `/api/users/transactions/edit?id=${transactionId}`;
  });

  document.getElementById("deleteBtn").addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
      showSuccess("Transaction deleted successfully!");
      setTimeout(() => (window.location.href = "/api/users/transactions"), 2000);
    } catch (err) {
      showError(err.message);
    }
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
    successBox.style.display = "none";
  }

  function showSuccess(msg) {
    successBox.textContent = msg;
    successBox.style.display = "block";
    errorBox.style.display = "none";
  }
});
