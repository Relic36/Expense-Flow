// Storage Manager - Handles all localStorage operations
class StorageManager {
    static safeGetItem(key, defaultValue) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.warn(`localStorage blocked or unavailable for key: ${key}`);
            return defaultValue;
        }
    }

    static safeSetItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`localStorage blocked or unavailable for key: ${key}`);
        }
    }

    static saveExpenses(expenses) {
        this.safeSetItem('expenseFlow_expenses', expenses);
    }

    static loadExpenses() {
        return this.safeGetItem('expenseFlow_expenses', []);
    }

    static saveMonthlyIncome(incomeData) {
        this.safeSetItem('expenseFlow_monthlyIncome', incomeData);
    }

    static loadMonthlyIncome() {
        return this.safeGetItem('expenseFlow_monthlyIncome', {});
    }

    static saveFriends(friends) {
        this.safeSetItem('expenseFlow_friends', friends);
    }

    static loadFriends() {
        return this.safeGetItem('expenseFlow_friends', []);
    }

    static saveRecurringExpenses(expenses) {
        this.safeSetItem('expenseFlow_recurring', expenses);
    }

    static loadRecurringExpenses() {
        return this.safeGetItem('expenseFlow_recurring', []);
    }

    static saveBudget(budgetData) {
        this.safeSetItem('expenseFlow_budget', budgetData);
    }

    static loadBudget() {
        return this.safeGetItem('expenseFlow_budget', { amount: 0, threshold: 80 });
    }

    // Export all data for backup
    static exportData() {
        return {
            expenses: this.loadExpenses(),
            monthlyIncome: this.loadMonthlyIncome(),
            friends: this.loadFriends(),
            recurringExpenses: this.loadRecurringExpenses(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Import data from backup
    static importData(data) {
        if (data.expenses) this.saveExpenses(data.expenses);
        if (data.monthlyIncome) this.saveMonthlyIncome(data.monthlyIncome);
        if (data.friends) this.saveFriends(data.friends);
        if (data.recurringExpenses) this.saveRecurringExpenses(data.recurringExpenses);
    }

    // Clear all data
    static clearAllData() {
        try {
            localStorage.removeItem('expenseFlow_expenses');
            localStorage.removeItem('expenseFlow_monthlyIncome');
            localStorage.removeItem('expenseFlow_friends');
            localStorage.removeItem('expenseFlow_recurring');
        } catch (e) {
            console.warn('localStorage clear failed', e);
        }
    }
}
