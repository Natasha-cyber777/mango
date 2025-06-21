// DebtProfile.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import "../styles/DebtProfile.css";
import Navbar from '../components/Navbar';
function DebtProfile() {
    const { userProfile, updateUserProfile } = useAuth();
    const [debts, setDebts] = useState([]);
    const [newDebtName, setNewDebtName] = useState('');
    const [newDebtType, setNewDebtType] = useState('');
    const [newDebtBalance, setNewDebtBalance] = useState('');
    const [newDebtInterestRate, setNewDebtInterestRate] = useState('');
    const [newDebtMinimumPayment, setNewDebtMinimumPayment] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editDebtName, setEditDebtName] = useState('');
    const [editDebtType, setEditDebtType] = useState('');
    const [editDebtBalance, setEditDebtBalance] = useState('');
    const [editDebtInterestRate, setEditDebtInterestRate] = useState('');
    const [editDebtMinimumPayment, setEditDebtMinimumPayment] = useState('');

    useEffect(() => {
        setDebts(userProfile?.debts || []);
    }, [userProfile]);

    const handleAddDebt = () => {
        if (newDebtName && newDebtType && !isNaN(parseFloat(newDebtBalance)) && !isNaN(parseFloat(newDebtInterestRate)) && !isNaN(parseFloat(newDebtMinimumPayment))) {
            const newDebt = {
                name: newDebtName.trim(),
                type: newDebtType,
                balance: parseFloat(newDebtBalance),
                interestRate: parseFloat(newDebtInterestRate),
                minimumPayment: parseFloat(newDebtMinimumPayment),
            };
            const updatedDebts = [...debts, newDebt];
            setDebts(updatedDebts);
            updateUserProfile({ debts: updatedDebts });
            setNewDebtName('');
            setNewDebtType('');
            setNewDebtBalance('');
            setNewDebtInterestRate('');
            setNewDebtMinimumPayment('');
        } else {
            alert("Please enter valid debt details.");
        }
    };

    const handleRemoveDebt = (index) => {
        const updatedDebts = debts.filter((_, i) => i !== index);
        setDebts(updatedDebts);
        updateUserProfile({ debts: updatedDebts });
        setEditingIndex(null);
    };

    const handleStartEdit = (index, debt) => {
        setEditingIndex(index);
        setEditDebtName(debt.name);
        setEditDebtType(debt.type);
        setEditDebtBalance(debt.balance);
        setEditDebtInterestRate(debt.interestRate);
        setEditDebtMinimumPayment(debt.minimumPayment);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
    };

    const handleSaveEdit = (index) => {
        if (editDebtName && editDebtType && !isNaN(parseFloat(editDebtBalance)) && !isNaN(parseFloat(editDebtInterestRate)) && !isNaN(parseFloat(editDebtMinimumPayment))) {
            const updatedDebts = debts.map((debt, i) =>
                i === index
                    ? {
                          name: editDebtName.trim(),
                          type: editDebtType,
                          balance: parseFloat(editDebtBalance),
                          interestRate: parseFloat(editDebtInterestRate),
                          minimumPayment: parseFloat(editDebtMinimumPayment),
                      }
                    : debt
            );
            setDebts(updatedDebts);
            updateUserProfile({ debts: updatedDebts });
            setEditingIndex(null);
        } else {
            alert("Please enter valid debt details for editing.");
        }
    };

    const calculateTotalDebt = () => {
        return debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
    };

    return (
        <div className="debt-profile-container">
            <Navbar />
            <h2>My Debts</h2>

            <div className="debts-section">
                <h3>Your Debts</h3>
                {debts.length > 0 ? (
                    <ul>
                        {debts.map((debt, index) => (
                            <li key={index} className="debt-item">
                                {editingIndex === index ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editDebtName}
                                            onChange={(e) => setEditDebtName(e.target.value)}
                                            placeholder="Debt Name"
                                        />
                                        <input
                                            type="text"
                                            value={editDebtType}
                                            onChange={(e) => setEditDebtType(e.target.value)}
                                            placeholder="Type"
                                        />
                                        <input
                                            type="number"
                                            value={editDebtBalance}
                                            onChange={(e) => setEditDebtBalance(e.target.value)}
                                            placeholder="Balance"
                                        />
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={editDebtInterestRate}
                                            onChange={(e) => setEditDebtInterestRate(e.target.value)}
                                            placeholder="Interest Rate (e.g., 0.12 for 12%)"
                                        />
                                        <input
                                            type="number"
                                            value={editDebtMinimumPayment}
                                            onChange={(e) => setEditDebtMinimumPayment(e.target.value)}
                                            placeholder="Minimum Payment"
                                        />
                                        <div className="edit-buttons">
                                            <button onClick={() => handleSaveEdit(index)} className="save-button">
                                                Save
                                            </button>
                                            <button onClick={handleCancelEdit} className="cancel-button">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="debt-details">
                                        <span className="debt-name">{debt.name}</span> ({debt.type}) -
                                        Balance: ₹{debt.balance.toFixed(2)},
                                        Interest Rate: {(debt.interestRate * 100).toFixed(2)}%,
                                        Minimum Payment: ₹{debt.minimumPayment.toFixed(2)}
                                        <div className="actions">
                                            <button
                                                onClick={() => handleStartEdit(index, debt)}
                                                className="edit-button"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleRemoveDebt(index)}
                                                className="remove-button"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No debts recorded yet.</p>
                )}
            </div>

            <div className="add-debt-section">
                <h3>Add New Debt</h3>
                <div className="add-form">
                    <input
                        type="text"
                        placeholder="Debt Name"
                        value={newDebtName}
                        onChange={(e) => setNewDebtName(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Type (e.g., Credit Card, Loan)"
                        value={newDebtType}
                        onChange={(e) => setNewDebtType(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Balance"
                        value={newDebtBalance}
                        onChange={(e) => setNewDebtBalance(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        step="0.0001"
                        placeholder="Interest Rate (e.g., 0.12)"
                        value={newDebtInterestRate}
                        onChange={(e) => setNewDebtInterestRate(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Minimum Payment"
                        value={newDebtMinimumPayment}
                        onChange={(e) => setNewDebtMinimumPayment(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleAddDebt} className="add-button">
                        Add Debt
                    </button>
                </div>
            </div>

            <div className="total-debt-section">
                <h3>Total Outstanding Debt:</h3>
                <p className="total-amount">₹{calculateTotalDebt().toFixed(2)}</p>
            </div>
        </div>
    );
}

export default DebtProfile;