import React, { useState, useCallback, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import EditTransactionModal from '../components/EditTransactionModal';
import TransactionChart from '../components/TransactionChart';
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
import QRScannerModal from '../components/QRScannerModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPiggyBank, faChartLine, faShoppingCart, faCalculator, faFileAlt, faCoins, faBrain, faExclamationTriangle as faExclamationTriangle,
    faUserFriends, faHome, faStar, faListAlt, faQuoteLeft, faQuoteRight, faSeedling, faCoins as faCoinsSolid
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation


const personalityDescriptions = {
    "Financially Disciplined": { description: "You are a meticulous planner and saver. You prioritize budgeting, saving, and responsible debt management. You likely have clear financial goals and work diligently towards them.", strengths: ["Excellent at budgeting and tracking expenses.", "Consistent in saving money.", "Responsible with debt management.", "Likely to achieve long-term financial goals."], weaknesses: ["May be overly cautious with investments.", "Could miss out on some growth opportunities due to risk aversion.", "Might find it difficult to make spontaneous purchases."], recommendations: ["Continue your disciplined approach to saving and budgeting.", "Consider diversifying your investments to balance caution with potential growth.", "Allow for some flexibility in your budget for occasional enjoyable expenses."], icon: faPiggyBank, color: "#8bc34a" },
    "Risk-Taking Investor": { description: "You are comfortable taking calculated risks with your finances. You are likely interested in investments and are open to exploring opportunities for higher returns, even if they come with higher volatility.", strengths: ["Comfortable with investing in stocks, crypto, or other growth assets.", "Likely to seek out opportunities for higher returns.", "Proactive in managing and growing wealth."], weaknesses: ["May take on excessive risk without proper diversification.", "Could be more susceptible to market fluctuations.", "Might overlook the importance of a strong financial foundation with savings."], recommendations: ["Ensure your risk tolerance aligns with your financial goals and time horizon.", "Diversify your investment portfolio to manage risk effectively.", "Don't neglect the importance of emergency savings."], icon: faChartLine, color: "#ff9800" },
    "Spontaneous Spender": { description: "You enjoy spending and may prioritize immediate gratification. While you may enjoy life's pleasures, it's important to balance spending with saving and financial planning for the future.", strengths: ["Enjoys life and is not afraid to spend on experiences.", "May be generous with others."], weaknesses: ["May struggle with budgeting and saving consistently.", "Could accumulate debt due to impulse purchases.", "Might not have a clear long-term financial plan."], recommendations: ["Develop a budget to track your spending and identify areas to save.", "Consider setting financial goals to motivate saving.", "Practice delaying purchases to avoid impulsive spending."], icon: faShoppingCart, color: "#f44336" },
    "Balanced Individual": { description: "You exhibit a balanced approach to your finances, showing aspects of discipline, risk awareness, and enjoyment of spending. You likely have a good understanding of financial basics and strive for a healthy financial life.", strengths: ["Good understanding of financial principles.", "Balances saving and spending.", "Likely to make informed financial decisions."], weaknesses: ["May need to focus more on specific areas like investing or stricter budgeting to achieve more ambitious financial goals."], recommendations: ["Continue to maintain a balanced approach.", "Identify specific financial goals and tailor your strategies accordingly (e.g., more aggressive saving or investment).", "Regularly review your financial plan to ensure it aligns with your evolving needs."], icon: faPiggyBank, color: "#9e9e9e" },
};

export const fetchTransactions = (setTransactions) => {
    const user = auth.currentUser;
    if (!user) {
        console.error('fetchTransactions: No user authenticated');
        return;
    }

    try {
        const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setTransactions(items);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
    }
};

const Dashboard = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Expense');
    const [transactions, setTransactions] = useState([]);
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [editTransaction, setEditTransaction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('date');
    const [financialPersonality, setFinancialPersonality] = useState(null);
    const [loadingPersonality, setLoadingPersonality] = useState(true);
    const [userProfileData, setUserProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    const fetchUserProfile = async () => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                setUserProfileData(docSnap.data());
            } else {
                console.log("No user profile data found.");
                setUserProfileData({});
            }
        }
        setLoadingProfile(false);
    };
