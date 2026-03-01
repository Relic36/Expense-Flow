// Recurring Expense Detection Manager
class RecurringManager {
    static checkRecurringExpenses(expenses) {
        const recurringPatterns = this.analyzeRecurringPatterns(expenses);
        this.displayRecurringAlerts(recurringPatterns);
    }

    static analyzeRecurringPatterns(expenses) {
        const patterns = {};
        const now = new Date();
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

        // Group by description and category
        expenses.forEach(expense => {
            const key = `${expense.description}-${expense.category}`.toLowerCase();
            if (!patterns[key]) {
                patterns[key] = [];
            }
            patterns[key].push({
                date: new Date(expense.date),
                amount: expense.amount
            });
        });

        // Analyze for recurring patterns
        const recurring = [];
        Object.entries(patterns).forEach(([key, transactions]) => {
            if (transactions.length >= 2) {
                const pattern = this.detectPattern(transactions);
                if (pattern) {
                    recurring.push({
                        key,
                        pattern,
                        transactions,
                        averageAmount: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
                    });
                }
            }
        });

        return recurring;
    }

    static detectPattern(transactions) {
        transactions.sort((a, b) => a.date - b.date);

        const intervals = [];
        for (let i = 1; i < transactions.length; i++) {
            const diff = transactions[i].date - transactions[i - 1].date;
            intervals.push(diff);
        }

        // Check for monthly pattern (within 5 days variance)
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const monthlyMs = 30 * 24 * 60 * 60 * 1000;

        if (Math.abs(avgInterval - monthlyMs) / monthlyMs < 0.2) { // Within 20% variance
            return 'monthly';
        }

        // Check for weekly pattern
        const weeklyMs = 7 * 24 * 60 * 60 * 1000;
        if (Math.abs(avgInterval - weeklyMs) / weeklyMs < 0.3) { // Within 30% variance
            return 'weekly';
        }

        return null;
    }

    static displayRecurringAlerts(patterns) {
        const container = document.getElementById('recurring-list');

        if (patterns.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No recurring expenses detected yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = patterns.map(pattern => `
            <div class="recurring-item">
                <div class="recurring-icon">${this.getPatternIcon(pattern.pattern)}</div>
                <div class="recurring-details">
                    <div class="recurring-desc">${pattern.key.split('-')[0]}</div>
                    <div class="recurring-meta">${pattern.pattern} • Avg: ${window.expenseTracker?.currencySymbol || '₹'}${pattern.averageAmount.toFixed(2)}</div>
                </div>
                <div class="recurring-count">${pattern.transactions.length}x</div>
            </div>
        `).join('');
    }

    static getPatternIcon(pattern) {
        const icons = {
            monthly: '📅',
            weekly: '🔄',
            daily: '☀️'
        };
        return icons[pattern] || '⏰';
    }

    static predictNextExpense(pattern) {
        if (!pattern.transactions.length) return null;

        const lastDate = new Date(Math.max(...pattern.transactions.map(t => t.date)));
        const intervalMs = pattern.pattern === 'monthly' ? 30 * 24 * 60 * 60 * 1000 :
            pattern.pattern === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 0;

        return new Date(lastDate.getTime() + intervalMs);
    }
}
