// Charts Manager - Handles all chart operations
class ChartsManager {
    static initCharts() {
        this.monthlyChart = this.createMonthlyChart();
        this.categoryChart = this.createCategoryChart();
        this.yearlyTrendChart = this.createYearlyTrendChart();
        this.categoryPieChart = this.createCategoryPieChart();
        this.spendingHabitsChart = this.createSpendingHabitsChart();
    }

    static createMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Expenses',
                    data: [],
                    backgroundColor: 'rgba(138, 43, 226, 0.6)',
                    borderColor: 'rgba(138, 43, 226, 1)',
                    borderWidth: 1
                }, {
                    label: 'Savings',
                    data: [],
                    backgroundColor: 'rgba(32, 191, 107, 0.6)',
                    borderColor: 'rgba(32, 191, 107, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#a4b0be',
                            callback: function (value) {
                                return '₹' + value;
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#a4b0be'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    static createCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e0e0',
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    static createYearlyTrendChart() {
        const ctx = document.getElementById('yearlyTrendChart').getContext('2d');
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Trend',
                    data: [],
                    borderColor: 'rgba(65, 105, 225, 1)',
                    backgroundColor: 'rgba(65, 105, 225, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#a4b0be',
                            callback: function (value) {
                                return '₹' + value;
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#a4b0be'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    static createCategoryPieChart() {
        const ctx = document.getElementById('categoryPieChart').getContext('2d');
        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });
    }

    static createSpendingHabitsChart() {
        const ctx = document.getElementById('spendingHabitsChart').getContext('2d');
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Weekends', 'Weekdays', 'Morning', 'Afternoon', 'Evening'],
                datasets: [{
                    label: 'Spending Frequency',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(138, 43, 226, 0.4)',
                    borderColor: 'rgba(138, 43, 226, 1)',
                    pointBackgroundColor: 'rgba(138, 43, 226, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(138, 43, 226, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#e0e0e0'
                        },
                        ticks: {
                            display: false, // hide the scale numbers on radar charts
                            backdropColor: 'transparent'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    static updateMonthlyChart(expenses) {
        if (!this.monthlyChart) return;

        const currentYear = new Date().getFullYear();
        const monthlyData = Array(12).fill(0);
        const monthlyIncome = Array(12).fill(0);

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            if (date.getFullYear() === currentYear) {
                monthlyData[date.getMonth()] += expense.amount;
            }
        });

        // For demo, let's assume income is 50% more than expenses each month
        const incomeData = monthlyData.map(expense => expense * 1.5);

        this.monthlyChart.data.datasets[0].data = monthlyData;
        this.monthlyChart.data.datasets[1].data = incomeData.map((income, index) =>
            Math.max(0, income - monthlyData[index])
        );
        this.monthlyChart.update();
    }

    static updateCategoryChart(expenses) {
        if (!this.categoryChart) return;

        const categoryTotals = {};
        Object.keys(CATEGORIES).forEach(category => {
            categoryTotals[category] = 0;
        });

        expenses.forEach(expense => {
            if (expense.category && categoryTotals[expense.category] !== undefined) {
                categoryTotals[expense.category] += expense.amount;
            }
        });

        const labels = [];
        const data = [];
        const backgroundColors = [];

        Object.entries(categoryTotals).forEach(([category, total]) => {
            if (total > 0) {
                labels.push(CATEGORIES[category].name);
                data.push(total);
                backgroundColors.push(CATEGORIES[category].color);
            }
        });

        this.categoryChart.data.labels = labels;
        this.categoryChart.data.datasets[0].data = data;
        this.categoryChart.data.datasets[0].backgroundColor = backgroundColors;
        this.categoryChart.update();
    }

    static updateReportsCharts(expenses) {
        // Only update if they exist
        if (!this.yearlyTrendChart || !this.categoryPieChart || !this.spendingHabitsChart) return;

        // --- 1. Update Yearly Trend Chart (same logic as monthly, but just plotting all expenses line-style) ---
        const currentYear = new Date().getFullYear();
        const monthlyData = Array(12).fill(0);

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            if (date.getFullYear() === currentYear) {
                monthlyData[date.getMonth()] += expense.amount;
            }
        });

        this.yearlyTrendChart.data.datasets[0].data = monthlyData;
        this.yearlyTrendChart.update();

        // --- 2. Update Category Pie Chart (same data as doughnut, but formatted for pie) ---
        const categoryTotals = {};
        Object.keys(CATEGORIES).forEach(cat => categoryTotals[cat] = 0);

        expenses.forEach(expense => {
            if (expense.category && categoryTotals[expense.category] !== undefined) {
                categoryTotals[expense.category] += expense.amount;
            }
        });

        const pieLabels = [];
        const pieData = [];
        const pieColors = [];

        Object.entries(categoryTotals).forEach(([cat, total]) => {
            if (total > 0) {
                pieLabels.push(CATEGORIES[cat].name);
                pieData.push(total);
                pieColors.push(CATEGORIES[cat].color);
            }
        });

        this.categoryPieChart.data.labels = pieLabels;
        this.categoryPieChart.data.datasets[0].data = pieData;
        this.categoryPieChart.data.datasets[0].backgroundColor = pieColors;
        this.categoryPieChart.update();

        // --- 3. Update Spending Habits Radar Chart ---
        // Indices: [Weekends, Weekdays, Morning, Afternoon, Evening]
        let radarData = [0, 0, 0, 0, 0];

        expenses.forEach(expense => {
            const dateObj = new Date(expense.createdAt || expense.date);

            // Weekend vs Weekday (0 = Sunday, 6 = Saturday)
            const day = dateObj.getDay();
            if (day === 0 || day === 6) {
                radarData[0]++; // Weekend
            } else {
                radarData[1]++; // Weekday
            }

            // Time of day (0-11 morning, 12-16 afternoon, 17+ evening)
            const hour = dateObj.getHours();
            if (hour < 12) {
                radarData[2]++; // Morning
            } else if (hour < 17) {
                radarData[3]++; // Afternoon
            } else {
                radarData[4]++; // Evening
            }
        });

        this.spendingHabitsChart.data.datasets[0].data = radarData;
        this.spendingHabitsChart.update();
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ChartsManager.initCharts();
});