const handleOpenQR = useCallback(() => {
    console.log("Dashboard: handleOpenQR - Setting showQR to true");
    setShowQR(true);
  }, []);

  const handleCloseQR = useCallback(() => {
    console.log("Dashboard: handleCloseQR - Setting showQR to false");
    setShowQR(false);
  }, []);
    useEffect(() => {
        const unsubscribeTransactions = fetchTransactions(setTransactions);
        const fetchPersonality = async () => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().financialPersonality) {
                    setFinancialPersonality(docSnap.data().financialPersonality);
                }
            }
            setLoadingPersonality(false);
        };

        fetchPersonality();
        fetchUserProfile();

        return () => unsubscribeTransactions && unsubscribeTransactions();
    }, [user]);

    const calculateTotalSavingsProfile = () => {
        return userProfileData?.savingsAccounts?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;
    };

    const calculateTotalInvestmentValue = () => {
        return userProfileData?.investments?.reduce((sum, investment) => sum + (investment.currentValue || 0), 0) || 0;
    };

    const calculateTotalDebt = () => {
        return userProfileData?.debts?.reduce((sum, debt) => sum + (debt.balance || 0), 0) || 0;
    };

    const calculateTotalIncomeProfile = () => {
        return userProfileData?.incomeSources?.reduce((sum, source) => sum + (source.amount || 0), 0) || 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description || !date) return;

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error('handleSubmit: No user authenticated.');
                return;
            }

            await addDoc(collection(db, 'transactions'), {
                amount: parseFloat(amount),
                description,
                type,
                category,
                date,
                userId: currentUser.uid,
                createdAt: new Date(),
            });

            setAmount('');
            setDescription('');
            setType('Expense');
            setCategory('');
            setDate('');
        } catch (error) {
            console.error('Error adding transaction:', error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'transactions', id));
        } catch (error) {
            console.error('Error deleting transaction:', error.message);
        }
    };

    const handleEdit = (transaction) => {
        setEditTransaction(transaction);
    };

    const handleUpdate = async (updatedTransaction) => {
        try {
            await updateDoc(doc(db, 'transactions', updatedTransaction.id), updatedTransaction);
            setEditTransaction(null);
        } catch (error) {
            console.error('Error updating transaction:', error.message);
        }
    };

    const filteredTransactions = transactions
        .filter((transaction) =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === 'amount') {
                return b.amount - a.amount;
            }
            return new Date(b.date) - new Date(a.date);
        });

    const totalIncomeFromTransactions = filteredTransactions
        .filter((transaction) => transaction.type === 'Income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpensesFromTransactions = filteredTransactions
        .filter((transaction) => transaction.type === 'Expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalSavingsFromTransactions = filteredTransactions
        .filter((transaction) => transaction.type === 'Savings')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    // Corrected totalBalance calculation
    const totalBalance = totalIncomeFromTransactions - totalExpensesFromTransactions;

    const featureList = [
        { name: 'Group Expense Calculator', icon: faCalculator, path: '/groupexpensecalculator' },
        { name: 'Reports', icon: faFileAlt, path: '/report' },
        { name: 'Budgeting', icon: faCoins, path: '/budgetingpage' },
        { name: 'Student Expense Planner', icon: faUserFriends, path: '/studentexpenseplanner' },
        { name: 'Home Expense Planner', icon: faHome, path: '/homexpenseplanner' },
        { name: 'Special Planner', icon: faStar, path: '/specialplannerpage' },
        {
            name: 'Budget Anomalies',
            icon: faExclamationTriangle,
            path: '/budgetanomaliespage',
            isAiPowered: true,
            description: 'Identify unusual spending patterns and potential budget issues.',
        },
        {
            name: 'AI Budget Assistant',
            icon: faBrain,
            path: '/aibudgetpage',
            isAiPowered: true,
            description: 'Get intelligent suggestions for optimizing your budget.',
        },
    ];
    const standardFeatures = featureList.filter(feature => !feature.isAiPowered);
    const aiFeatures = featureList.filter(feature => feature.isAiPowered);

    const handleFeatureClick = (path) => {
        navigate(path); // Programmatic navigation
    };

    return (
        <div className="dashboard-grid-container">
            <Navbar />
            <main className="dashboard-main-content">
                {/* More Prominent Tagline Card Section */}
                <div className="hero-card card">
                    <div className="hero-content">
                        <FontAwesomeIcon icon={faCoinsSolid} className="hero-icon" />
                        <h2 className="hero-title">Take Control of Your Finances</h2>
                        <p className="hero-subtitle">Track your spending, set budgets, and achieve your financial goals with ease.</p>
                        <button className="hero-button" onClick={() => navigate('/budgetingpage')}>Explore Budgeting</button>
                    </div>
                </div>
                <div className="top-summary">
                    <div className="summary-card">
                        <p>Total Balance</p>
                        <h2>₹{totalBalance.toFixed(2)}</h2>
                    </div>
                    <div className="summary-card">
                        <p>Income</p>
                        <h2 className="income">₹{totalIncomeFromTransactions.toFixed(2)}</h2>
                    </div>
                    <div className="summary-card">
                        <p>Savings</p>
                        <h2 className="savings">₹{totalSavingsFromTransactions.toFixed(2)}</h2>
                    </div>
                    <div className="summary-card">
                        <p>Expenses</p>
                        <h2 className="expense">₹{totalExpensesFromTransactions.toFixed(2)}</h2>
                    </div>
                </div>

                <div className="main-content-row">
                    <div className="add-transaction-section card">
                        <h3><FontAwesomeIcon icon={faPiggyBank} /> Add New Transaction</h3>
                        <form className="form-card" onSubmit={handleSubmit}>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" required />
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
                            <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="Expense">Expense</option>
                                <option value="Income">Income</option>
                                <option value="Savings">Savings</option>
                            </select>
                            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            <button type="submit">Add Transaction</button>
                        </form>
                    </div>
                    <div className="transaction-chart-section card">
                        <h3><FontAwesomeIcon icon={faChartLine} /> Transaction Chart</h3>
                        <TransactionChart transactions={filteredTransactions} />
                    </div>
                </div>

                <div className="main-content-row">
                    <div className="financial-profile-section card">
                        <h3><FontAwesomeIcon icon={faUserFriends} /> Financial Personality</h3>
                        {loadingPersonality ? (
                            <p>Loading...</p>
                        ) : financialPersonality ? (
                            <div className="personality-info">
                                <h4>{financialPersonality}</h4>
                                {personalityDescriptions[financialPersonality] && (
                                    <>
                                        <div className="personality-icon">
                                            <FontAwesomeIcon icon={personalityDescriptions[financialPersonality].icon} size="2x" style={{ color: personalityDescriptions[financialPersonality].color }} />
                                        </div>
                                        <p>{personalityDescriptions[financialPersonality].description.substring(0, 100)}...</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <p>Take the Financial Personality Profiler to learn more about your financial habits!</p>
                        )}
                    </div>
                    <div className="overview-section card">
                        <h3><FontAwesomeIcon icon={faFileAlt} /> Overview</h3>
                        {loadingProfile ? (
                            <p>Loading Profile Data...</p>
                        ) : userProfileData ? (
                            <>
                                <p>Income (Profile): <span className="income">₹{calculateTotalIncomeProfile().toFixed(2)}</span></p>
                                <p>Savings (Profile): <span className="savings">₹{calculateTotalSavingsProfile().toFixed(2)}</span></p>
                                <p>Investments: <span className="investments">₹{calculateTotalInvestmentValue().toFixed(2)}</span></p>
                                <p>Debts: <span className="debts">₹{calculateTotalDebt().toFixed(2)}</span></p>
                            </>
                        ) : (
                            <p>No profile data available. Please update your profile.</p>
                        )}
                    </div>
                </div>

                {/* New Section for Features */}
                
                <div className="dashboard-features card">
                    <h2>Explore More Features</h2>
                    <div className="feature-list">
                        {standardFeatures.map((feature) => (
                            <div
                                key={feature.name}
                                className="feature-item"
                                onClick={() => handleFeatureClick(feature.path)}
                            >
                                <FontAwesomeIcon icon={feature.icon} size="2x" />
                                <p className="feature-name">{feature.name}</p>
                                {feature.description && <p className="feature-description">{feature.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {aiFeatures.length > 0 && (
                    <div className="ai-features-card card">
                        <h2>AI Powered Tools</h2>
                        <div className="ai-feature-list">
                            {aiFeatures.map((feature) => (
                                <div
                                    key={feature.name}
                                    className="ai-feature-item"
                                    onClick={() => handleFeatureClick(feature.path)}
                                >
                                    <FontAwesomeIcon icon={feature.icon} size="2x" />
                                    <div className="feature-info">
                                        <p className="feature-name">{feature.name}</p>
                                        {feature.description && <p className="feature-description">{feature.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="transactions-section card" style={{ display: 'none' }}>
                    <h3><FontAwesomeIcon icon={faListAlt} /> Transactions</h3>
                    <div className="controls">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="date">Sort by Date</option>
                            <option value="amount">Sort by Amount</option>
                        </select>
                        <button onClick={() => {
                            const csvContent =
                                'data:text/csv;charset=utf-8,' +
                                filteredTransactions.map((t) => `${t.description},${t.type},${t.amount},${t.date}`).join('\n');
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement('a');
                            link.setAttribute('href', encodedUri);
                            link.setAttribute('download', 'transactions.csv');
                            document.body.appendChild(link);
                            link.click();
                        }}>
                            Export as CSV
                        </button>
                    </div>
                    <div className="transaction-list">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="transaction-item">
                                <span>{transaction.description} - ₹{transaction.amount}</span>
                                <div>
                                    <button onClick={() => handleEdit(transaction)}>Edit</button>
                                    <button onClick={() => handleDelete(transaction.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {editTransaction && (
                    <EditTransactionModal
                        transaction={editTransaction}
                        onClose={() => setEditTransaction(null)}
                        onUpdate={handleUpdate}
                    />
                )}
            </main>
            <button className="qr-btn" onClick={() => setShowQR(true)}>
        Scan QR
      </button>

      {showQR && <QRScannerModal onClose={() => setShowQR(false)} />}
        </div>
    );
};

export default Dashboard;