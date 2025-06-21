import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Navbar from '../components/Navbar';
import './AIBudgetPage.css'; // Import your CSS

const AIBudgetPage = () => {
    const [userData, setUserData] = useState(null);
    const [budgetedExpenses, setBudgetedExpenses] = useState({});
    const [idealBudget, setIdealBudget] = useState({});
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchAIData = async () => {
            if (user) {
                const aiDataDocRef = doc(db, 'aiBudgetData', user.uid);
                try {
                    const docSnap = await getDoc(aiDataDocRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setBudgetedExpenses(data.budgetedExpenses || {});
                        setIdealBudget(data.idealBudget || {});
                    } else {
                        setBudgetedExpenses({});
                        setIdealBudget({});
                        console.log("No AI budget data found for user, initializing.");
                    }
                } catch (error) {
                    setError('Error fetching AI budget data: ' + error.message);
                } finally {
                    setLoading(false);
                }
            } else {
                setError('User not authenticated.');
                setLoading(false);
            }
        };

        fetchAIData();
    }, [db, user]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                try {
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        setError('Could not load user data.');
                    }
                } catch (e) {
                    setError('Error fetching user data: ' + e.message);
                }
            }
        };

        fetchUserData();
    }, [db, user]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setBudgetedExpenses(prevExpenses => ({
            ...prevExpenses,
            [name]: parseFloat(value) || 0,
        }));
    };

    const handleAddCustomCategoryClick = () => {
        setShowNewCategoryInput(true);
    };

    const handleNewCategoryNameChange = (event) => {
        setNewCategoryName(event.target.value);
    };

    const handleAddNewCategory = () => {
        if (newCategoryName && !budgetedExpenses.hasOwnProperty(newCategoryName)) {
            setBudgetedExpenses(prevExpenses => ({
                ...prevExpenses,
                [newCategoryName]: 0,
            }));
            setNewCategoryName('');
            setShowNewCategoryInput(false);
        } else if (budgetedExpenses.hasOwnProperty(newCategoryName)) {
            alert('Category name already exists.');
        } else {
            alert('Please enter a category name.');
        }
    };

    const saveAIData = async () => {
        if (user) {
            const aiDataDocRef = doc(db, 'aiBudgetData', user.uid);
            try {
                await setDoc(aiDataDocRef, {
                    budgetedExpenses: budgetedExpenses,
                    idealBudget: idealBudget,
                }, { merge: true });
                console.log('AI budget data saved successfully!');
                // Optionally provide user feedback
            } catch (error) {
                console.error('Error saving AI budget data: ', error);
                setError('Error saving AI budget data: ' + error.message);
                // Optionally provide user feedback
            }
        } else {
            console.error('User not authenticated, cannot save AI budget data.');
            setError('User not authenticated.');
        }
    };

    const generateClientSideSuggestions = () => {
        if (!userData) {
            return ['Could not load user data to generate suggestions.'];
        }

        const newSuggestions = [];
        const totalIncome = userData.incomeSources ? userData.incomeSources.reduce((sum, source) => sum + source.amount, 0) : 0;
        const totalBudgeted = Object.values(budgetedExpenses).reduce((sum, amount) => sum + amount, 0);
        const remainingIncome = totalIncome - totalBudgeted;
        const calculatedIdealBudget = {};

        const idealSavingsRate = 0.20;
        const idealDebtPaymentRate = 0.15;
        const remainingForExpenses = totalIncome * (1 - idealSavingsRate - idealDebtPaymentRate);

        calculatedIdealBudget['housing'] = remainingForExpenses * 0.30;
        calculatedIdealBudget['transportation'] = remainingForExpenses * 0.15;
        calculatedIdealBudget['food'] = remainingForExpenses * 0.20;
        calculatedIdealBudget['utilities'] = remainingForExpenses * 0.05;
        calculatedIdealBudget['entertainment'] = remainingForExpenses * 0.10;

        const otherBudgeted = Object.keys(budgetedExpenses)
            .filter(key => !['housing', 'transportation', 'food', 'utilities', 'entertainment'].includes(key))
            .reduce((sum, key) => sum + (budgetedExpenses[key] || 0), 0);

        const remainingIdealForOthers = remainingForExpenses * 0.20;

        if (otherBudgeted > 0 && remainingIdealForOthers > 0) {
            const scaleFactor = remainingIdealForOthers / otherBudgeted;
            Object.keys(budgetedExpenses)
                .filter(key => !['housing', 'transportation', 'food', 'utilities', 'entertainment'].includes(key))
                .forEach(key => {
                    calculatedIdealBudget[key] = (budgetedExpenses[key] || 0) * scaleFactor;
                });
        } else if (Object.keys(budgetedExpenses).filter(key => !['housing', 'transportation', 'food', 'utilities', 'entertainment'].includes(key)).length > 0) {
            const equallyDivide = remainingIdealForOthers / Object.keys(budgetedExpenses).filter(key => !['housing', 'transportation', 'food', 'utilities', 'entertainment'].includes(key)).length;
            Object.keys(budgetedExpenses)
                .filter(key => !['housing', 'transportation', 'food', 'utilities', 'entertainment'].includes(key))
                .forEach(key => {
                    calculatedIdealBudget[key] = equallyDivide || 0;
                });
        }

        setIdealBudget(calculatedIdealBudget);
        saveAIData(); // Save the ideal budget to Firestore

        if (remainingIncome < 0) {
            newSuggestions.push("Your total budgeted expenses exceed your income. Consider reviewing your spending and identifying areas for reduction.");
        } else if (remainingIncome > 0) {
            newSuggestions.push(`You have ₹${remainingIncome.toFixed(2)} remaining. Consider allocating more to savings or investments.`);
        }

        const totalSavings = userData.savingsAccounts ? userData.savingsAccounts.reduce((sum, account) => sum + account.balance, 0) : 0;
        const idealSavingsAmount = totalIncome * idealSavingsRate;
        if (totalSavings < idealSavingsAmount * 3) {
            newSuggestions.push("It's recommended to have at least 3-6 months of essential living expenses in savings for emergencies. Consider increasing your emergency fund contributions.");
        }

        if (userData.debts && userData.debts.length > 0) {
            const totalDebtPayment = userData.debts.reduce((sum, debt) => sum + (debt.minimumPayment || 0), 0);
            const idealDebtPayment = totalIncome * idealDebtPaymentRate;
            if (totalDebtPayment > idealDebtPayment) {
                newSuggestions.push("Your current debt payments are high. Explore strategies to pay down debt faster to free up cash flow.");
            } else if (totalDebtPayment < idealDebtPayment && userData.debts.some(debt => debt.interestRate > 0)) {
                newSuggestions.push("Consider allocating more towards debt with higher interest rates to save on interest in the long run.");
            }
        }

        Object.keys(budgetedExpenses).forEach(category => {
            const budgeted = budgetedExpenses[category] || 0;
            const ideal = calculatedIdealBudget[category] || 0;
            const difference = budgeted - ideal;

            if (Math.abs(difference) > ideal * 0.20) {
                if (budgeted > ideal) {
                    newSuggestions.push(`Your budgeted amount for '${category}' (₹${budgeted.toFixed(2)}) is significantly higher than the suggested ideal (₹${ideal.toFixed(2)}). Consider reviewing this spending.`);
                } else {
                    newSuggestions.push(`Your budgeted amount for '${category}' (₹${budgeted.toFixed(2)}) is lower than the suggested ideal (₹${ideal.toFixed(2)}). Ensure this meets your needs.`);
                }
            }
        });

        setSuggestions(newSuggestions);
    };

    const handleOptimizeBudgetClientSide = () => {
        generateClientSideSuggestions();
    };

    const handleSaveBudget = async () => {
        await saveAIData();
        alert('Budget data saved successfully!'); // Provide user feedback
    };

    if (loading) {
        return <div className="loading-indicator">Loading your financial data...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (!userData) {
        return <div>Could not load user information.</div>;
    }

    const totalIncome = userData.incomeSources ? userData.incomeSources.reduce((sum, source) => sum + source.amount, 0) : 0;
    const totalDebt = userData.debts ? userData.debts.reduce((sum, debt) => sum + debt.balance, 0) : 0;
    const totalSavings = userData.savingsAccounts ? userData.savingsAccounts.reduce((sum, account) => sum + account.balance, 0) : 0;

    const defaultExpenseCategories = ['housing', 'transportation', 'food', 'utilities', 'entertainment'];
    const allCategories = [...defaultExpenseCategories, ...Object.keys(budgetedExpenses).filter(key => !defaultExpenseCategories.includes(key))];

    return (
        <div className="aibudget-container">
            <Navbar />
            <div className="aibudget-content-wrapper">
                <h1 className="aibudget-page-title">AI Budget Optimizer</h1>

                <section id="overview">
                    <h2 className="aibudget-section-title">Your Financial Snapshot</h2>
                    <div className="overview-item" id="income-overview">Total Income: ₹{totalIncome.toFixed(2)}</div>
                    <div className="overview-item" id="debt-overview">Total Outstanding Debt: ₹{totalDebt.toFixed(2)}</div>
                    <div className="overview-item" id="savings-overview">Total Savings: ₹{totalSavings.toFixed(2)}</div>
                    {userData.savingsGoals && userData.savingsGoals.length > 0 && (
                        <div id="savings-goals-overview">
                            <h3 className="savings-goals-overview-title">Your Savings Goals</h3>
                            <ul className="savings-goals-list">
                                {userData.savingsGoals.map((goal, index) => (
                                    <li key={index} className="savings-goal-item">
                                        {goal.name}: Current ₹{goal.currentAmount.toFixed(2)}, Target ₹{goal.targetAmount.toFixed(2)}, Deadline: {goal.deadline}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <p>This is a summary of your existing financial data.</p>
                </section>

                <section id="budget-input">
                    <h2 className="aibudget-section-title">Enter Your Detailed Budgeted Expenses</h2>
                    <form id="budget-form">
                        {allCategories.map(category => (
                            <div className="category" key={category}>
                                <label htmlFor={category} className="category-label">{category.charAt(0).toUpperCase() + category.slice(1)}:</label>
                                <input
                                    type="number"
                                    id={category}
                                    name={category}
                                    placeholder="Enter amount"
                                    onChange={handleInputChange}
                                    value={budgetedExpenses[category] || ''}
                                    className="category-input"
                                />
                                {idealBudget[category] !== undefined && (
                                    <p className="ideal-budget-text">Ideal: ₹{idealBudget[category].toFixed(2)}</p>
                                )}
                            </div>
                        ))}
                        {!showNewCategoryInput ? (
                            <button type="button" onClick={handleAddCustomCategoryClick} className="add-category-button">Add Custom Category</button>
                        ) : (
                            <div className="new-category-input">
                                <input
                                    type="text"
                                    placeholder="New category name"
                                    value={newCategoryName}
                                    onChange={handleNewCategoryNameChange}
                                    className="category-input"
                                />
                                <button type="button" onClick={handleAddNewCategory} className="add-category-button">Add</button>
                                <button type="button" onClick={() => setShowNewCategoryInput(false)} className="add-category-button">Cancel</button>
                            </div>
                        )}
                    </form>
                    <button type="button" onClick={handleSaveBudget} className="save-budget-button">Save Budget</button>
                </section>

                <div className="optimize-budget-button-container">
                    <button onClick={handleOptimizeBudgetClientSide} disabled={loading} className="optimize-budget-button">
                        {loading ? 'Optimizing...' : 'Optimize My Budget'}
                    </button>
                </div>

                <section id="ai-suggestions">
                    <h2 className="aibudget-section-title">AI-Powered Budget Suggestions</h2>
                    <div id="suggestions-list">
                        {suggestions.length > 0 ? (
                            <ul className="suggestions-list-ul">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} className="suggestion-item">{suggestion}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No optimization suggestions yet. Enter your budget and click 'Optimize My Budget'.</p>
                        )}
                    </div>
                </section>

                <p className="disclaimer">
                    Please note: These are basic client-side suggestions for informational purposes only and do not constitute financial advice.
                    For more comprehensive and personalized guidance, consider a backend-powered solution with more advanced AI capabilities.
                </p>
            </div>
        </div>
    );
};

export default AIBudgetPage;