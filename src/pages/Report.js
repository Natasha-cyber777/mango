import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/Report.css'; // Import the CSS file for styling
import { fetchTransactions } from './Dashboard'; // Import fetchTransactions from Dashboard.js
import { useState, useEffect } from 'react';
import CategoryExpensesChart from '../components/CategoryExpensesChart'; // Import the new chart component

const Report = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);

    useEffect(() => {
        const unsubscribe = fetchTransactions(setTransactions);
        return () => unsubscribe && unsubscribe();
    }, []);

    useEffect(() => {
        const calculateTotals = () => {
            let income = 0;
            let expenses = 0;
            let savings = 0;

            transactions.forEach(transaction => {
                if (transaction.type === 'Income') {
                    income += transaction.amount;
                } else if (transaction.type === 'Expense') {
                    expenses += transaction.amount;
                } else if (transaction.type === 'Savings') {
                    savings += transaction.amount;
                }
            });

            setTotalIncome(income);
            setTotalExpenses(expenses);
            setTotalSavings(savings);
            setTotalBalance(income - expenses + savings);
        };

        calculateTotals();
    }, [transactions]);

    const calculateCategoryTotals = (transactions) => {
        const categoryTotals = {};
        transactions.forEach(transaction => {
            if (transaction.category) {
                if (!categoryTotals[transaction.category]) {
                    categoryTotals[transaction.category] = 0;
                }
                categoryTotals[transaction.category] += transaction.amount;
            }
        });
        return categoryTotals;
    };

    const categoryTotals = calculateCategoryTotals(transactions);

    return (
        <div className="report-container">
            <Navbar />
            <div className="report-container">
            <h2 className="report-title">Financial Report</h2>

            {/* ... (rest of your report content) ... */}

            <div className="chart-section">
                <CategoryExpensesChart categoryTotals={categoryTotals} />
            </div>

            {/* ... (rest of your report content) ... */}
        </div>

            <div className="summary-section">
                <h3 className="section-title">Summary</h3>
                <div className="summary-item">
                    <strong>Total Balance:</strong> <span className="balance">₹{totalBalance}</span>
                </div>
                <div className="summary-item">
                    <strong>Total Income:</strong> <span className="income">₹{totalIncome}</span>
                </div>
                <div className="summary-item">
                    <strong>Total Expenses:</strong> <span className="expense">₹{totalExpenses}</span>
                </div>
                <div className="summary-item">
                    <strong>Total Savings:</strong> <span className="savings">₹{totalSavings}</span>
                </div>
            </div>

            <div className="category-section">
                <h3 className="section-title">Expenses by Category</h3>
                <ul className="category-list">
                    {Object.entries(categoryTotals).map(([category, total]) => (
                        <li key={category} className="category-item">
                            <strong>{category}:</strong> ₹{total}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="transactions-section">
                <h3 className="section-title">Transaction Details</h3>
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td>{transaction.description}</td>
                                <td>{transaction.type}</td>
                                <td>₹{transaction.amount}</td>
                                <td>{transaction.date}</td>
                                <td>{transaction.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Report;