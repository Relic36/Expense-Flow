// Friends Tracking Manager
class FriendsManager {
    static init() {
        this.friends = StorageManager.loadFriends();
        this.currencySymbol = localStorage.getItem('expenseFlow_currency') || '₹';
        this.updateFriendsList();

        const addFriendBtn = document.getElementById('add-friend-btn');
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', () => this.showAddFriendModal());
        }

        this.updateRecentTransactions();
    }

    static addFriend(name, initialBalance = 0) {
        const friend = {
            id: Date.now(),
            name: name,
            balance: initialBalance,
            transactions: [],
            createdAt: new Date().toISOString()
        };

        this.friends.push(friend);
        StorageManager.saveFriends(this.friends);
        this.updateFriendsList();

        return friend;
    }

    static addFriendTransaction(friendId, amount, description = '') {
        const friend = this.friends.find(f => f.id === friendId);
        if (!friend) return;

        const transaction = {
            id: Date.now(),
            amount: amount,
            description: description,
            date: new Date().toISOString(),
            type: amount > 0 ? 'owed' : (description.toLowerCase().includes('repayment') || description.toLowerCase().includes('paid back') ? 'repayment' : 'paid')
        };

        friend.transactions.push(transaction);
        friend.balance += amount;

        StorageManager.saveFriends(this.friends);
        this.updateFriendsList();
        this.updateRecentTransactions();

        return transaction;
    }

    static convertCurrency(ratio, newSymbol) {
        this.friends = this.friends.map(friend => {
            const updatedFriend = {
                ...friend,
                balance: friend.balance * ratio,
                transactions: friend.transactions.map(t => ({
                    ...t,
                    amount: t.amount * ratio
                }))
            };
            return updatedFriend;
        });

        this.currencySymbol = newSymbol;
        StorageManager.saveFriends(this.friends);
        this.updateFriendsList();
        this.updateRecentTransactions();
    }

    static updateFriendsList() {
        const container = document.getElementById('friends-list');
        if (!container) return;

        if (this.friends.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No friends added yet. Start tracking expenses with friends!</p>
                </div>
            `;
            this.updateFriendsSummary();
            return;
        }

        container.innerHTML = this.friends.map(friend => `
            <div class="friend-item glass-card">
                <div class="friend-header">
                    <div class="friend-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="friend-info">
                        <div class="friend-name">${friend.name}</div>
                        <div class="friend-balance ${friend.balance >= 0 ? 'positive' : 'negative'}">
                            Balance: ${this.currencySymbol}${Math.abs(friend.balance).toLocaleString()} 
                            ${friend.balance >= 0 ? 'owed to you' : 'I owe them'}
                        </div>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="btn-secondary" onclick="FriendsManager.showAddTransactionModal(${friend.id})">
                        <i class="fas fa-plus"></i> Add Transaction
                    </button>
                    <button class="btn-text" onclick="FriendsManager.showFriendDetails(${friend.id})">
                        <i class="fas fa-history"></i> History
                    </button>
                </div>
            </div>
        `).join('');
        this.updateFriendsSummary();
    }

    static updateFriendsSummary() {
        const totalFriends = document.getElementById('total-friends');
        const totalOwed = document.getElementById('total-owed');
        const totalOwe = document.getElementById('total-owe');

        if (totalFriends) totalFriends.textContent = this.friends.length;

        let owed = 0;
        let owe = 0;
        this.friends.forEach(f => {
            if (f.balance > 0) owed += f.balance;
            else if (f.balance < 0) owe += Math.abs(f.balance);
        });

        if (totalOwed) totalOwed.textContent = (this.currencySymbol || '₹') + owed.toLocaleString();
        if (totalOwe) totalOwe.textContent = (this.currencySymbol || '₹') + owe.toLocaleString();
    }

    static showAddFriendModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Add New Friend</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="friend-form">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Initial Balance (optional)</label>
                        <input type="number" name="balance" step="0.01" value="0">
                        <small>Positive = they owe you, Negative = you owe them</small>
                    </div>
                    <button type="submit" class="btn-primary">Add Friend</button>
                </form>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.addFriend(formData.get('name'), parseFloat(formData.get('balance')));
            modal.remove();
            if (window.expenseTracker) {
                window.expenseTracker.populateFriends();
                window.expenseTracker.showNotification('Friend added successfully!', 'success');
            }
        });

        document.body.appendChild(modal);
    }

    static showAddTransactionModal(friendId) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Add Transaction</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="friend-transaction-form">
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" name="amount" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" placeholder="What was this for?">
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select name="type">
                            <option value="owed">They owe you</option>
                            <option value="paid">I owe them</option>
                            <option value="repayment">I paid them back (Settlement)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary">Add Transaction</button>
                </form>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransactionSubmit(friendId, modal);
        });

        document.body.appendChild(modal);
    }

    static handleTransactionSubmit(friendId, modal) {
        const formData = new FormData(modal.querySelector('form'));
        const amount = parseFloat(formData.get('amount'));
        const descriptionInput = modal.querySelector('input[type="text"]').value;
        const type = formData.get('type');

        let finalAmount = amount;
        let finalDescription = descriptionInput;

        if (type === 'paid') {
            finalAmount = -amount;
        } else if (type === 'repayment') {
            finalAmount = amount; // Adding a positive value to a negative balance reduces the debt
            finalDescription = descriptionInput || 'Debt Repayment';
            if (!finalDescription.toLowerCase().includes('repayment')) {
                finalDescription += ' (Repayment)';
            }
        }

        this.addFriendTransaction(friendId, finalAmount, finalDescription);

        modal.remove();
        window.expenseTracker.showNotification('Transaction added successfully!', 'success');
    }

    static showFriendDetails(friendId) {
        const friend = this.friends.find(f => f.id === friendId);
        if (!friend) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';

        let transactionsHtml = '';
        if (friend.transactions.length === 0) {
            transactionsHtml = '<div class="empty-state"><p>No transactions yet.</p></div>';
        } else {
            transactionsHtml = `
                <div class="history-list">
                    ${friend.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => `
                        <div class="history-item">
                            <div class="history-info">
                                <div class="history-date">${this.formatDate(t.date)}</div>
                                <div class="history-desc">${t.description || 'No description'}</div>
                            </div>
                            <div class="history-amount ${t.amount >= 0 ? 'positive' : 'negative'}">
                                ${t.amount >= 0 ? '+' : ''}${this.currencySymbol}${Math.abs(t.amount).toLocaleString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Transaction History: ${friend.name}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="friend-current-balance">
                        Current Balance: <span class="${friend.balance >= 0 ? 'positive' : 'negative'}">
                            ${this.currencySymbol}${Math.abs(friend.balance).toLocaleString()} ${friend.balance >= 0 ? 'owed to you' : 'you owe them'}
                        </span>
                    </div>
                    ${transactionsHtml}
                </div>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        document.body.appendChild(modal);
    }

    static updateRecentTransactions() {
        const container = document.getElementById('friend-transactions-list');
        if (!container) return;

        // Aggregate all transactions
        let allTransactions = [];
        this.friends.forEach(f => {
            f.transactions.forEach(t => {
                allTransactions.push({
                    ...t,
                    friendName: f.name,
                    friendId: f.id
                });
            });
        });

        if (allTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No transactions yet.</p>
                </div>
            `;
            return;
        }

        // Sort by date descending and take top 10
        const recent = allTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        container.innerHTML = recent.map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-name">${t.friendName}</div>
                    <div class="transaction-meta">${this.formatDate(t.date)} • ${t.description || 'Friend Transaction'}</div>
                </div>
                <div class="transaction-amount ${t.amount >= 0 ? 'positive' : 'negative'}">
                    ${t.type === 'repayment' ? 'Settled: ' : (t.amount >= 0 ? 'They owe: ' : 'You owe: ')}${this.currencySymbol}${Math.abs(t.amount).toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}

// Initialize friends manager
document.addEventListener('DOMContentLoaded', () => {
    FriendsManager.init();
});
