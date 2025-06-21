// IncomeProfile.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import "../styles/IncomeProfile.css"; // Import CSS for styling
import Navbar from '../components/Navbar';
function IncomeProfile() {
    const { userIncomeProfile, updateUserIncome } = useAuth();
    const [incomeSources, setIncomeSources] = useState([]);
    const [newSourceName, setNewSourceName] = useState('');
    const [newSourceAmount, setNewSourceAmount] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editSourceName, setEditSourceName] = useState('');
    const [editSourceAmount, setEditSourceAmount] = useState('');

    useEffect(() => {
        setIncomeSources(userIncomeProfile?.incomeSources || []);
    }, [userIncomeProfile]);

    const handleAddIncomeSource = () => {
        if (newSourceName && newSourceAmount && !isNaN(parseFloat(newSourceAmount))) {
            const newSource = { name: newSourceName.trim(), amount: parseFloat(newSourceAmount) };
            const updatedSources = [...incomeSources, newSource];
            setIncomeSources(updatedSources);
            updateUserIncome({ incomeSources: updatedSources });
            setNewSourceName('');
            setNewSourceAmount('');
        } else {
            alert("Please enter a valid income source name and amount.");
        }
    };

    const handleRemoveIncomeSource = (index) => {
        const updatedSources = incomeSources.filter((_, i) => i !== index);
        setIncomeSources(updatedSources);
        updateUserIncome({ incomeSources: updatedSources });
        setEditingIndex(null); // Ensure no item is in edit mode after removal
    };

    const handleStartEdit = (index, source) => {
        setEditingIndex(index);
        setEditSourceName(source.name);
        setEditSourceAmount(source.amount);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
    };

    const handleSaveEdit = (index) => {
        if (editSourceName && !isNaN(parseFloat(editSourceAmount))) {
            const updatedSources = incomeSources.map((source, i) =>
                i === index ? { name: editSourceName.trim(), amount: parseFloat(editSourceAmount) } : source
            );
            setIncomeSources(updatedSources);
            updateUserIncome({ incomeSources: updatedSources });
            setEditingIndex(null);
        } else {
            alert("Please enter a valid income source name and amount for editing.");
        }
    };

    const calculateTotalIncome = () => {
        return incomeSources.reduce((sum, source) => sum + (source.amount || 0), 0);
    };

    return (
        <div className="income-profile-container">
            <Navbar />
            <h2>My Income </h2>

            <div className="income-sources-section">
                <h3>Income Sources</h3>
                {incomeSources.length > 0 ? (
                    <ul>
                        {incomeSources.map((source, index) => (
                            <li key={index} className="income-source-item">
                                {editingIndex === index ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editSourceName}
                                            onChange={(e) => setEditSourceName(e.target.value)}
                                            placeholder="Source Name"
                                        />
                                        <input
                                            type="number"
                                            value={editSourceAmount}
                                            onChange={(e) => setEditSourceAmount(e.target.value)}
                                            placeholder="Amount"
                                        />
                                        <div className="edit-buttons">
                                            <button onClick={() => handleSaveEdit(index)} className="save-button">Save</button>
                                            <button onClick={handleCancelEdit} className="cancel-button">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="source-details">
                                        <span className="source-name">{source.name}</span>: <span className="source-amount">₹{source.amount}</span>
                                        <div className="actions">
                                            <button onClick={() => handleStartEdit(index, source)} className="edit-button">Edit</button>
                                            <button onClick={() => handleRemoveIncomeSource(index)} className="remove-button">Remove</button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No income sources added yet.</p>
                )}
            </div>

            <div className="add-income-source-section">
                <h3>Add New Income Source</h3>
                <div className="add-form">
                    <input
                        type="text"
                        placeholder="Source Name"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={newSourceAmount}
                        onChange={(e) => setNewSourceAmount(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleAddIncomeSource} className="add-button">Add Source</button>
                </div>
            </div>

            <div className="total-income-section">
                <h3>Total Monthly Income:</h3>
                <p className="total-amount">₹{calculateTotalIncome().toFixed(2)}</p>
            </div>
        </div>
    );
}

export default IncomeProfile;