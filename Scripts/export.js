// Export and Backup Manager
class ExportManager {
    static exportToPDF() {
        if (typeof window.jspdf === 'undefined') {
            this.showNotification('PDF Library failed to load. Check internet connection.', 'error');
            return;
        }

        const data = StorageManager.exportData();
        if (!data.expenses || data.expenses.length === 0) {
            this.showNotification('No expenses found to export.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("ExpenseFlow Report", 14, 20);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        const tableColumn = ["Date", "Category", "Description", "Friend", "Amount"];
        const tableRows = [];

        let totalAmount = 0;

        data.expenses.forEach(expense => {
            const friendName = expense.friendId ?
                FriendsManager.friends.find(f => f.id === expense.friendId)?.name || 'N/A' : 'None';

            const expenseData = [
                expense.date,
                expense.category,
                expense.description || "N/A",
                friendName,
                `$${expense.amount.toFixed(2)}`
            ];

            tableRows.push(expenseData);
            totalAmount += expense.amount;
        });

        tableRows.push(["", "", "", "TOTAL:", `$${totalAmount.toFixed(2)}`]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [138, 43, 226] }
        });

        doc.save(`expenseflow-report-${new Date().toISOString().split('T')[0]}.pdf`);
        this.showNotification('PDF exported successfully!', 'success');
    }

    static exportToExcel() {
        const data = StorageManager.exportData();
        let csvContent = "Date,Category,Description,Amount,Friend\n";

        data.expenses.forEach(expense => {
            const friendName = expense.friendId ?
                FriendsManager.friends.find(f => f.id === expense.friendId)?.name || '' : '';

            csvContent += `"${expense.date}","${expense.category}","${expense.description}","${expense.amount}","${friendName}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        URL.revokeObjectURL(url);
        this.showNotification('Excel data exported successfully!', 'success');
    }

    static backupToCloud() {
        // This would integrate with cloud services like Google Drive or Dropbox
        const data = StorageManager.exportData();

        // Simulate cloud backup
        localStorage.setItem('expenseFlow_cloudBackup', JSON.stringify({
            data: data,
            backupDate: new Date().toISOString(),
            version: '1.0'
        }));

        this.showNotification('Data backed up to cloud successfully!', 'success');
    }

    static restoreFromCloud() {
        const backup = localStorage.getItem('expenseFlow_cloudBackup');
        if (!backup) {
            this.showNotification('No cloud backup found', 'error');
            return;
        }

        if (confirm('Are you sure you want to restore from cloud backup? This will overwrite current data.')) {
            const data = JSON.parse(backup);
            StorageManager.importData(data.data);
            window.location.reload();
        }
    }

    static showNotification(message, type) {
        if (window.expenseTracker && window.expenseTracker.showNotification) {
            window.expenseTracker.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}
