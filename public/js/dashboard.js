document.addEventListener("DOMContentLoaded", async () => {
  // --- 🔐 Retrieve JWT token from localStorage or sessionStorage
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "/api/users/signin";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // --- 🎯 Select DOM elements
  const welcomeText = document.getElementById("welcome_text");
  const cards = document.querySelectorAll(".card p");
  const transactionsTable = document.querySelector(".transactions tbody");

  // --- ✨ Show temporary loading states
  welcomeText.textContent = "Loading...";
  cards[0].textContent = "Loading...";
  cards[1].textContent = "Loading...";
  cards[2].textContent = "Loading...";
  transactionsTable.innerHTML =
    '<tr><td colspan="4">Loading transactions...</td></tr>';

  try {
    // --- 1️⃣ Fetch user profile
    const profileRes = await fetch("/api/users/profile", { headers });
    if (!profileRes.ok) throw new Error("Failed to fetch profile");
    const profile = await profileRes.json();

    welcomeText.textContent = `Welcome, ${profile.name}`;

    // --- 2️⃣ Fetch summary
    const summaryRes = await fetch("/api/transactions/summary", { headers });
    if (!summaryRes.ok) throw new Error("Failed to fetch summary");
    const summary = await summaryRes.json();

    cards[0].textContent = `₦${summary.balance.toLocaleString()}`;
    cards[1].textContent = `₦${summary.income.toLocaleString()}`;
    cards[2].textContent = `₦${summary.expenses.toLocaleString()}`;

    // --- 3️⃣ Fetch transactions
    const transactionsRes = await fetch("/api/transactions", { headers });
    if (!transactionsRes.ok) throw new Error("Failed to fetch transactions");
    const transactions = await transactionsRes.json();

    // --- 🧾 Clear placeholder rows
    transactionsTable.innerHTML = "";

    if (transactions.length === 0) {
      transactionsTable.innerHTML =
        '<tr><td colspan="4">No transactions found</td></tr>';
    } else {
      transactions.forEach((t) => {
        const tr = document.createElement("tr");
        const date = new Date(t.date).toLocaleDateString();
        const type =
          t.type.charAt(0).toUpperCase() + t.type.slice(1).toLowerCase();
        tr.innerHTML = `
          <td>${date}</td>
          <td>₦${t.amount.toLocaleString()}</td>
          <td>${type}</td>
          <td>${t.category}</td>
        `;
        transactionsTable.appendChild(tr);
      });
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    welcomeText.textContent = "Failed to load data.";
    transactionsTable.innerHTML =
      '<tr><td colspan="4">Error loading transactions.</td></tr>';
  }



// SIDEBAR FUNCTIONALITY


const dashboard = document.getElementById("dashboard");
dashboard.addEventListener("click", ()=>{
  window.location.href="/api/users/dashboard";
})

const transationBtn = document.getElementById("transationBtn");
transationBtn.addEventListener("click", ()=>{
  window.location.href="/api/users/transactions";
})

const summaryBtn = document.getElementById("summaryBtn");
summaryBtn.addEventListener("click", ()=>{
  window.location.href="/api/users/summary";
})

  // --- 🚪 Logout functionality
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/api/users/signin";
  });
});