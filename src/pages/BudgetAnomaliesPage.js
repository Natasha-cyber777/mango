import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styles from './BudgetAnomaliesPage.module.css'; // Import CSS Modules
import Navbar from '../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faShoppingBag, faBus, faGraduationCap, faHome, faExclamationTriangle, faChartBar, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../utils/currencyUtils'; // Assuming you have a utility for formatting currency
import { useMediaQuery } from 'react-responsive';

function BudgetAnomaliesPage() {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = getAuth();
    const db = getFirestore();
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [expandedRow, setExpandedRow] = useState(null);
    const [expandedAnomalyId, setExpandedAnomalyId] = useState(null);
    const [budgetDetails, setBudgetDetails] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [allBudgets, setAllBudgets] = useState({});
    const [allExpenses, setAllExpenses] = useState({});

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                const fetchPlannerData = async () => {
                    setLoading(true);
                    setError(null);
                    const budgets = {};
                    const expenses = {};
                
                    const budgetCollections = {
                        student: query(collection(db, 'user_budgets'), where('userId', '==', user.uid)),
                        home: query(collection(db, 'home_user_budgets'), where('userId', '==', user.uid)),
                        special: query(collection(db, 'sp_budgets'), where('userId', '==', user.uid)),
                    };
                
                    const expenseCollections = {
                        student: query(collection(db, 'expenses'), where('userId', '==', user.uid)),
                        home: query(collection(db, 'home_expenses'), where('userId', '==', user.uid)),
                        special: query(collection(db, 'sp_items'), where('userId', '==', user.uid)),
                    };
                
                    try {
                        await Promise.all(
                            Object.entries(budgetCollections).map(async ([planner, ref]) => {
                                const snapshot = await getDocs(ref);
                                budgets[planner] = {};
                                snapshot.forEach(doc => {
                                    const data = doc.data();
                                    const categoryKey = data.category ? data.category.toLowerCase() : doc.id; // Use data.category if it exists, otherwise doc.id
                                    if (data.amount) {
                                        budgets[planner][categoryKey] = data.amount;
                                    }
                                });
                            })
                        );
                
                        await Promise.all(
                            Object.entries(expenseCollections).map(async ([planner, ref]) => {
                                const snapshot = await getDocs(ref);
                                expenses[planner] = {};
                                snapshot.forEach(doc => {
                                    const data = doc.data();
                                    const categoryKey = data.category ? data.category.toLowerCase() : doc.id; // Assuming expenses also have a category
                                    if (data.amount) {
                                        expenses[planner][categoryKey] = (expenses[planner][categoryKey] || 0) + data.amount;
                                    }
                                });
                            })
                        );
                
                        setAllBudgets(budgets);
                        console.log("All Budgets:", budgets);
                        setAllExpenses(expenses);
                        console.log("All Expenses:", expenses);
                        setLoading(false);
                    } catch (err) {
                        console.error("Error fetching planner data:", err);
                        setError("Failed to load budget and expense data.");
                        setLoading(false);
                    }
                };

                fetchPlannerData();
            } else {
                setAllBudgets({});
                setAllExpenses({});
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, db]);

    useEffect(() => {
        if (!loading && !error) {
            const detectedAnomalies = [];

            // Analyze anomalies for each planner
            for (const planner in allBudgets) {
                if (allBudgets.hasOwnProperty(planner) && allExpenses.hasOwnProperty(planner)) {
                    const budgets = allBudgets[planner];
                    const expenses = allExpenses[planner];

                    for (const category in budgets) {
                        if (budgets.hasOwnProperty(category)) {
                            const budget = budgets[category];
                            const spending = expenses[category] || 0;

                            const percentageSpent = budget > 0 ? (spending / budget) * 100 : 0;

                            let anomalyType = null;
                            if (percentageSpent > 110) {
                                anomalyType = 'Exceeded Budget';
                            } else if (percentageSpent > 95) {
                                anomalyType = 'Near Budget Limit';
                            }

                            if (anomalyType) {
                                detectedAnomalies.push({
                                    planner: planner.charAt(0).toUpperCase() + planner.slice(1),
                                    category: category.charAt(0).toUpperCase() + category.slice(1),
                                    budget: budget,
                                    spending: spending,
                                    anomaly_type: anomalyType,
                                });
                            }
                        }
                    }
                }
            }
            setAnomalies(detectedAnomalies);
        }
    }, [allBudgets, allExpenses, loading, error]);

    const getPlannerIcon = (planner) => {
        switch (planner.toLowerCase()) {
            case 'student':
                return faGraduationCap;
            case 'special':
                return faExclamationTriangle;
            case 'home':
                return faHome;
            default:
                return faExclamationTriangle;
        }
    };

    const getCategoryIcon = (category) => {
        switch (category.toLowerCase()) {
            case 'shopping':
                return faShoppingBag;
            case 'transport':
                return faBus;
            default:
                return faExclamationTriangle;
        }
    };

    const sortAnomalies = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const sortedAnomalies = React.useMemo(() => {
        if (!sortBy) return anomalies;

        return [...anomalies].sort((a, b) => {
            let comparison = 0;
            if (a[sortBy] > b[sortBy]) {
                comparison = 1;
            } else if (a[sortBy] < b[sortBy]) {
                comparison = -1;
            }
            return sortDirection === 'asc' ? comparison : comparison * -1;
        });
    }, [anomalies, sortBy, sortDirection]);

    const handleViewBudgetClick = (anomaly) => {
        setExpandedAnomalyId(anomaly.category + anomaly.planner);
        setExpandedRow('budget');
        setBudgetDetails({
            category: anomaly.category,
            budget: anomaly.budget,
            planner: anomaly.planner,
            period: 'Monthly', // Assuming monthly for all
            notes: `Budget for ${anomaly.category} in ${anomaly.planner}`,
        });
        setTransactions(null);
    };

    const handleSeeTransactionsClick = (anomaly) => {
        setExpandedAnomalyId(anomaly.category + anomaly.planner);
        setExpandedRow('transactions');
        setLoadingDetails(true);
        setErrorDetails(null);

        const plannerKey = anomaly.planner.toLowerCase();
        const categoryKey = anomaly.category.toLowerCase(); // Assuming your expense IDs match budget categories

        const relevantTransactions = Object.entries(allExpenses[plannerKey] || {})
            .filter(([id, amount]) => id.toLowerCase() === categoryKey)
            .map(([id, amount]) => ({ id, description: id.charAt(0).toUpperCase() + id.slice(1), amount, date: 'N/A' })); // Mock date

        setTimeout(() => {
            setTransactions(relevantTransactions);
            setLoadingDetails(false);
        }, 500);
        setBudgetDetails(null);
    };

    const handleCloseExpanded = () => {
        setExpandedRow(null);
        setExpandedAnomalyId(null);
        setBudgetDetails(null);
        setTransactions(null);
        setLoadingDetails(false);
        setErrorDetails(null);
    };

    if (loading) {
        return <div className={styles.loading}>Loading budget anomalies...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    if (!auth.currentUser) {
        return <div>Please log in to view budget anomalies.</div>;
    }

    const totalAnomalies = sortedAnomalies.length;
    const totalOverBudget = sortedAnomalies.reduce((sum, anomaly) => {
        if (anomaly.anomaly_type.includes('Exceeded')) {
            return sum + (anomaly.spending - anomaly.budget);
        }
        return sum;
    }, 0);

    return (
        <div className={styles.container}>
            <Navbar />
            <h2 className={styles.title}>Budget Anomaly Alerts</h2>

            {totalAnomalies > 0 && (
                <div className={styles.summary}>
                    <p>Total Budget Anomalies: <strong>{totalAnomalies}</strong></p>
                    {totalOverBudget > 0 && (
                        <p>Total Amount Over Budget: <strong>{formatCurrency(totalOverBudget)}</strong></p>
                    )}
                </div>
            )}

            {sortedAnomalies.length > 0 ? (
                isMobile ? (
                    <div className={styles.mobileCardContainer}>
                        {sortedAnomalies.map((anomaly, index) => (
                            <div key={index} className={styles.mobileCard}>
                                <h3>
                                    <FontAwesomeIcon icon={getCategoryIcon(anomaly.category)} className={styles.icon} />
                                    {anomaly.category} ({anomaly.planner})
                                </h3>
                                <p>Budget: {formatCurrency(anomaly.budget)}</p>
                                <p>Spending: {formatCurrency(anomaly.spending)}</p>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progress}
                                        style={{
                                            width: `${(anomaly.spending / anomaly.budget) * 100 > 100 ? 100 : (anomaly.spending / anomaly.budget) * 100}%`,
                                            backgroundColor: (anomaly.spending / anomaly.budget) > 1 ? 'red' : 'orange',
                                        }}
                                    />
                                </div>
                                <p className={styles.spendingRatio}>
                                    {Math.round((anomaly.spending / anomaly.budget) * 100)}% of budget
                                </p>
                                <div className={styles.status}>
                                    <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className={`${styles.statusIcon} ${anomaly.anomaly_type.includes('Exceeded') ? styles.exceeded : styles.warning}`}
                                    />
                                    {anomaly.anomaly_type}
                                </div>
                                <div className={styles.actions}>
                                    <button className={styles.actionButton} onClick={() => handleViewBudgetClick(anomaly)}>
                                        View Budget <FontAwesomeIcon icon={faArrowRight} />
                                    </button>
                                    <button className={styles.actionButton} onClick={() => handleSeeTransactionsClick(anomaly)}>
                                        See Transactions <FontAwesomeIcon icon={faChartBar} />
                                    </button>
                                </div>
                                {expandedAnomalyId === anomaly.category + anomaly.planner && expandedRow === 'budget' && budgetDetails && (
                                    <div className={styles.mobileCardExpanded}>
                                        <h4 style={{ color: styles.vibrantBlueLight }}>Budget Details for {budgetDetails.category} ({budgetDetails.planner})</h4>
                                        <p>Budget Amount: {formatCurrency(budgetDetails.budget)}</p>
                                        <p>Period: {budgetDetails.period}</p>
                                        {budgetDetails.notes && <p>Notes: {budgetDetails.notes}</p>}
                                        <button onClick={handleCloseExpanded} className={styles.closeButton}>Close</button>
                                    </div>
                                )}
                                {expandedAnomalyId === anomaly.category + anomaly.planner && expandedRow === 'transactions' && (
                                    <div className={styles.mobileCardExpanded}>
                                        <h4 style={{ color: styles.vibrantBlueLight }}>Recent Transactions for {anomaly.category} ({anomaly.planner})</h4>
                                        {loadingDetails ? (
                                            <p>Loading transactions...</p>
                                        ) : errorDetails ? (
                                            <p>Error loading transactions: {errorDetails}</p>
                                        ) : transactions.length > 0 ? (
                                            <ul>
                                                {transactions.map(transaction => (
                                                    <li key={transaction.id}>
                                                        {transaction.date} - {formatCurrency(transaction.amount)} - {transaction.description}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No recent transactions found for this category.</p>
                                        )}
                                        <button onClick={handleCloseExpanded} className={styles.closeButton}>Close</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                <table className={styles.anomaliesTable}>
                    <thead>
                        <tr>
                            <th onClick={() => sortAnomalies('planner')}>Planner</th>
                            <th onClick={() => sortAnomalies('category')}>Category</th>
                            <th onClick={() => sortAnomalies('budget')}>Budget</th>
                            <th onClick={() => sortAnomalies('spending')}>Spending</th>
                            <th onClick={() => sortAnomalies('anomaly_type')}>Anomaly Type</th>
                            <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                                {sortedAnomalies.map(anomaly => (
                                    <React.Fragment key={anomaly.category + anomaly.planner}>
                                        <tr className={styles.anomalyRow}>
                                            <td>
                                                <FontAwesomeIcon icon={getPlannerIcon(anomaly.planner)} className={styles.icon} />
                                                {anomaly.planner}
                                                </td>
                                                <td>
                                                    <FontAwesomeIcon icon={getCategoryIcon(anomaly.category)} className={styles.icon} />
                                                    {anomaly.category}
                                                    </td>
                                                    <td>{formatCurrency(anomaly.budget)}</td>
                                                    <td className={anomaly.spending > anomaly.budget ? styles.overBudget : ''}>{formatCurrency(anomaly.spending)}</td>
                                                    <td>
                                                        <FontAwesomeIcon
                                                        icon={faExclamationTriangle}
                                                        className={`${styles.statusIcon} ${anomaly.anomaly_type.includes('Exceeded') ? styles.exceeded : styles.warning}`}
                                                        />
                                                        {anomaly.anomaly_type}
                                                        </td>
                                                        <td className={styles.actions}>
                                                            <button onClick={() => handleViewBudgetClick(anomaly)} className={styles.viewButton}>
                                                                View Budget
                                                                </button>
                                                                <button onClick={() => handleSeeTransactionsClick(anomaly)} className={styles.viewButton}>
                                                                    See Transactions
                                                                    </button>
                                                                    </td>
                                                                    </tr>
                                                                    {expandedAnomalyId === anomaly.category + anomaly.planner && expandedRow === 'budget' && budgetDetails && (
                                                                         <tr className={styles.expandedRow}>
                                                                            <td colSpan="6">
                                                                                 <div className={styles.budgetDetails}>
                                                                                     <h3>Budget Details for {budgetDetails.category} ({budgetDetails.planner})</h3>
                                                                                     <p>Budget Amount: {formatCurrency(budgetDetails.budget)}</p>
                                                                                      <p>Period: {budgetDetails.period}</p>
                                                                                       {budgetDetails.notes && <p>Notes: {budgetDetails.notes}</p>}
                                                                                       <button onClick={handleCloseExpanded} className={styles.closeButton}>Close</button>
                                                                                        </div>
                                                                                         </td>
                                                                                          </tr>
                                                                                         )}
                                                                                          {expandedAnomalyId === anomaly.category + anomaly.planner && expandedRow === 'transactions' && (
                                                                                             <tr className={styles.expandedRow}>
                                                                                                <td colSpan="6">
                                                                                                     <div className={styles.transactionDetails}>
                                                                                                        <h3>Recent Transactions for {anomaly.category} ({anomaly.planner})</h3>
                                                                                                        {loadingDetails ? (
                                                                                                             <p>Loading transactions...</p>
                                                                                                            ) : errorDetails ? (
                                                                                                                 <p>Error loading transactions: {errorDetails}</p>
                                                                                                                 ) : transactions.length > 0 ? (
                                                                                                                     <ul>
                                                                                                                         {transactions.map(transaction => (
                                                                                                                            <li key={transaction.id}>
                                                                                                                                {transaction.date} - {formatCurrency(transaction.amount)} - {transaction.description}
                                                                                                                                 </li>
                                                                                                                                 ))}
                                                                                                                                 </ul>
                                                                                                                                 ) : (
                                                                                                                                 <p>No recent transactions found for this category.</p>
                                                                                                                                 )}
                                                                                                                                 <button onClick={handleCloseExpanded} className={styles.closeButton}>Close</button>
                                                                                                                                  </div>
                                                                                                                                   </td>
                                                                                                                                   </tr>
                                                                                                                                )}
                                                                                                                                </React.Fragment>
                                                                                                                            ))}
                                                                                                                             </tbody>
                                                                                                                              </table>
                                                                                                                               )
                                                                                                                             ) : (
                                                                                                                                 <div className={styles.noAnomalies}>
                                                                                                                                     <p>No budget anomalies detected. Your spending is within the expected limits.</p>
                                                                                                                                      </div>
                                                                                                                                     )}
                                                                                                                                     </div>
                                                                                                                                     );
}

export default BudgetAnomaliesPage;
