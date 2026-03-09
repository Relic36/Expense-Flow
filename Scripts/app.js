// Expense Categories Configuration
const CATEGORIES = {
    food: { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
    entertainment: { name: 'Entertainment', icon: '🎬', color: '#4ECDC4' },
    travel: { name: 'Travel', icon: '✈️', color: '#45B7D1' },
    shopping: { name: 'Shopping', icon: '🛍️', color: '#96CEB4' },
    bills: { name: 'Bills & Utilities', icon: '💡', color: '#FECA57' },
    healthcare: { name: 'Healthcare', icon: '🏥', color: '#FF9FF3' },
    education: { name: 'Education', icon: '📚', color: '#54A0FF' },
    friends: { name: 'Friends & Social', icon: '👥', color: '#5F27CD' },
    miscellaneous: { name: 'Miscellaneous', icon: '📦', color: '#C8D6E5' }
};

const CURRENCY_RATES = {
    '₹': 1,
    '$': 83,
    '€': 90,
    '£': 105
};

// Main Expense Tracker Class
class ExpenseTracker {
    constructor() {
        this.expenses = StorageManager.loadExpenses();
        this.monthlyIncome = StorageManager.loadMonthlyIncome();

        try {
            this.currencySymbol = localStorage.getItem('expenseFlow_currency') || '₹';
        } catch (e) {
            this.currencySymbol = '₹';
        }

        this.budget = StorageManager.loadBudget();
        this.currentSection = 'dashboard';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateCategories();
        this.populateFilterMonths();
        this.populateFriends();
        this.updateDashboard();
        this.checkRecurringExpenses();
    }

    setupEventListeners() {
        // Quick expense form
        document.getElementById('quick-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.switchSection(sectionId);
            });
        });

        // Mobile menu
        document.querySelector('.mobile-menu').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // FAB for mobile
        document.getElementById('mobile-fab').addEventListener('click', () => {
            this.showAddExpenseModal();
        });

        // Export buttons
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        const exportPdfBtn = document.getElementById('export-pdf-btn');
        if (exportPdfBtn) exportPdfBtn.addEventListener('click', () => ExportManager.exportToPDF());

        const exportExcelBtn = document.getElementById('export-excel-btn');
        if (exportExcelBtn) exportExcelBtn.addEventListener('click', () => ExportManager.exportToExcel());

        // Report Section Export Buttons
        const exportPdfReportBtn = document.getElementById('export-pdf-report-btn');
        if (exportPdfReportBtn) exportPdfReportBtn.addEventListener('click', () => ExportManager.exportToPDF());

        const exportExcelReportBtn = document.getElementById('export-excel-report-btn');
        if (exportExcelReportBtn) exportExcelReportBtn.addEventListener('click', () => ExportManager.exportToExcel());

        const exportJsonReportBtn = document.getElementById('export-json-report-btn');
        if (exportJsonReportBtn) exportJsonReportBtn.addEventListener('click', () => this.exportData());

        // Income modal
        document.getElementById('add-income-btn').addEventListener('click', () => {
            this.showIncomeModal();
        });

        const addExpenseBtn = document.getElementById('add-expense-btn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this.showAddExpenseModal();
            });
        }

        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideModal('income-modal');
        });

        const incomeForm = document.getElementById('income-form');
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const month = document.getElementById('income-month').value;
                const amount = parseFloat(document.getElementById('income-amount').value);
                if (month && amount) {
                    this.monthlyIncome[month] = amount;
                    StorageManager.saveMonthlyIncome(this.monthlyIncome);
                    this.updateDashboard();
                    this.hideModal('income-modal');
                    this.showNotification('Income saved successfully!', 'success');
                    incomeForm.reset();
                }
            });
        }

        // Settings buttons
        const backupBtn = document.getElementById('backup-data');
        if (backupBtn) backupBtn.addEventListener('click', () => ExportManager.backupToCloud());

        const restoreBtn = document.getElementById('restore-data');
        if (restoreBtn) restoreBtn.addEventListener('click', () => ExportManager.restoreFromCloud());

        const exportAllBtn = document.getElementById('export-all');
        if (exportAllBtn) exportAllBtn.addEventListener('click', () => this.exportData());

        const resetBtn = document.getElementById('reset-data');
        if (resetBtn) resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                StorageManager.clearAllData();
                window.location.reload();
            }
        });

        const addCategoryBtn = document.getElementById('add-category');
        if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => {
            this.showNotification('Custom categories coming soon!', 'info');
        });

        // Theme toggle
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
            // load saved theme
            let savedTheme = 'auto';
            try {
                savedTheme = localStorage.getItem('expenseFlow_theme') || 'auto';
            } catch (e) { }
            themeSelect.value = savedTheme;
            this.setTheme(savedTheme);
        }
        // Filtering Dropdowns in Expenses view
        const filterMonth = document.getElementById('expense-filter-month');
        const filterCategory = document.getElementById('expense-filter-category');

        if (filterCategory) {
            filterCategory.addEventListener('change', () => this.updateAllExpenses());
        }

        // Currency toggle
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.value = this.currencySymbol;
            currencySelect.addEventListener('change', (e) => {
                this.handleCurrencyChange(e.target.value);
            });
        }

        // Budget settings
        const budgetInput = document.getElementById('monthly-budget');
        const alertSelect = document.getElementById('budget-alerts');
        if (budgetInput && alertSelect) {
            budgetInput.value = this.budget.amount || '';
            alertSelect.value = this.budget.threshold || '80';

            budgetInput.addEventListener('input', (e) => this.handleBudgetChange());
            alertSelect.addEventListener('change', (e) => this.handleBudgetChange());
        }
    }

    handleBudgetChange() {
        const amount = parseFloat(document.getElementById('monthly-budget').value) || 0;
        const threshold = parseInt(document.getElementById('budget-alerts').value) || 80;

        this.budget = { amount, threshold };
        StorageManager.saveBudget(this.budget);
        this.updateDashboard();
    }


    handleCurrencyChange(newSymbol) {
        const oldRate = CURRENCY_RATES[this.currencySymbol] || 1;
        const newRate = CURRENCY_RATES[newSymbol] || 1;
        const ratio = oldRate / newRate;

        // Convert expenses
        this.expenses = this.expenses.map(exp => ({
            ...exp,
            amount: exp.amount * ratio
        }));

        // Convert income
        Object.keys(this.monthlyIncome).forEach(month => {
            this.monthlyIncome[month] *= ratio;
        });

        // Convert friends data
        FriendsManager.convertCurrency(ratio, newSymbol);

        // Convert budget
        if (this.budget.amount) {
            this.budget.amount *= ratio;
            StorageManager.saveBudget(this.budget);
            const budgetInput = document.getElementById('monthly-budget');
            if (budgetInput) budgetInput.value = this.budget.amount.toFixed(2);
        }

        this.currencySymbol = newSymbol;
        try {
            localStorage.setItem('expenseFlow_currency', newSymbol);
        } catch (e) { }

        StorageManager.saveExpenses(this.expenses);
        StorageManager.saveMonthlyIncome(this.monthlyIncome);

        this.updateDashboard();
        this.showNotification(`Currency converted to ${newSymbol}`, 'success');
    }

    populateCategories() {
        const categorySelect = document.getElementById('category');
        const filterCategorySelect = document.getElementById('expense-filter-category');

        categorySelect.innerHTML = '<option value="">Select Category</option>';
        if (filterCategorySelect) filterCategorySelect.innerHTML = '<option value="">All Categories</option>';

        Object.entries(CATEGORIES).forEach(([key, category]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${category.icon} ${category.name}`;
            categorySelect.appendChild(option);

            if (filterCategorySelect) {
                const filterOption = document.createElement('option');
                filterOption.value = key;
                filterOption.textContent = `${category.icon} ${category.name}`;
                filterCategorySelect.appendChild(filterOption);
            }
        });
    }

    populateFilterMonths() {
        const filterMonthSelect = document.getElementById('expense-filter-month');
        if (!filterMonthSelect) return;

        filterMonthSelect.innerHTML = '<option value="">All Months</option>';

        const months = new Set();
        this.expenses.forEach(exp => {
            const date = new Date(exp.date);
            const monthStr = date.toISOString().slice(0, 7); // "YYYY-MM"
            months.add(monthStr);
        });

        // Sort descending
        const sortedMonths = Array.from(months).sort().reverse();

        sortedMonths.forEach(monthVal => {
            const date = new Date(monthVal + "-01");
            const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

            const option = document.createElement('option');
            option.value = monthVal;
            option.textContent = label;
            filterMonthSelect.appendChild(option);
        });
    }

    populateFriends() {
        const friendSelect = document.getElementById('friend');
        if (!friendSelect) return;

        friendSelect.innerHTML = '<option value="">Not with friend</option>';

        FriendsManager.friends.forEach(friend => {
            const option = document.createElement('option');
            option.value = friend.id;
            option.textContent = `👤 ${friend.name}`;
            friendSelect.appendChild(option);
        });
    }

    addExpense() {
        const formData = new FormData(document.getElementById('quick-expense-form'));

        const expense = {
            id: Date.now(),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            description: formData.get('description'),
            date: formData.get('date') || new Date().toISOString().split('T')[0],
            friendId: formData.get('friend') || null,
            createdAt: new Date().toISOString()
        };

        // Validate required fields
        if (!expense.amount || !expense.category) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.expenses.push(expense);
        StorageManager.saveExpenses(this.expenses);

        // If a friend is tagged, add it as a transaction where they owe you
        if (expense.friendId) {
            if (typeof FriendsManager !== 'undefined') {
                FriendsManager.addFriendTransaction(parseInt(expense.friendId), expense.amount, `Expense: ${expense.description || expense.category}`);
            }
        }

        this.populateFilterMonths();
        this.updateDashboard();
        document.getElementById('quick-expense-form').reset();

        this.showNotification('Expense added successfully!', 'success');
    }

    updateDashboard() {
        this.updateCurrentMonthSummary();
        this.updateRecentExpenses();
        this.updateAllExpenses();
        this.updateCharts();
    }

    updateCurrentMonthSummary() {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const monthlyExpenses = this.expenses.filter(exp =>
            exp.date.startsWith(currentMonth)
        );

        const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const monthlyIncome = this.monthlyIncome[currentMonth] || 0;
        const balance = monthlyIncome - totalExpenses;
        const dailyAverage = totalExpenses / new Date().getDate();

        document.querySelector('.stat-value.income').textContent = `${this.currencySymbol}${monthlyIncome.toLocaleString()}`;
        document.querySelector('.stat-value.expense').textContent = `${this.currencySymbol}${totalExpenses.toLocaleString()}`;
        document.querySelector('.stat-value.balance').textContent = `${this.currencySymbol}${balance.toLocaleString()}`;
        document.querySelector('.stat-value.average').textContent = `${this.currencySymbol}${dailyAverage.toFixed(2)}`;

        // Highlight balance
        const balanceElement = document.querySelector('.stat-item.highlight');
        balanceElement.style.background = balance < 0 ?
            'linear-gradient(45deg, #ff4757, #ff6b81)' :
            'linear-gradient(45deg, var(--accent-purple), var(--accent-blue))';

        this.updateBudgetProgress(totalExpenses);
    }

    updateBudgetProgress(spent) {
        const container = document.getElementById('budget-container');
        if (!this.budget.amount || this.budget.amount <= 0) {
            if (container) container.style.display = 'none';
            return;
        }

        if (container) container.style.display = 'block';

        const percent = Math.min((spent / this.budget.amount) * 100, 100);
        const remaining = Math.max(this.budget.amount - spent, 0);

        const progressFill = document.getElementById('budget-progress');
        const percentText = document.getElementById('budget-percent');
        const remainingText = document.getElementById('budget-remaining');
        const totalText = document.getElementById('budget-total');

        if (progressFill) {
            progressFill.style.width = `${percent}%`;
            progressFill.classList.remove('warning', 'danger');
            if (percent >= 100) progressFill.classList.add('danger');
            else if (percent >= this.budget.threshold) progressFill.classList.add('warning');
        }

        if (percentText) percentText.textContent = `${Math.round(percent)}%`;
        if (remainingText) remainingText.textContent = `Remaining: ${this.currencySymbol}${remaining.toLocaleString()}`;
        if (totalText) totalText.textContent = `Limit: ${this.currencySymbol}${this.budget.amount.toLocaleString()}`;

        this.checkBudgetAlert(spent, percent);
    }

    checkBudgetAlert(spent, percent) {
        let lastAlert = null;
        try {
            lastAlert = sessionStorage.getItem('last_budget_alert');
        } catch (e) { }

        let currentLevel = '';

        if (percent >= 100) currentLevel = '100';
        else if (percent >= this.budget.threshold) currentLevel = this.budget.threshold.toString();

        if (currentLevel && lastAlert !== currentLevel) {
            const msg = percent >= 100 ?
                `Alert: You have exceeded your monthly budget!` :
                `Warning: You have used ${currentLevel}% of your monthly budget.`;
            this.showNotification(msg, percent >= 100 ? 'error' : 'info');
            try { sessionStorage.setItem('last_budget_alert', currentLevel); } catch (e) { }
        } else if (!currentLevel) {
            try { sessionStorage.removeItem('last_budget_alert'); } catch (e) { }
        }
    }


    updateRecentExpenses() {
        const recentList = document.getElementById('recent-expenses-list');
        const recentExpenses = this.expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (recentExpenses.length === 0) {
            recentList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses yet. Add your first expense!</p>
                </div>
            `;
            return;
        }

        recentList.innerHTML = recentExpenses.map(expense => `
            <div class="expense-item">
                <div class="expense-icon">${CATEGORIES[expense.category]?.icon || '📦'}</div>
                <div class="expense-details">
                    <div class="expense-desc">${expense.description || 'No description'}</div>
                    <div class="expense-meta">${this.formatDate(expense.date)} • ${CATEGORIES[expense.category]?.name || 'Other'}</div>
                </div>
                <div class="expense-amount">
                    ${this.currencySymbol}${expense.amount.toLocaleString()}
                    ${expense.isEdited ? '<span class="edited-badge">Edited</span>' : ''}
                    <div class="expense-actions">
                        <button class="btn-text edit-expense" onclick="window.expenseTracker.showEditExpenseModal(${expense.id})" title="Edit Expense">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-text delete-expense" onclick="window.expenseTracker.deleteExpense(${expense.id})" title="Delete Expense">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateAllExpenses() {
        const list = document.getElementById('all-expenses-list');
        if (!list) return;

        const filterMonth = document.getElementById('expense-filter-month')?.value;
        const filterCategory = document.getElementById('expense-filter-category')?.value;

        // Apply filters
        const filteredExpenses = this.expenses.filter(expense => {
            let matchMonth = true;
            let matchCategory = true;

            if (filterMonth) {
                matchMonth = expense.date.startsWith(filterMonth);
            }
            if (filterCategory) {
                matchCategory = expense.category === filterCategory;
            }

            return matchMonth && matchCategory;
        });

        if (filteredExpenses.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses found.</p>
                </div>
            `;
            // update stats to 0
            const totalExpensesCount = document.getElementById('total-expenses-count');
            const totalExpensesAmount = document.getElementById('total-expenses-amount');
            const avgExpense = document.getElementById('avg-expense');
            if (totalExpensesCount) totalExpensesCount.textContent = '0';
            if (totalExpensesAmount) totalExpensesAmount.textContent = this.currencySymbol + '0';
            if (avgExpense) avgExpense.textContent = this.currencySymbol + '0';
            return;
        }

        list.innerHTML = filteredExpenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(expense => `
            <div class="expense-item">
                <div class="expense-icon">${CATEGORIES[expense.category]?.icon || '📦'}</div>
                <div class="expense-details">
                    <div class="expense-desc">${expense.description || 'No description'}</div>
                    <div class="expense-meta">${this.formatDate(expense.date)} • ${CATEGORIES[expense.category]?.name || 'Other'}</div>
                </div>
                <div class="expense-amount">
                    ${this.currencySymbol}${expense.amount.toLocaleString()}
                    ${expense.isEdited ? '<span class="edited-badge">Edited</span>' : ''}
                    <div class="expense-actions">
                        <button class="btn-text edit-expense" onclick="window.expenseTracker.showEditExpenseModal(${expense.id})" title="Edit Expense">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-text delete-expense" onclick="window.expenseTracker.deleteExpense(${expense.id})" title="Delete Expense">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Update stats
        const totalExpensesCount = document.getElementById('total-expenses-count');
        const totalExpensesAmount = document.getElementById('total-expenses-amount');
        const avgExpense = document.getElementById('avg-expense');

        if (totalExpensesCount) totalExpensesCount.textContent = filteredExpenses.length;
        if (totalExpensesAmount) {
            const sum = filteredExpenses.reduce((s, e) => s + e.amount, 0);
            totalExpensesAmount.textContent = this.currencySymbol + sum.toLocaleString();
            if (avgExpense) {
                avgExpense.textContent = this.currencySymbol + (filteredExpenses.length ? (sum / filteredExpenses.length).toFixed(2) : 0);
            }
        }
    }

    updateCharts() {
        // Monthly comparison chart
        ChartsManager.updateMonthlyChart(this.expenses);

        // Category breakdown chart
        ChartsManager.updateCategoryChart(this.expenses);

        // Reports section charts
        ChartsManager.updateReportsCharts(this.expenses);
    }

    checkRecurringExpenses() {
        RecurringManager.checkRecurringExpenses(this.expenses);
    }

    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        document.getElementById(sectionId).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');

        this.currentSection = sectionId;
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    }

    showAddExpenseModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Add New Expense</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="modal-expense-form">
                    <div class="form-group">
                        <input type="number" name="amount" placeholder="Amount" required step="0.01">
                        <select name="category" required>
                            <option value="">Select Category</option>
                            ${Object.entries(CATEGORIES).map(([key, cat]) =>
            `<option value="${key}">${cat.icon} ${cat.name}</option>`
        ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="text" name="description" placeholder="Description">
                        <input type="date" name="date">
                    </div>
                    <button type="submit" class="btn-primary">Add Expense</button>
                </form>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpenseFromModal(modal);
        });

        document.body.appendChild(modal);
    }

    showEditExpenseModal(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Edit Expense</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="edit-expense-form">
                    <div class="form-group">
                        <input type="number" name="amount" placeholder="Amount" required step="0.01" value="${expense.amount}">
                        <select name="category" required>
                            <option value="">Select Category</option>
                            ${Object.entries(CATEGORIES).map(([key, cat]) =>
            `<option value="${key}" ${key === expense.category ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
        ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="text" name="description" placeholder="Description" value="${expense.description || ''}">
                        <input type="date" name="date" value="${expense.date}">
                    </div>
                    <button type="submit" class="btn-primary">Update Expense</button>
                </form>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateExpense(id, modal);
        });

        document.body.appendChild(modal);
    }

    updateExpense(id, modal) {
        const form = modal.querySelector('form');
        const formData = new FormData(form);

        const amount = parseFloat(formData.get('amount'));
        const category = formData.get('category');
        const description = formData.get('description');
        const date = formData.get('date');

        if (!amount || !category) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const expenseIndex = this.expenses.findIndex(exp => exp.id === id);
        if (expenseIndex === -1) return;

        // Update expense object
        this.expenses[expenseIndex] = {
            ...this.expenses[expenseIndex],
            amount,
            category,
            description,
            date,
            isEdited: true,
            updatedAt: new Date().toISOString()
        };

        StorageManager.saveExpenses(this.expenses);
        this.updateDashboard();
        this.updateAllExpenses();
        modal.remove();

        this.showNotification('Expense updated successfully!', 'success');
    }

    addExpenseFromModal(modal) {
        const form = modal.querySelector('form');
        const formData = new FormData(form);

        const amount = parseFloat(formData.get('amount'));
        const category = formData.get('category');
        const description = formData.get('description');
        const date = formData.get('date') || new Date().toISOString().split('T')[0];

        if (!amount || !category) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const expense = {
            id: Date.now(),
            amount: amount,
            category: category,
            description: description,
            date: date,
            friendId: formData.get('friend') || null, // Capture friendId if your modal ever adds it
            createdAt: new Date().toISOString()
        };

        this.expenses.push(expense);
        StorageManager.saveExpenses(this.expenses);

        // If a friend is tagged, add it as a transaction where they owe you
        if (expense.friendId) {
            if (typeof FriendsManager !== 'undefined') {
                FriendsManager.addFriendTransaction(parseInt(expense.friendId), expense.amount, `Expense: ${expense.description || expense.category}`);
            }
        }

        this.updateDashboard();
        this.updateAllExpenses();
        modal.remove();

        this.showNotification('Expense added successfully!', 'success');
    }

    deleteExpense(id) {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        const expenseIndex = this.expenses.findIndex(exp => exp.id === id);
        if (expenseIndex === -1) return;

        const expense = this.expenses[expenseIndex];

        // Remove from the array
        this.expenses.splice(expenseIndex, 1);

        // Save to storage
        StorageManager.saveExpenses(this.expenses);

        // Update UI
        this.populateFilterMonths();
        this.updateDashboard();
        this.updateAllExpenses();

        this.showNotification('Expense deleted successfully!', 'info');
    }

    showIncomeModal() {
        document.getElementById('income-modal').classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    exportData() {
        const data = StorageManager.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `expenseflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!', 'success');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setTheme(theme) {
        try { localStorage.setItem('expenseFlow_theme', theme); } catch (e) { }
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.remove('light-theme', 'dark-theme');
            // Check system preference for auto
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.add('dark-theme');
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTracker();
});
