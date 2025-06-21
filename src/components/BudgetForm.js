// components/BudgetForm.js
import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import './BudgetForm.css'; // Import CSS for styling

const BudgetForm = ({ onBudgetAdded }) => {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState('monthly');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!category.trim()) {
            setError('Category is required.');
            return;
        }

        if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setError('Amount must be a valid positive number.');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) return;

            await addDoc(collection(db, 'budgets'), {
                userId: user.uid,
                category: category.trim(),
                amount: parseFloat(amount),
                period,
            });

            setCategory('');
            setAmount('');
            setPeriod('monthly');
            onBudgetAdded();
        } catch (error) {
            console.error('Error adding budget:', error.message);
            setError('Failed to add budget. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="budget-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                    type="text"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Groceries, Rent, Entertainment"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 500, 12000"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="period">Budget Period</label>
                <select
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                </select>
            </div>

            <button type="submit" className="add-budget-button">Add Budget</button>
        </form>
    );
};

export default BudgetForm;