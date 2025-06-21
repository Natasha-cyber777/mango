// components/BudgetProgress.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import './BudgetProgress.css'; // Import CSS for styling

const BudgetProgress = ({ budget }) => {
    const [spentAmount, setSpentAmount] = useState(0);
    const [newSpent, setNewSpent] = useState('');
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState('');

    useEffect(() => {
        const budgetRef = doc(db, 'budgets', budget.id);
        const unsubscribe = onSnapshot(budgetRef, (doc) => {
            if (doc.exists() && doc.data().spent !== undefined) {
                setSpentAmount(doc.data().spent);
            } else {
                setSpentAmount(0); // Default if 'spent' is not yet set
            }
        });

        return () => unsubscribe();
    }, [budget.id]);

    const progress = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
    const isOverBudget = progress > 100;

    const handleEditClick = () => {
        setIsEditing(true);
        setNewSpent(spentAmount.toString());
        setEditError('');
    };

    const handleSaveProgress = async () => {
        setEditError('');
        const updatedSpentAmount = parseFloat(newSpent);

        if (isNaN(updatedSpentAmount) || updatedSpentAmount < 0) {
            setEditError('Please enter a valid non-negative number.');
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        const budgetRef = doc(db, 'budgets', budget.id);
        try {
            await updateDoc(budgetRef, {
                spent: updatedSpentAmount,
            });
            setSpentAmount(updatedSpentAmount);
            setIsEditing(false);
            setNewSpent('');

            const newProgress = budget.amount > 0 ? (updatedSpentAmount / budget.amount) * 100 : 0;
            const newIsOverBudget = newProgress > 100;

            if (newIsOverBudget) {
                setMessage('You have exceeded your budget. Consider reviewing your spending.');
            } else {
                setMessage('Progress updated successfully.');
            }
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error('Error updating spent amount:', error);
            setEditError('Failed to update progress. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNewSpent('');
        setEditError('');
    };

    return (
        <div className="budget-progress-container">
            <div className="budget-info">
                <h4 className="budget-category">{budget.category}</h4>
                <p className="budget-period">({budget.period})</p>
                <p className="budget-amount">
                    Spent: <span className="spent">₹{spentAmount.toFixed(2)}</span> / Target: ₹{budget.amount.toFixed(2)}
                </p>
            </div>

            <div className="progress-bar-wrapper">
                <div
                    className="progress-bar"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: isOverBudget ? '#ff6b6b' : '#2ecc71',
                    }}
                >
                    {progress > 5 && <span className="progress-label">{progress.toFixed(0)}%</span>}
                </div>
            </div>

            {isEditing ? (
                <div className="edit-progress-controls">
                    {editError && <div className="error-message">{editError}</div>}
                    <input
                        type="number"
                        value={newSpent}
                        onChange={(e) => setNewSpent(e.target.value)}
                        placeholder="Enter new spent amount"
                        className="edit-input"
                    />
                    <div className="edit-buttons">
                        <button onClick={handleSaveProgress} className="save-button">Save</button>
                        <button onClick={handleCancelEdit} className="cancel-button">Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="update-progress-button-container">
                    <button onClick={handleEditClick} className="edit-button">Update Spent Amount</button>
                </div>
            )}

            {message && <div className={`message ${isOverBudget ? 'over-budget' : 'within-budget'}`}>{message}</div>}
        </div>
    );
};

export default BudgetProgress;