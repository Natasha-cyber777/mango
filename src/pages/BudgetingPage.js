// BudgetingPage.js
import React, { useState, useEffect } from 'react';
import BudgetForm from '../components/BudgetForm';
import BudgetList from '../components/BudgetList';
import BudgetProgress from '../components/BudgetProgress';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import './BudgetingPage.css'; // Import the CSS file
import { toast } from 'react-toastify';
import Chatbot from '../components/Chatbot';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useLocation } from 'react-router-dom'; // Import useLocation

const BudgetingPage = () => {
    const [budgetAdded, setBudgetAdded] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth(); // Use the useAuth hook to get currentUser
    const location = useLocation(); // Use the useLocation hook to get the current path
    const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State to control chatbot visibility

    const handleBudgetAdded = () => {
        setBudgetAdded(!budgetAdded);
    };

    const handleDeleteBudget = async (budgetId) => {
        if (!auth.currentUser) {
            toast.error("You must be logged in to delete a budget.");
            return;
        }
        try {
            await deleteDoc(doc(db, 'budgets', budgetId));
            toast.success("Budget deleted successfully!");
        } catch (err) {
            console.error("Error deleting budget:", err);
            toast.error("Failed to delete budget.");
        }
    };

    const handleEditBudget = async (budgetId, newCategory, newAmount) => {
        if (!auth.currentUser) {
            toast.error("You must be logged in to edit a budget.");
            return;
        }
        try {
            const budgetRef = doc(db, 'budgets', budgetId);
            await updateDoc(budgetRef, {
                category: newCategory,
                amount: parseFloat(newAmount),
            });
            toast.success("Budget updated successfully!");
        } catch (err) {
            console.error("Error updating budget:", err);
            toast.error("Failed to update budget.");
        }
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const qTransactions = query(collection(db, 'transactions'), where('userId', '==', user.uid));
        const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
            const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setTransactions(items);
        }, (err) => {
            console.error("Error fetching transactions:", err);
            setError("Failed to fetch transactions.");
            setLoading(false);
        });

        const qBudgets = query(collection(db, 'budgets'), where('userId', '==', user.uid));
        const unsubscribeBudgets = onSnapshot(qBudgets, (snapshot) => {
            const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setBudgets(items);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching budgets:", err);
            setError("Failed to fetch budgets.");
            setLoading(false);
        });

        return () => {
            unsubscribeTransactions();
            unsubscribeBudgets();
        };
    }, [auth.currentUser, budgetAdded]); // Added auth.currentUser as a dependency

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
    };

    if (loading) {
        return <div>Loading budgets...</div>;
    }

    if (error) {
        return <div>Error loading budgets: {error}</div>;
    }

    return (
        <div className="budgeting-page-container">
            <Navbar />
            <div className="budgeting-page-content">
                <h1 className="budgeting-title">My Budgets</h1>

                <section className="budget-form-section">
                    <h2>Add New Budget Category</h2>
                    <BudgetForm onBudgetAdded={handleBudgetAdded} />
                </section>

                <section className="budget-list-section">
                    <h2>Your Budgets</h2>
                    {budgets.length > 0 ? (
                        <BudgetList
                            budgets={budgets}
                            onDelete={handleDeleteBudget}
                            onEdit={handleEditBudget} // Pass the edit handler
                        />
                    ) : (
                        <p>No budget categories created yet. Add one above!</p>
                    )}
                </section>

                <section className="budget-progress-section">
                    <h2>Budget Progress</h2>
                    {budgets.length > 0 ? (
                        <div className="budget-progress-grid">
                            {budgets.map((budget) => (
                                <BudgetProgress
                                    key={budget.id}
                                    budget={budget}
                                    transactions={transactions}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No budgets to track progress for.</p>
                    )}
                </section>
            </div>
            {isChatbotOpen && (
                <div className="chatbot-wrapper">
                    <Chatbot user={currentUser} currentPage={location.pathname} />
                </div>
            )}
        </div>
    );
};

export default BudgetingPage;