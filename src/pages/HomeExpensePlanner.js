import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useAuth } from '../contexts/AuthContext';
import Navbar from "../components/Navbar";
import "../styles/StudentExpensePlanner.css";

const homeCategories = ["Groceries", "Utilities", "Household", "Dining", "Transportation", "Personal", "Other"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6666", "#66CC99"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const HomeExpensePlanner = () => {
  const { user } = useAuth();
  const [homeExpenses, setHomeExpenses] = useState([]);
  const [homeAmount, setHomeAmount] = useState("");
  const [homeCategory, setHomeCategory] = useState(homeCategories[0]);
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeUserBudgets, setHomeUserBudgets] = useState({});
  const [homeBudgetAmount, setHomeBudgetAmount] = useState("");
  const [homeBudgetCategory, setHomeBudgetCategory] = useState(homeCategories[0]);
  const [homeBudgetTrackingData, setHomeBudgetTrackingData] = useState([]);
  const [homeSummaryPeriod, setHomeSummaryPeriod] = useState('monthly');
  const [homeSelectedMonth, setHomeSelectedMonth] = useState(new Date().getMonth());
  const [homeSelectedYear, setHomeSelectedYear] = useState(new Date().getFullYear());
  const [homeWeeklySummary, setHomeWeeklySummary] = useState(null);
  const [homeMonthlySummary, setHomeMonthlySummary] = useState(null);

  // --- Data Fetching ---
  const fetchHomeExpenses = useCallback(async () => {
    if (!user) return;
    setHomeLoading(true);
    try {
      const q = query(collection(db, "home_expenses"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHomeExpenses(data);
    } catch (error) {
      console.error("Error fetching home expenses:", error);
    }
    setHomeLoading(false);
  }, [user]);

  const fetchHomeUserBudgets = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "home_user_budgets"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const budgetData = {};
      querySnapshot.docs.forEach(doc => {
        budgetData[doc.data().category] = doc.data().amount;
      });
      setHomeUserBudgets(budgetData);
    } catch (error) {
      console.error("Error fetching home budgets:", error);
    }
  }, [user]);

  // --- Data Manipulation ---
  const addHomeExpense = async () => {
    if (!user || !homeAmount || isNaN(homeAmount) || homeAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    try {
      await addDoc(collection(db, "home_expenses"), {
        userId: user.uid,
        category: homeCategory,
        amount: parseFloat(homeAmount),
        date: new Date(),
      });
      setHomeAmount("");
      fetchHomeExpenses();
    } catch (error) {
      console.error("Error adding home expense:", error);
    }
  };

  const setHomeUserBudget = async () => {
    if (!user || !homeBudgetAmount || isNaN(homeBudgetAmount) || homeBudgetAmount <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }
    try {
      await setDoc(doc(db, "home_user_budgets", `${user.uid}-${homeBudgetCategory}`), {
        userId: user.uid,
        category: homeBudgetCategory,
        amount: parseFloat(homeBudgetAmount),
      });
      setHomeUserBudgets(prev => ({ ...prev, [homeBudgetCategory]: parseFloat(homeBudgetAmount) }));
      setHomeBudgetAmount("");
    } catch (error) {
      console.error("Error setting home budget:", error);
    }
  };

  const deleteHomeExpense = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "home_expenses", id));
      fetchHomeExpenses();
    } catch (error) {
      console.error("Error deleting home expense:", error);
    }
  };

  // --- Summary Calculations ---
  const getCurrentWeekHomeExpenses = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return homeExpenses.filter(exp => {
      const expenseDate = exp.date.toDate();
      return expenseDate >= startOfWeek && expenseDate <= endOfWeek;
    });
  }, [homeExpenses]);

  const calculateHomeWeeklySummary = useCallback(() => {
    const currentWeekExpenses = getCurrentWeekHomeExpenses();
    const summary = {};
    currentWeekExpenses.forEach(exp => {
      summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
    });
    setHomeWeeklySummary(summary);
  }, [getCurrentWeekHomeExpenses]);

  const getMonthlyHomeExpenses = useCallback(() => {
    return homeExpenses.filter(exp => {
      const expenseDate = exp.date.toDate();
      return expenseDate.getMonth() === homeSelectedMonth && expenseDate.getFullYear() === homeSelectedYear;
    });
  }, [homeExpenses, homeSelectedMonth, homeSelectedYear]);

  const calculateHomeMonthlySummary = useCallback(() => {
    const currentMonthExpenses = getMonthlyHomeExpenses();
    const summary = {};
    currentMonthExpenses.forEach(exp => {
      summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
    });
    setHomeMonthlySummary(summary);
  }, [getMonthlyHomeExpenses]);

  // --- Budget Tracking ---
  const updateHomeBudgetTracking = useCallback(() => {
    const trackingData = homeCategories.map(cat => {
      const budgetedAmount = homeUserBudgets[cat] || 0;
      const spentAmount = homeExpenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0);
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
    setHomeBudgetTrackingData(trackingData);
  }, [homeExpenses, homeUserBudgets]);

  // --- Event Handlers ---
  const handleHomePeriodChange = (event) => {
    setHomeSummaryPeriod(event.target.value);
  };

  const handleHomeMonthChange = (event) => {
    setHomeSelectedMonth(parseInt(event.target.value));
  };

  const handleHomeYearChange = (event) => {
    setHomeSelectedYear(parseInt(event.target.value));
  };

  // --- Effects ---
  useEffect(() => {
    if (user) {
      fetchHomeExpenses();
      fetchHomeUserBudgets();
    }
  }, [user, fetchHomeExpenses, fetchHomeUserBudgets]);

  useEffect(() => {
    updateHomeBudgetTracking();
  }, [homeExpenses, homeUserBudgets, updateHomeBudgetTracking]);

  useEffect(() => {
    if (homeExpenses.length > 0) {
      calculateHomeWeeklySummary();
      calculateHomeMonthlySummary();
    }
  }, [homeExpenses, homeSelectedMonth, homeSelectedYear, calculateHomeWeeklySummary, calculateHomeMonthlySummary]);

  // --- Chart Data Calculation ---
  const homeChartData = homeCategories
    .map(cat => ({
      name: cat,
      value: homeExpenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0),
    }))
    .filter(data => data.value > 0);

  // --- Render ---
  return (
    <div className="expense-planner">
      <Navbar />
      <h2> Home Expense Planner</h2>
      {user ? (
        <>
          {/* Input Section */}
          <div className="input-section">
            <select value={homeCategory} onChange={e => setHomeCategory(e.target.value)}>
              {homeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="number" value={homeAmount} onChange={e => setHomeAmount(e.target.value)} placeholder="Enter amount" />
            <button onClick={addHomeExpense} className="add-btn">Add Expense</button>
          </div>

          {/* Budget Section */}
          <div className="budget-section">
            <h3>Set Budget</h3>
            <select value={homeBudgetCategory} onChange={e => setHomeBudgetCategory(e.target.value)}>
              {homeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="number" value={homeBudgetAmount} onChange={e => setHomeBudgetAmount(e.target.value)} placeholder="Enter budget amount" />
            <button onClick={setHomeUserBudget} className="set-budget-btn">Set Budget</button>
          </div>

          {/* Current Budgets Display */}
          <div className="budget-display">
            <h3>Current Budgets</h3>
            <ul>
              {Object.entries(homeUserBudgets).length > 0 ? (
                Object.entries(homeUserBudgets).map(([cat, amount]) => (
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
            <select value={homeSummaryPeriod} onChange={handleHomePeriodChange}>
              <option value="weekly">This Week</option>
              <option value="monthly">Monthly</option>
            </select>
            {homeSummaryPeriod === 'monthly' && (
              <div>
                <select value={homeSelectedMonth} onChange={handleHomeMonthChange}>
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select value={homeSelectedYear} onChange={handleHomeYearChange}>
                  {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Weekly Summary */}
          {homeSummaryPeriod === 'weekly' && homeWeeklySummary && (
            <div className="summary-section">
              <h3>Weekly Summary</h3>
              {Object.keys(homeWeeklySummary).length > 0 ? (
                <ul>
                  {Object.entries(homeWeeklySummary).map(([category, total]) => (
                    <li key={category}>{category}: ₹{total.toFixed(2)}</li>
                  ))}
                </ul>
              ) : (
                <p>No expenses this week.</p>
              )}
            </div>
          )}

          {/* Monthly Summary */}
          {homeSummaryPeriod === 'monthly' && homeMonthlySummary && (
            <div className="summary-section">
              <h3>Monthly Summary ({months[homeSelectedMonth]} {homeSelectedYear})</h3>
              {Object.keys(homeMonthlySummary).length > 0 ? (
                <ul>
                  {Object.entries(homeMonthlySummary).map(([category, total]) => (
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
            {homeLoading ? (
              <p>Loading expenses...</p>
            ) : homeExpenses.length > 0 ? (
              <ul>
                {homeExpenses.map(expense => (
                  <li key={expense.id}>
                    {expense.category}: ₹{expense.amount} ({format(expense.date.toDate(), 'dd-MMM-yyyy')})
                    <button onClick={() => deleteHomeExpense(expense.id)} className="delete-btn">Delete</button>
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
            {homeBudgetTrackingData.length > 0 ? (
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
                  {homeBudgetTrackingData.map(item => (
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
            {homeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={homeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ name, percent }) => (window.innerWidth > 600 ? `${name} ${(percent * 100).toFixed(0)}%` : null)}
                  >
                    {homeChartData.map((entry, index) => (
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

export default HomeExpensePlanner;