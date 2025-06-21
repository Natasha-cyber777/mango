import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    orderBy,
} from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useAuth } from '../contexts/AuthContext';
import Navbar from "../components/Navbar";
import "../styles/SpecialPlannerPage.css";

const SP_COLORS = ["#2E86C1", "#1E8449", "#D4AC0D", "#CB4335", "#8E44AD", "#F39C12", "#7D3C98"];

const SpecialPlannerPage = () => {
    const { auth } = useAuth();
    const [fields, setFields] = useState([]);
    const [newField, setNewField] = useState("");
    const [items, setItems] = useState([]);
    const [newItemCategory, setNewItemCategory] = useState("");
    const [newItemAmount, setNewItemAmount] = useState("");
    const [newItemDate, setNewItemDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [budgets, setBudgets] = useState({});
    const [budgetCategory, setBudgetCategory] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // --- Fetch Data ---
    const fetchFields = useCallback(async () => {
        if (!auth?.currentUser) return;
        try {
            const q = query(collection(db, "sp_fields"), where("userId", "==", auth.currentUser.uid));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setFields(data.map(f => f.name));
            if (data.length > 0 && !newItemCategory) {
                setNewItemCategory(data[0].name);
                setBudgetCategory(data[0].name);
            }
        } catch (err) {
            console.error("Error fetching fields:", err);
            setError("Failed to load fields.");
        }
    }, [auth, setNewItemCategory, setBudgetCategory]);

    const fetchItems = useCallback(async () => {
        if (!auth?.currentUser) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "sp_items"),
                where("userId", "==", auth.currentUser.uid),
                orderBy("date", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data()?.date?.toDate() }));
            setItems(data);
        } catch (err) {
            console.error("Error fetching items:", err);
            setError("Failed to load items.");
        } finally {
            setLoading(false);
        }
    }, [auth]);

    const fetchBudgets = useCallback(async () => {
        if (!auth?.currentUser) return;
        try {
            const q = query(collection(db, "sp_budgets"), where("userId", "==", auth.currentUser.uid));
            const snapshot = await getDocs(q);
            const data = {};
            snapshot.docs.forEach(doc => {
                data[doc.data().category] = doc.data().amount;
            });
            setBudgets(data);
        } catch (err) {
            console.error("Error fetching budgets:", err);
            setError("Failed to load budgets.");
        }
    }, [auth]);

    useEffect(() => {
        if (auth?.currentUser) {
            fetchFields();
            fetchItems();
            fetchBudgets();
        }
    }, [auth, fetchFields, fetchItems, fetchBudgets]);

    // --- Add New Field ---
    const handleAddField = async () => {
        if (!auth?.currentUser || !newField.trim()) return;
        try {
            const docRef = await addDoc(collection(db, "sp_fields"), {
                userId: auth.currentUser.uid,
                name: newField.trim(),
            });
            console.log("Field added with ID: ", docRef.id);
            setNewField("");
            fetchFields();
        } catch (error) {
            console.error("Error adding field:", error);
            setError("Failed to add field.");
        }
    };

    // --- Add New Item ---
    const handleAddItem = async () => {
        if (!auth?.currentUser || !newItemCategory || !newItemAmount) return;
        try {
            await addDoc(collection(db, "sp_items"), {
                userId: auth.currentUser.uid,
                category: newItemCategory,
                amount: parseFloat(newItemAmount),
                date: new Date(newItemDate),
            });
            setNewItemCategory(fields[0] || "");
            setNewItemAmount("");
            fetchItems();
        } catch (error) {
            console.error("Error adding item:", error);
            setError("Failed to add item.");
        }
    };

    // --- Set Budget ---
    const handleSetBudget = async () => {
        if (!auth?.currentUser || !budgetCategory || !budgetAmount) return;
        try {
            const q = query(
                collection(db, "sp_budgets"),
                where("userId", "==", auth.currentUser.uid),
                where("category", "==", budgetCategory)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const docId = snapshot.docs[0].id;
                await setDoc(doc(db, "sp_budgets", docId), {
                    amount: parseFloat(budgetAmount),
                });
            } else {
                await addDoc(collection(db, "sp_budgets"), {
                    userId: auth.currentUser.uid,
                    category: budgetCategory,
                    amount: parseFloat(budgetAmount),
                });
            }
            setBudgetCategory(fields[0] || "");
            setBudgetAmount("");
            fetchBudgets();
        } catch (error) {
            console.error("Error setting budget:", error);
            setError("Failed to set budget.");
        }
    };

    // --- Filter Items by Month/Year ---
    const filteredItems = useCallback(() => {
        return items.filter(item => {
            const itemDate = item.date;
            return (
                itemDate?.getMonth() === selectedMonth && itemDate?.getFullYear() === selectedYear
            );
        });
    }, [items, selectedMonth, selectedYear]);

    // --- Calculate Summary ---
    const summary = useCallback(() => {
        const monthlyItems = filteredItems();
        return monthlyItems.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
            return acc;
        }, {});
    }, [filteredItems]);

    // --- Calculate Budget vs Expenses ---
    const budgetVsExpenses = useCallback(() => {
        const data = [];
        fields.forEach(field => {
            const budgeted = budgets[field] || 0;
            const spent = filteredItems().reduce((sum, item) => {
                return item.category === field ? sum + item.amount : sum;
            }, 0);
            const remaining = budgeted - spent;
            const percentageSpent = budgeted > 0 ? (spent / budgeted) * 100 : 0;
            data.push({ category: field, budgeted, spent, remaining, percentageSpent });
        });
        return data;
    }, [fields, budgets, filteredItems]);

    // --- Prepare Chart Data ---
    const chartData = useCallback(() => {
        const monthlySummary = summary();
        return Object.entries(monthlySummary).map(([category, amount]) => ({
            name: category,
            value: amount,
        }));
    }, [summary]);

    // --- Event Handlers ---
    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value));
    };

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
    };

    return (
        <div className="special-planner-page-container"> {/* Changed class name here */}
            <Navbar />
            <h2>Special Planner</h2>

            {error && <div className="error-message">Error: {error}</div>}
            {loading && <div>Loading...</div>}

            {auth?.currentUser && (
                <>
                    {/* Add New Field */}
                    <div className="add-field-section">
                        <h3>Add New Category</h3>
                        <input
                            type="text"
                            value={newField}
                            onChange={(e) => setNewField(e.target.value)}
                            placeholder="Category Name"
                        />
                        <button onClick={handleAddField}>Add Category</button>
                    </div>

                    {/* Add New Item */}
                    <div className="add-item-section">
                        <h3>Add New Item</h3>
                        <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)}>
                            {fields.map((field) => (
                                <option key={field} value={field}>
                                    {field}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={newItemAmount}
                            onChange={(e) => setNewItemAmount(e.target.value)}
                            placeholder="Amount"
                        />
                        <input
                            type="date"
                            value={newItemDate}
                            onChange={(e) => setNewItemDate(e.target.value)}
                        />
                        <button onClick={handleAddItem}>Add Item</button>
                    </div>

                    {/* Set Budget */}
                    <div className="set-budget-section">
                        <h3>Set Budget</h3>
                        <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)}>
                            {fields.map((field) => (
                                <option key={field} value={field}>
                                    {field}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            placeholder="Budget Amount"
                        />
                        <button onClick={handleSetBudget}>Set Budget</button>
                    </div>

                    {/* Current Budgets */}
                    <div className="current-budgets-section">
                        <h3>Current Budgets</h3>
                        <ul>
                            {Object.entries(budgets).map(([category, amount]) => (
                                <li key={category}>
                                    {category}: ₹{amount}
                                </li>
                            ))}
                        </ul>
                        {Object.keys(budgets).length === 0 && <p>No budgets set yet.</p>}
                    </div>

                    {/* Summary Filters */}
                    <div className="summary-filter-section">
                        <h3>Filter Summary By</h3>
                        <select value={selectedMonth} onChange={handleMonthChange}>
                            {new Array(12).fill(null).map((_, index) => (
                                <option key={index} value={index}>
                                    {new Date(0, index, 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select value={selectedYear} onChange={handleYearChange}>
                            {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - 2 + index).map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Summary */}
                    <div className="summary-section">
                        <h3>Monthly Summary ({new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long' })} {selectedYear})</h3>
                        <ul>
                            {Object.entries(summary()).map(([category, total]) => (
                                <li key={category}>
                                    {category}: ₹{total.toFixed(2)}
                                </li>
                            ))}
                        </ul>
                        {Object.keys(summary()).length === 0 && <p>No items for this period.</p>}
                    </div>

                    {/* Budget vs Expenses Table */}
                    <div className="budget-vs-expenses-section">
                        <h3>Budget vs Expenses</h3>
                        {budgetVsExpenses().length > 0 ? (
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
                                    {budgetVsExpenses().map((item) => (
                                        <tr key={item.category}>
                                            <td>{item.category}</td>
                                            <td>₹{item.budgeted.toFixed(2)}</td>
                                            <td>₹{item.spent.toFixed(2)}</td>
                                            <td className={item.remaining < 0 ? 'over-budget' : ''}>
                                                ₹{item.remaining.toFixed(2)}
                                            </td>
                                            <td className={item.percentageSpent > 100 ? 'over-budget' : ''}>
                                                {item.percentageSpent.toFixed(0)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No budget or expense data to display.</p>
                        )}
                    </div>

                    {/* Expense Breakdown Pie Chart */}
                    <div className="chart-section">
                        <h3>Expense Breakdown</h3>
                        {chartData().length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData()}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        nameKey="name"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            window.innerWidth > 600 ? `${name} ${(percent * 100).toFixed(0)}%` : null
                                        }
                                    >
                                        {chartData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={SP_COLORS[index % SP_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                    <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No expense data to display in the chart for the selected period.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SpecialPlannerPage;