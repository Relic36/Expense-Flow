// Storage Manager - Handles all localStorage operations
class StorageManager {
    static saveExpenses(expenses) {
        localStorage.setItem('expenseFlow_expenses', JSON.stringify(expenses));
    }

    static loadExpenses() {
        return JSON.parse(localStorage.getItem('expenseFlow_expenses') || '[]');
    }

    static saveMonthlyIncome(incomeData) {
        localStorage.setItem('expenseFlow_monthlyIncome', JSON.stringify(incomeData));
    }

    static loadMonthlyIncome() {
        return JSON.parse(localStorage.getItem('expenseFlow_monthlyIncome') || '{}');
    }

    static saveFriends(friends) {
        localStorage.setItem('expenseFlow_friends', JSON.stringify(friends));
    }

    static loadFriends() {
        return JSON.parse(localStorage.getItem('expenseFlow_friends') || '[]');
    }

    static saveRecurringExpenses(expenses) {
        localStorage.setItem('expenseFlow_recurring', JSON.stringify(expenses));
    }

    static loadRecurringExpenses() {
        return JSON.parse(localStorage.getItem('expenseFlow_recurring') || '[]');
    }

    static saveBudget(budgetData) {
        localStorage.setItem('expenseFlow_budget', JSON.stringify(budgetData));
    }

    static loadBudget() {
        return JSON.parse(localStorage.getItem('expenseFlow_budget') || '{"amount": 0, "threshold": 80}');
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
        localStorage.removeItem('expenseFlow_expenses');
        localStorage.removeItem('expenseFlow_monthlyIncome');
        localStorage.removeItem('expenseFlow_friends');
        localStorage.removeItem('expenseFlow_recurring');
    }
}
