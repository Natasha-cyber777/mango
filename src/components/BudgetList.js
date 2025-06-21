// components/BudgetList.js
import React, { useState } from 'react';
import './BudgetList.css'; // Import CSS for BudgetList

const BudgetList = ({ budgets, onDelete, onEdit }) => {
    const [editId, setEditId] = useState(null);
    const [editedCategory, setEditedCategory] = useState('');
    const [editedAmount, setEditedAmount] = useState('');

    const handleEditClick = (budget) => {
        setEditId(budget.id);
        setEditedCategory(budget.category);
        setEditedAmount(budget.amount);
    };

    const handleSaveClick = (budget) => {
        if (editedCategory.trim() && !isNaN(editedAmount)) {
            onEdit(budget.id, editedCategory, parseFloat(editedAmount));
            setEditId(null);
        } else {
            // Optionally show an error message
            alert('Please enter a valid category and amount.');
        }
    };

    const handleCancelClick = () => {
        setEditId(null);
    };

    return (
        <ul className="budget-list">
            {budgets.map((budget) => (
                <li key={budget.id} className={`budget-item ${editId === budget.id ? 'editing' : ''}`}>
                    {editId === budget.id ? (
                        <div className="edit-form">
                            <input
                                type="text"
                                value={editedCategory}
                                onChange={(e) => setEditedCategory(e.target.value)}
                                placeholder="Category"
                            />
                            <input
                                type="number"
                                value={editedAmount}
                                onChange={(e) => setEditedAmount(e.target.valueAsNumber)}
                                placeholder="Amount"
                            />
                            <div className="edit-actions">
                                <button onClick={() => handleSaveClick(budget)} className="save-button">Save</button>
                                <button onClick={handleCancelClick} className="cancel-button">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <span className="budget-category">{budget.category}</span>
                            <div className="budget-details">
                                <span className="budget-amount">₹{budget.amount}</span>
                                {budget.period && <span className="budget-period">({budget.period})</span>}
                            </div>
                            <div className="budget-actions">
                                <button onClick={() => handleEditClick(budget)} className="edit-button">Edit</button>
                                <button onClick={() => onDelete(budget.id)} className="delete-button">Delete</button>
                            </div>
                        </>
                    )}
                </li>
            ))}
            {budgets.length === 0 && <li className="empty-budget-list">No budget categories created yet.</li>}
        </ul>
    );
};

export default BudgetList;