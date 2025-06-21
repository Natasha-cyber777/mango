import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useAuth } from '../contexts/AuthContext';
import Navbar from "../components/Navbar";
import "../styles/StudentExpensePlanner.css";

const categories = ["Food", "Rent", "Transport", "Entertainment", "Shopping", "Education", "Health"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6666", "#66CC99"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const StudentExpensePlanner = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(false);
  const [userBudgets, setUserBudgets] = useState({});
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategory, setBudgetCategory] = useState(categories[0]);
  const [budgetTrackingData, setBudgetTrackingData] = useState([]);
  const [summaryPeriod, setSummaryPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [carryOverEnabled, setCarryOverEnabled] = useState({});

  // --- Data Fetching ---
  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data()?.date?.toDate() }));
      setExpenses(data.filter(exp => exp.date)); // Ensure only expenses with valid dates are used
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
    setLoading(false);
  }, [user]);

  const fetchUserBudgets = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "user_budgets"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const budgetData = {};
      querySnapshot.docs.forEach(doc => {
        budgetData[doc.data().category] = doc.data().amount;
      });
      setUserBudgets(budgetData);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  }, [user]);

  // --- Data Manipulation ---
  const addExpense = async () => {
    if (!user || !amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    try {
      await addDoc(collection(db, "expenses"), {
        userId: user.uid,
        category,
        amount: parseFloat(amount),
        date: new Date(),
      });
      setAmount("");
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const setUserBudget = async () => {
    if (!user || !budgetAmount || isNaN(budgetAmount) || budgetAmount <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }
    try {
      await setDoc(doc(db, "user_budgets", `${user.uid}-${budgetCategory}`), {
        userId: user.uid,
        category: budgetCategory,
        amount: parseFloat(budgetAmount),
      });
      setUserBudgets(prev => ({ ...prev, [budgetCategory]: parseFloat(budgetAmount) }));
      setBudgetAmount("");
    } catch (error) {
      console.error("Error setting budget:", error);
    }
  };

  const deleteExpense = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "expenses", id));
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // --- Summary Calculations ---
  const getCurrentWeekExpenses = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return expenses.filter(exp => {
      const expenseDate = exp.date;
      return expenseDate >= startOfWeek && expenseDate <= endOfWeek;
    });
  }, [expenses]);

  const calculateWeeklySummary = useCallback(() => {
    const currentWeekExpenses = getCurrentWeekExpenses();
    const summary = {};
    currentWeekExpenses.forEach(exp => {
      summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
    });
    setWeeklySummary(summary);
  }, [getCurrentWeekExpenses]);

  const getMonthlyExpenses = useCallback(() => {
    return expenses.filter(exp => {
      const expenseDate = exp.date;
      return expenseDate?.getMonth() === selectedMonth && expenseDate?.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const calculateMonthlySummary = useCallback(() => {
    const currentMonthExpenses = getMonthlyExpenses();
    const summary = {};
    currentMonthExpenses.forEach(exp => {
      summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
    });
    setMonthlySummary(summary);
  }, [getMonthlyExpenses]);

  // --- Budget Tracking ---
  const updateBudgetTracking = useCallback(() => {
    const trackingData = categories.map(cat => {
      const budgetedAmount = userBudgets[cat] || 0;
      const spentAmount = expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0);
      const remainingAmount = budgetedAmount - spentAmount;
      const percentageSpent = budgetedAmount > 0 ? (spentAmount / budgetedAmount) * 100 : 0;

      return {
        name: cat,
        budgeted: budgetedAmount,
        spent: spentAmount,
        remaining: remainingAmount,
        percentage: percentageSpent,
      };
    });
    setBudgetTrackingData(trackingData);
  }, [expenses, userBudgets]);

  // --- Event Handlers ---
  const handlePeriodChange = (event) => {
    setSummaryPeriod(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  // --- Effects ---
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchUserBudgets();
    }
  }, [user, fetchExpenses, fetchUserBudgets]);

  useEffect(() => {
    updateBudgetTracking();
  }, [expenses, userBudgets, updateBudgetTracking]);

  useEffect(() => {
    if (expenses.length > 0) {
      calculateWeeklySummary();
      calculateMonthlySummary();
    }
  }, [expenses, selectedMonth, selectedYear, calculateWeeklySummary, calculateMonthlySummary]);

  // --- Chart Data Calculation ---
  const chartData = categories
    .map(cat => ({
      name: cat,
      value: expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0),
    }))
    .filter(data => data.value > 0);

  // --- Render ---
  return (
    <div className="expense-planner">
      <Navbar />
      <h2> Student Expense Planner</h2>
      {user ? (
        <>
          {/* Input Section */}
          <div className="input-section">
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
            <button onClick={addExpense} className="add-btn">Add Expense</button>
          </div>

          {/* Budget Section */}
          <div className="budget-section">
            <h3>Set Budget</h3>
            <select value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="Enter budget amount" />
            <button onClick={setUserBudget} className="set-budget-btn">Set Budget</button>
          </div>

          {/* Current Budgets Display */}
          <div className="budget-display">
            <h3>Current Budgets</h3>
            <ul>
              {Object.entries(userBudgets).length > 0 ? (
                Object.entries(userBudgets).map(([cat, amount]) => (
                  <li key={cat}>{cat}: ₹{amount}</li>
                ))
              ) : (
                <p>No budgets set yet.</p>
              )}
            </ul>
          </div>

          {/* Summary Period Selector */}
          <div className="summary-period-selector">
            <h3>View Summaries</h3>
            <select value={summaryPeriod} onChange={handlePeriodChange}>
              <option value="weekly">This Week</option>
              <option value="monthly">Monthly</option>
            </select>
            {summaryPeriod === 'monthly' && (
              <div>
                <select value={selectedMonth} onChange={handleMonthChange}>
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select value={selectedYear} onChange={handleYearChange}>
                  {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Weekly Summary */}
          {summaryPeriod === 'weekly' && weeklySummary && (
            <div className="summary-section">
              <h3>Weekly Summary</h3>
              {Object.keys(weeklySummary).length > 0 ? (
                <ul>
                  {Object.entries(weeklySummary).map(([category, total]) => (
                    <li key={category}>{category}: ₹{total.toFixed(2)}</li>
                  ))}
                </ul>
              ) : (
                <p>No expenses this week.</p>
              )}
            </div>
          )}

          {/* Monthly Summary */}
          {summaryPeriod === 'monthly' && monthlySummary && (
            <div className="summary-section">
              <h3>Monthly Summary ({months[selectedMonth]} {selectedYear})</h3>
              {Object.keys(monthlySummary).length > 0 ? (
                <ul>
                  {Object.entries(monthlySummary).map(([category, total]) => (
                    <li key={category}>{category}: ₹{total.toFixed(2)}</li>
                  ))}
                </ul>
              ) : (
                <p>No expenses this month.</p>
              )}
            </div>
          )}

          {/* Expense List Section */}
          <div className="expense-list-section">
            <h3>Recent Expenses</h3>
            {loading ? (
              <p>Loading expenses...</p>
            ) : expenses.length > 0 ? (
              <ul>
                {expenses.map(expense => (
                  <li key={expense.id}>
                    {expense.category}: ₹{expense.amount} ({expense.date ? format(expense.date, 'dd-MMM-yyyy') : 'N/A'})
                    <button onClick={() => deleteExpense(expense.id)} className="delete-btn">Delete</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No expenses added yet.</p>
            )}
          </div>

          {/* Budget vs. Expenses Tracking */}
          <div className="budget-tracking-section">
            <h3>Budget vs. Expenses</h3>
            {budgetTrackingData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Budgeted</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>% Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetTrackingData.map(item => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>₹{item.budgeted.toFixed(2)}</td>
                      <td>₹{item.spent.toFixed(2)}</td>
                      <td className={item.remaining < 0 ? 'over-budget' : ''}>₹{item.remaining.toFixed(2)}</td>
                      <td className={item.percentage > 100 ? 'over-budget' : ''}>{item.percentage.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No budgets set or expenses added to track.</p>
            )}
          </div>

          {/* Expense Breakdown Chart */}
          <div className="chart-section">
            <h3>Expense Breakdown</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ name, percent }) => (window.innerWidth > 600 ? `${name} ${(percent * 100).toFixed(0)}%` : null)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            ) : <p>No expenses yet to display in chart.</p>}
          </div>
        </>
      ) : <p>Please log in to manage your expenses.</p>}
    </div>
  );
};

export default StudentExpensePlanner;