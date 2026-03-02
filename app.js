document.addEventListener("DOMContentLoaded", () => {

  const STORAGE_KEY = "expense-tracker-data-v1";
  const THEME_KEY = "expense-tracker-theme";
  const LANG_KEY = "expense-tracker-lang";

  let transactions = [];

  /* ------------------ Elements ------------------ */
  const balanceEl = document.getElementById("balance");
  const totalIncomeEl = document.getElementById("totalIncome");
  const totalExpenseEl = document.getElementById("totalExpense");
  const transactionsListEl = document.getElementById("transactionsList");
  const emptyStateEl = document.getElementById("emptyState");
  const countLabelEl = document.getElementById("countLabel");

  const form = document.getElementById("transactionForm");
  const typeInput = document.getElementById("type");
  const titleInput = document.getElementById("title");
  const amountInput = document.getElementById("amount");
  const clearAllBtn = document.getElementById("clearAll");

  const themeToggleBtn = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  const langToggleBtn = document.getElementById("langToggle");
  const langText = document.getElementById("langText");

  /* ------------------ Translations ------------------ */
  const translations = {
    ar: {
      title: "متتبع المصاريف",
      subtitle: "تابع دخلك ومصاريفك بسهولة",
      balance: "الرصيد الحالي",
      income: "إجمالي الدخل",
      expense: "إجمالي المصروف",
      type: "النوع",
      incomeOption: "دخل",
      expenseOption: "مصروف",
      desc: "الوصف",
      amount: "المبلغ",
      add: "➕ إضافة عملية",
      clear: "🧹 مسح الكل",
      operations: "العمليات",
      empty: "لا توجد عمليات بعد، ابدأ بإضافة أول عملية.",
      dark: "الوضع الليلي",
      light: "الوضع النهاري",
      langButton: "English",
      currency: "ر.س"
    },

    en: {
      title: "Expense Tracker",
      subtitle: "Track your income and expenses easily",
      balance: "Current Balance",
      income: "Total Income",
      expense: "Total Expense",
      type: "Type",
      incomeOption: "Income",
      expenseOption: "Expense",
      desc: "Description",
      amount: "Amount",
      add: "➕ Add Transaction",
      clear: "🧹 Clear All",
      operations: "Transactions",
      empty: "No transactions yet. Add your first one.",
      dark: "Dark Mode",
      light: "Light Mode",
      langButton: "العربية",
      currency: "SAR"
    }
  };

  let currentLang = localStorage.getItem(LANG_KEY) || "ar";

  /* ------------------ Apply Language ------------------ */
  function applyLanguage() {
    const t = translations[currentLang];

    document.getElementById("titleText").textContent = t.title;
    document.getElementById("subtitleText").textContent = t.subtitle;

    document.getElementById("balanceLabel").textContent = t.balance;
    document.getElementById("incomeLabel").textContent = t.income;
    document.getElementById("expenseLabel").textContent = t.expense;

    document.getElementById("typeLabel").textContent = t.type;
    document.getElementById("incomeOption").textContent = t.incomeOption;
    document.getElementById("expenseOption").textContent = t.expenseOption;

    document.getElementById("descLabel").textContent = t.desc;
    document.getElementById("amountLabel").textContent = t.amount;

    document.getElementById("addBtn").textContent = t.add;
    document.getElementById("clearAll").textContent = t.clear;

    document.getElementById("operationsLabel").textContent = t.operations;
    document.getElementById("emptyState").textContent = t.empty;

    langText.textContent = t.langButton;

    const isDark = document.body.classList.contains("dark");
    themeText.textContent = isDark ? t.light : t.dark;
  }

  langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "ar" ? "en" : "ar";
    localStorage.setItem(LANG_KEY, currentLang);
    applyLanguage();
    render();
  });

  applyLanguage();

  /* ------------------ Theme ------------------ */
  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") {
      document.body.classList.add("dark");
      themeIcon.textContent = "☀️";
      themeText.textContent = translations[currentLang].light;
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.toggle("dark");
    if (isDark) {
      localStorage.setItem(THEME_KEY, "dark");
      themeIcon.textContent = "☀️";
      themeText.textContent = translations[currentLang].light;
    } else {
      localStorage.setItem(THEME_KEY, "light");
      themeIcon.textContent = "🌙";
      themeText.textContent = translations[currentLang].dark;
    }
  }

  themeToggleBtn.addEventListener("click", toggleTheme);
  loadTheme();

  /* ------------------ Load & Save ------------------ */
  function loadTransactions() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        transactions = JSON.parse(saved) || [];
      } catch {
        transactions = [];
      }
    }
    render();
  }

  function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  /* ------------------ Render ------------------ */
  function formatCurrency(value) {
    const t = translations[currentLang];
    return `${value.toLocaleString(currentLang === "ar" ? "ar-SA" : "en-US")} ${t.currency}`;
  }

  function render() {
    transactionsListEl.innerHTML = "";

    if (!transactions.length) {
      emptyStateEl.style.display = "block";
      countLabelEl.textContent = currentLang === "ar" ? "0 عملية" : "0 items";
    } else {
      emptyStateEl.style.display = "none";
      countLabelEl.textContent =
        currentLang === "ar"
          ? `${transactions.length} عملية`
          : `${transactions.length} items`;
    }

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;

      const row = document.createElement("div");
      row.className = "transaction";

      const main = document.createElement("div");
      const title = document.createElement("div");
      title.style.fontWeight = "600";
      title.textContent = t.title;

      const meta = document.createElement("div");
      meta.style.fontSize = "0.8rem";
      meta.style.color = "var(--muted)";
      meta.textContent = new Date(t.date).toLocaleString(currentLang === "ar" ? "ar-SA" : "en-US");

      main.appendChild(title);
      main.appendChild(meta);

      const amount = document.createElement("div");
      amount.className =
        "transaction-amount " + (t.type === "income" ? "income" : "expense");
      amount.textContent =
        (t.type === "income" ? "+" : "-") + formatCurrency(t.amount);

      const delBtn = document.createElement("button");
      delBtn.className = "transaction-delete";
      delBtn.textContent = currentLang === "ar" ? "حذف" : "Delete";
      delBtn.addEventListener("click", () => deleteTransaction(t.id));

      row.appendChild(main);
      row.appendChild(amount);
      row.appendChild(delBtn);

      transactionsListEl.appendChild(row);
    });

    const balance = totalIncome - totalExpense;
    balanceEl.textContent = formatCurrency(balance);
    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpenseEl.textContent = formatCurrency(totalExpense);
  }

  /* ------------------ Actions ------------------ */
  function addTransaction(e) {
    e.preventDefault();

    const type = typeInput.value;
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!title || isNaN(amount) || amount <= 0) return;

    const transaction = {
      id: Date.now(),
      type,
      title,
      amount,
      date: new Date().toISOString()
    };

    transactions.unshift(transaction);
    saveTransactions();
    render();

    form.reset();
    typeInput.value = "income";
  }

  function deleteTransaction(id) {
    transactions = transactions.filter((t) => t.id !== id);
    saveTransactions();
    render();
  }

  function clearAll() {
    if (!transactions.length) return;

    const confirmText =
      currentLang === "ar"
        ? "هل تريد مسح جميع العمليات؟"
        : "Are you sure you want to clear all transactions?";

    if (!confirm(confirmText)) return;

    transactions = [];
    saveTransactions();
    render();
  }

  form.addEventListener("submit", addTransaction);
  clearAllBtn.addEventListener("click", clearAll);

  loadTransactions();
});
