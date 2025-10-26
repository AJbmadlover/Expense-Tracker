
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

    const welcomeText = document.getElementById("welcome_text");
    const cards = document.querySelectorAll(".card p");

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

    //FOR MAIN CHARTS


    async function loadChart() {
        function getStoredUser() {
  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));
  return user;
}

const user = getStoredUser();
const userId = user?.id; // undefined if not found

console.log("User ID:", userId);

  const res = await fetch(`/api/transactions/summary/`, { headers }); // include headers ${userId}
  const data = await res.json();

  const categories = Object.keys(data.expensesByCategory);
  const values = Object.values(data.expensesByCategory);

  // --- Pie chart (Expenses by category)
  const pieCtx = document.getElementById('expenseChart').getContext('2d');
  new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        label: 'Expenses by Category',
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Expenses by Category'
        }
      }
    }
  });

  // --- Bar chart (Income vs Expenses vs Balance)
  const barCtx = document.getElementById('incomeExpenseChart').getContext('2d');
  new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses', 'Balance'],
      datasets: [{
        data: [data.income, data.expenses, data.balance],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Income vs Expenses vs Balance'
        },
        tooltip: {
          enabled: false
        },
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

loadChart();


    //FOR THE CARDS 
    cards[0].textContent = `₦${summary.balance.toLocaleString()}`;
    cards[1].textContent = `₦${summary.income.toLocaleString()}`;
    cards[2].textContent = `₦${summary.expenses.toLocaleString()}`;
    }
    catch(error){
        console.error("Summary error:", error);
        welcomeText.textContent = "Failed to load data.";
        console.error(error);
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