// InvestmentProfile.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import "../styles/InvestmentProfile.css";
import Navbar from '../components/Navbar';
function InvestmentProfile() {
    const { userProfile, updateUserProfile } = useAuth();
    const [investments, setInvestments] = useState([]);
    const [newInvestmentName, setNewInvestmentName] = useState('');
    const [newInvestmentType, setNewInvestmentType] = useState('');
    const [newInvestmentQuantity, setNewInvestmentQuantity] = useState('');
    const [newInvestmentPurchasePrice, setNewInvestmentPurchasePrice] = useState('');
    const [newInvestmentCurrentValue, setNewInvestmentCurrentValue] = useState('');
    const [newInvestmentInstitution, setNewInvestmentInstitution] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editInvestmentName, setEditInvestmentName] = useState('');
    const [editInvestmentType, setEditInvestmentType] = useState('');
    const [editInvestmentQuantity, setEditInvestmentQuantity] = useState('');
    const [editInvestmentPurchasePrice, setEditInvestmentPurchasePrice] = useState('');
    const [editInvestmentCurrentValue, setEditInvestmentCurrentValue] = useState('');
    const [editInvestmentInstitution, setEditInvestmentInstitution] = useState('');

    useEffect(() => {
        setInvestments(userProfile?.investments || []);
    }, [userProfile]);

    const handleAddInvestment = () => {
        if (newInvestmentName && newInvestmentType && !isNaN(parseFloat(newInvestmentPurchasePrice)) && !isNaN(parseFloat(newInvestmentCurrentValue))) {
            const newInvestment = {
                name: newInvestmentName.trim(),
                type: newInvestmentType,
                quantity: newInvestmentQuantity ? parseInt(newInvestmentQuantity) : null,
                purchasePrice: parseFloat(newInvestmentPurchasePrice),
                currentValue: parseFloat(newInvestmentCurrentValue),
                institution: newInvestmentInstitution.trim(),
            };
            const updatedInvestments = [...investments, newInvestment];
            setInvestments(updatedInvestments);
            updateUserProfile({ investments: updatedInvestments });
            setNewInvestmentName('');
            setNewInvestmentType('');
            setNewInvestmentQuantity('');
            setNewInvestmentPurchasePrice('');
            setNewInvestmentCurrentValue('');
            setNewInvestmentInstitution('');
        } else {
            alert("Please enter valid investment details.");
        }
    };

    const handleRemoveInvestment = (index) => {
        const updatedInvestments = investments.filter((_, i) => i !== index);
        setInvestments(updatedInvestments);
        updateUserProfile({ investments: updatedInvestments });
        setEditingIndex(null);
    };

    const handleStartEdit = (index, investment) => {
        setEditingIndex(index);
        setEditInvestmentName(investment.name);
        setEditInvestmentType(investment.type);
        setEditInvestmentQuantity(investment.quantity || '');
        setEditInvestmentPurchasePrice(investment.purchasePrice);
        setEditInvestmentCurrentValue(investment.currentValue);
        setEditInvestmentInstitution(investment.institution);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
    };

    const handleSaveEdit = (index) => {
        if (editInvestmentName && editInvestmentType && !isNaN(parseFloat(editInvestmentPurchasePrice)) && !isNaN(parseFloat(editInvestmentCurrentValue))) {
            const updatedInvestments = investments.map((investment, i) =>
                i === index
                    ? {
                          name: editInvestmentName.trim(),
                          type: editInvestmentType,
                          quantity: editInvestmentQuantity ? parseInt(editInvestmentQuantity) : null,
                          purchasePrice: parseFloat(editInvestmentPurchasePrice),
                          currentValue: parseFloat(editInvestmentCurrentValue),
                          institution: editInvestmentInstitution.trim(),
                      }
                    : investment
            );
            setInvestments(updatedInvestments);
            updateUserProfile({ investments: updatedInvestments });
            setEditingIndex(null);
        } else {
            alert("Please enter valid investment details for editing.");
        }
    };

    const calculateTotalInvestmentValue = () => {
        return investments.reduce((sum, investment) => sum + (investment.currentValue || 0), 0);
    };

    return (
        <div className="investment-profile-container">
            <Navbar />
            <h2>My Investments</h2>

            <div className="investments-section">
                <h3>Your Investments</h3>
                {investments.length > 0 ? (
                    <ul>
                        {investments.map((investment, index) => (
                            <li key={index} className="investment-item">
                                {editingIndex === index ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editInvestmentName}
                                            onChange={(e) => setEditInvestmentName(e.target.value)}
                                            placeholder="Investment Name"
                                        />
                                        <input
                                            type="text"
                                            value={editInvestmentType}
                                            onChange={(e) => setEditInvestmentType(e.target.value)}
                                            placeholder="Type"
                                        />
                                        <input
                                            type="number"
                                            value={editInvestmentQuantity || ''}
                                            onChange={(e) => setEditInvestmentQuantity(e.target.value)}
                                            placeholder="Quantity (if applicable)"
                                        />
                                        <input
                                            type="number"
                                            value={editInvestmentPurchasePrice}
                                            onChange={(e) => setEditInvestmentPurchasePrice(e.target.value)}
                                            placeholder="Purchase Price"
                                        />
                                        <input
                                            type="number"
                                            value={editInvestmentCurrentValue}
                                            onChange={(e) => setEditInvestmentCurrentValue(e.target.value)}
                                            placeholder="Current Value"
                                        />
                                        <input
                                            type="text"
                                            value={editInvestmentInstitution}
                                            onChange={(e) => setEditInvestmentInstitution(e.target.value)}
                                            placeholder="Institution"
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
                                    <div className="investment-details">
                                        <span className="investment-name">{investment.name}</span> ({investment.type}) -
                                        {investment.quantity !== null && (
                                            <span> {investment.quantity} units at</span>
                                        )}
                                        <span> Purchased at ₹{investment.purchasePrice.toFixed(2)}, Current Value: ₹{investment.currentValue.toFixed(2)}</span>
                                        {investment.institution && (
                                            <span> - Held at {investment.institution}</span>
                                        )}
                                        <div className="actions">
                                            <button
                                                onClick={() => handleStartEdit(index, investment)}
                                                className="edit-button"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleRemoveInvestment(index)}
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
                    <p>No investments added yet.</p>
                )}
            </div>

            <div className="add-investment-section">
                <h3>Add New Investment</h3>
                <div className="add-form">
                    <input
                        type="text"
                        placeholder="Investment Name"
                        value={newInvestmentName}
                        onChange={(e) => setNewInvestmentName(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Type (e.g., Stock, Mutual Fund)"
                        value={newInvestmentType}
                        onChange={(e) => setNewInvestmentType(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Quantity (optional)"
                        value={newInvestmentQuantity}
                        onChange={(e) => setNewInvestmentQuantity(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Purchase Price"
                        value={newInvestmentPurchasePrice}
                        onChange={(e) => setNewInvestmentPurchasePrice(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Current Value"
                        value={newInvestmentCurrentValue}
                        onChange={(e) => setNewInvestmentCurrentValue(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Institution (optional)"
                        value={newInvestmentInstitution}
                        onChange={(e) => setNewInvestmentInstitution(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleAddInvestment} className="add-button">
                        Add Investment
                    </button>
                </div>
            </div>

            <div className="total-investment-section">
                <h3>Total Investment Value:</h3>
                <p className="total-amount">₹{calculateTotalInvestmentValue().toFixed(2)}</p>
            </div>
        </div>
    );
}

export default InvestmentProfile;