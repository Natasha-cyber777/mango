// SavingsProfile.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import "../styles/SavingsProfile.css";
import Navbar from '../components/Navbar';
function SavingsProfile() {
    const { userProfile, updateUserProfile } = useAuth();
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalCurrent, setNewGoalCurrent] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [editingGoalIndex, setEditingGoalIndex] = useState(null);
    const [editGoalName, setEditGoalName] = useState('');
    const [editGoalTarget, setEditGoalTarget] = useState('');
    const [editGoalCurrent, setEditGoalCurrent] = useState('');
    const [editGoalDeadline, setEditGoalDeadline] = useState('');

    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');
    const [newAccountInstitution, setNewAccountInstitution] = useState('');
    const [editingAccountIndex, setEditingAccountIndex] = useState(null);
    const [editAccountName, setEditAccountName] = useState('');
    const [editAccountBalance, setEditAccountBalance] = useState('');
    const [editAccountInstitution, setEditAccountInstitution] = useState('');

    useEffect(() => {
        setSavingsGoals(userProfile?.savingsGoals || []);
        setSavingsAccounts(userProfile?.savingsAccounts || []);
    }, [userProfile]);

    // --- Savings Goal Handlers (same as before) ---
    const handleAddSavingsGoal = () => { /* ... */ };
    const handleRemoveSavingsGoal = (index) => { /* ... */ };
    const handleStartEditGoal = (index, goal) => { /* ... */ };
    const handleCancelEditGoal = () => { /* ... */ };
    const handleSaveEditGoal = (index) => { /* ... */ };

    // --- Savings Account Handlers ---
    const handleAddSavingsAccount = () => {
        if (newAccountName && !isNaN(parseFloat(newAccountBalance)) && newAccountInstitution) {
            const newAccount = {
                name: newAccountName.trim(),
                balance: parseFloat(newAccountBalance),
                institution: newAccountInstitution.trim(),
            };
            const updatedAccounts = [...savingsAccounts, newAccount];
            setSavingsAccounts(updatedAccounts);
            updateUserProfile({ savingsAccounts: updatedAccounts });
            setNewAccountName('');
            setNewAccountBalance('');
            setNewAccountInstitution('');
        } else {
            alert("Please enter a valid account name, balance, and institution.");
        }
    };

    const handleRemoveSavingsAccount = (index) => {
        const updatedAccounts = savingsAccounts.filter((_, i) => i !== index);
        setSavingsAccounts(updatedAccounts);
        updateUserProfile({ savingsAccounts: updatedAccounts });
        setEditingAccountIndex(null);
    };

    const handleStartEditAccount = (index, account) => {
        setEditingAccountIndex(index);
        setEditAccountName(account.name);
        setEditAccountBalance(account.balance);
        setEditAccountInstitution(account.institution);
    };

    const handleCancelEditAccount = () => {
        setEditingAccountIndex(null);
    };

    const handleSaveEditAccount = (index) => {
        if (editAccountName && !isNaN(parseFloat(editAccountBalance)) && editAccountInstitution) {
            const updatedAccounts = savingsAccounts.map((account, i) =>
                i === index
                    ? {
                          name: editAccountName.trim(),
                          balance: parseFloat(editAccountBalance),
                          institution: editAccountInstitution.trim(),
                      }
                    : account
            );
            setSavingsAccounts(updatedAccounts);
            updateUserProfile({ savingsAccounts: updatedAccounts });
            setEditingAccountIndex(null);
        } else {
            alert("Please enter a valid account name, balance, and institution for editing.");
        }
    };

    const calculateTotalSavings = () => {
        return savingsAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    };

    return (
        <div className="savings-profile-container">
            <Navbar />
            <h2>My Savings</h2>

            <div className="savings-goals-section">
                {/* ... Savings Goals UI (same as before) ... */}
                <h3>Savings Goals</h3>
                {savingsGoals.length > 0 ? (
                    <ul>
                        {savingsGoals.map((goal, index) => (
                            <li key={index} className="savings-goal-item">
                                {/* ... Goal Details and Edit Form ... */}
                                {editingGoalIndex === index ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editGoalName}
                                            onChange={(e) => setEditGoalName(e.target.value)}
                                            placeholder="Goal Name"
                                        />
                                        <input
                                            type="number"
                                            value={editGoalTarget}
                                            onChange={(e) => setEditGoalTarget(e.target.value)}
                                            placeholder="Target Amount"
                                        />
                                        <input
                                            type="number"
                                            value={editGoalCurrent}
                                            onChange={(e) => setEditGoalCurrent(e.target.value)}
                                            placeholder="Current Amount"
                                        />
                                        <input
                                            type="date"
                                            value={editGoalDeadline || ''}
                                            onChange={(e) => setEditGoalDeadline(e.target.value)}
                                            placeholder="Deadline (YYYY-MM-DD)"
                                        />
                                        <div className="edit-buttons">
                                            <button onClick={() => handleSaveEditGoal(index)} className="save-button">
                                                Save
                                            </button>
                                            <button onClick={handleCancelEditGoal} className="cancel-button">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="goal-details">
                                        <span className="goal-name">{goal.name}</span>:
                                        <span className="goal-target"> ₹{goal.targetAmount.toFixed(2)}</span>
                                        <span className="goal-current"> (₹{goal.currentAmount.toFixed(2)})</span>
                                        {goal.deadline && (
                                            <span className="goal-deadline">
                                                {' '}
                                                Deadline: {goal.deadline}
                                            </span>
                                        )}
                                        <div className="actions">
                                            <button
                                                onClick={() => handleStartEditGoal(index, goal)}
                                                className="edit-button"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleRemoveSavingsGoal(index)}
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
                    <p>No savings goals added yet.</p>
                )}
            </div>

            <div className="add-savings-goal-section">
                {/* ... Add New Savings Goal UI (same as before) ... */}
                <h3>Add New Savings Goal</h3>
                <div className="add-form">
                    <input
                        type="text"
                        placeholder="Goal Name"
                        value={newGoalName}
                        onChange={(e) => setNewGoalName(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Target Amount"
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Current Amount"
                        value={newGoalCurrent}
                        onChange={(e) => setNewGoalCurrent(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="date"
                        placeholder="Deadline (YYYY-MM-DD)"
                        value={newGoalDeadline}
                        onChange={(e) => setNewGoalDeadline(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleAddSavingsGoal} className="add-button">
                        Add Goal
                    </button>
                </div>
            </div>

            <div className="savings-accounts-section">
                <h3>Savings Accounts</h3>
                {savingsAccounts.length > 0 ? (
                    <ul>
                        {savingsAccounts.map((account, index) => (
                            <li key={index} className="savings-account-item">
                                {editingAccountIndex === index ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editAccountName}
                                            onChange={(e) => setEditAccountName(e.target.value)}
                                            placeholder="Account Name"
                                        />
                                        <input
                                            type="number"
                                            value={editAccountBalance}
                                            onChange={(e) => setEditAccountBalance(e.target.value)}
                                            placeholder="Balance"
                                        />
                                        <input
                                            type="text"
                                            value={editAccountInstitution}
                                            onChange={(e) => setEditAccountInstitution(e.target.value)}
                                            placeholder="Institution"
                                        />
                                        <div className="edit-buttons">
                                            <button onClick={() => handleSaveEditAccount(index)} className="save-button">
                                                Save
                                            </button>
                                            <button onClick={handleCancelEditAccount} className="cancel-button">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="account-details">
                                        <span className="account-name">{account.name}</span>:
                                        <span className="account-balance"> ₹{account.balance.toFixed(2)}</span>
                                        <span className="account-institution"> ({account.institution})</span>
                                        <div className="actions">
                                            <button
                                                onClick={() => handleStartEditAccount(index, account)}
                                                className="edit-button"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleRemoveSavingsAccount(index)}
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
                    <p>No savings accounts added yet.</p>
                )}
            </div>

            <div className="add-savings-account-section">
                <h3>Add New Savings Account</h3>
                <div className="add-form">
                    <input
                        type="text"
                        placeholder="Account Name"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Balance"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Institution"
                        value={newAccountInstitution}
                        onChange={(e) => setNewAccountInstitution(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleAddSavingsAccount} className="add-button">
                        Add Account
                    </button>
                </div>
            </div>

            <div className="total-savings-section">
                <h3>Total Savings:</h3>
                <p className="total-amount">₹{calculateTotalSavings().toFixed(2)}</p>
            </div>
        </div>
    );
}

export default SavingsProfile;