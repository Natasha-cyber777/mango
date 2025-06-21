import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    query,
    where,
    updateDoc
} from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';
import Navbar from "../components/Navbar";
import "../styles/GroupExpenseCalculator.css";

const GroupExpenseCalculator = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [newExpenseDescription, setNewExpenseDescription] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [newExpensePaidBy, setNewExpensePaidBy] = useState('');
    const [newParticipant, setNewParticipant] = useState('');
    const [balances, setBalances] = useState({});
    const [owedAmounts, setOwedAmounts] = useState({});
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');

    const groupExpensesCollectionRef = collection(db, "group_expenses");
    const groupsCollectionRef = collection(db, "groups");

    useEffect(() => {
        if (user) {
            loadUserGroups();
        }
    }, [user]);

    useEffect(() => {
        if (selectedGroup) {
            loadExpenses(selectedGroup.id);
        } else {
            setExpenses([]);
            setParticipants([]);
            setBalances({});
            setOwedAmounts({});
        }
    }, [selectedGroup, user]);

    useEffect(() => {
        setBalances(calculateBalances());
    }, [expenses, participants]);

    useEffect(() => {
        setOwedAmounts(calculateOwedAmounts(balances));
    }, [balances]);

    const loadUserGroups = async () => {
        if (!user) return;
        try {
            const q = query(groupsCollectionRef, where("ownerId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const userGroups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(userGroups);
            if (userGroups.length > 0 && !selectedGroup) {
                setSelectedGroup(userGroups[0]);
            }
        } catch (error) {
            console.error("🔥 Error fetching user groups:", error.message);
        }
    };

    const handleCreateGroup = async () => {
        if (newGroupName && user) {
            try {
                await addDoc(groupsCollectionRef, {
                    name: newGroupName,
                    ownerId: user.uid,
                    createdAt: new Date()
                });
                setNewGroupName('');
                loadUserGroups();
            } catch (error) {
                console.error("🔥 Error creating group:", error.message);
            }
        } else {
            alert('⚠️ Please enter a group name.');
        }
    };

    const loadExpenses = async (groupId) => {
        if (!user || !groupId) return;
        try {
            const q = query(
                groupExpensesCollectionRef,
                where("userId", "==", user.uid),
                where("groupId", "==", groupId)
            );
            const querySnapshot = await getDocs(q);
            const userExpenses = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const timestamp = data.timestamp ? data.timestamp.toDate() : null;
                return {
                    id: doc.id,
                    ...data,
                    timestamp
                };
            });
            setExpenses(userExpenses);
            const uniqueParticipants = [...new Set(userExpenses.map(exp => exp.paidBy))];
            setParticipants(uniqueParticipants);
        } catch (error) {
            console.error("🔥 Error fetching group expenses:", error.message);
        }
    };

    const handleAddParticipant = () => {
        if (newParticipant && !participants.includes(newParticipant)) {
            setParticipants([...participants, newParticipant]);
            setNewParticipant('');
        } else {
            alert('⚠️ Participant already exists or input is empty.');
        }
    };

    const handleAddExpense = async () => {
        if (!selectedGroup) {
            alert("⚠️ Please select a group first.");
            return;
        }
        if (!newExpenseDescription || !newExpenseAmount || isNaN(parseFloat(newExpenseAmount)) || !newExpensePaidBy) {
            alert('⚠️ Please enter a valid expense with payer.');
            return;
        }

        try {
            const docRef = await addDoc(groupExpensesCollectionRef, {
                description: newExpenseDescription,
                amount: parseFloat(newExpenseAmount),
                paidBy: newExpensePaidBy,
                userId: user.uid,
                isSettled: false,
                groupId: selectedGroup.id
            });

            setExpenses([...expenses, {
                id: docRef.id,
                description: newExpenseDescription,
                amount: parseFloat(newExpenseAmount),
                paidBy: newExpensePaidBy,
                isSettled: false
            }]);

            setNewExpenseDescription('');
            setNewExpenseAmount('');
            setNewExpensePaidBy('');
        } catch (error) {
            console.error("🔥 Error adding group expense:", error.message);
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await deleteDoc(doc(db, "group_expenses", id));
            setExpenses(expenses.filter(expense => expense.id !== id));
        } catch (error) {
            console.error("🔥 Error deleting group expense:", error.message);
        }
    };

    const handleMarkPaid = async (debtor, creditor, amount) => {
        const settlementDescription = `${debtor} paid ${creditor} ₹${amount.toFixed(2)}`;
        const newSettlement = {
            id: Date.now().toString(), // Temporary ID for immediate update
            description: settlementDescription,
            amount: amount,
            paidBy: debtor,
            userId: user.uid,
            isSettled: true,
            settles: { debtor, creditor },
            groupId: selectedGroup.id
        };

        // Optimistically update the expenses state
        setExpenses((prevExpenses) => [...prevExpenses, newSettlement]);

        // Optimistically update the owedAmounts state
        setOwedAmounts((prevOwed) => {
            const updatedOwed = { ...prevOwed };
            if (updatedOwed[debtor] && updatedOwed[debtor][creditor]) {
                updatedOwed[debtor][creditor] -= amount;
                if (updatedOwed[debtor][creditor] < 1e-6) { // Use tolerance for floating point
                    delete updatedOwed[debtor][creditor];
                    if (Object.keys(updatedOwed[debtor]).length === 0) {
                        delete updatedOwed[debtor];
                    }
                }
            }
            return updatedOwed;
        });

        try {
            // Update Firestore in the background
            await addDoc(groupExpensesCollectionRef, {
                description: settlementDescription,
                amount: amount,
                paidBy: debtor,
                userId: user.uid,
                isSettled: true,
                settles: { debtor, creditor },
                groupId: selectedGroup.id
            });

            // Optionally, you can reload expenses after a short delay to ensure consistency
            // setTimeout(loadExpenses, 500);
        } catch (error) {
            console.error("🔥 Error marking as paid:", error.message);
            // If the Firestore update fails, you might want to revert the optimistic update
            setExpenses((prevExpenses) => prevExpenses.filter(exp => exp.id !== newSettlement.id));
            // You might also need to recalculate owedAmounts from the previous balances state
            setOwedAmounts(calculateOwedAmounts(calculateBalances(expenses.filter(exp => exp.id !== newSettlement.id))));
        }
    };

    const calculateBalances = () => {
        const balances = participants.reduce((acc, person) => ({ ...acc, [person]: 0 }), {});
        const numParticipants = participants.length;

        expenses.forEach(expense => {
            if (!expense.isSettled) {
                const amountPerPerson = expense.amount / numParticipants;
                balances[expense.paidBy] += expense.amount - amountPerPerson;
                participants.forEach(person => {
                    if (person !== expense.paidBy) {
                        balances[person] -= amountPerPerson;
                    }
                });
            } else if (expense.settles) {
                balances[expense.settles.debtor] += expense.amount;
                balances[expense.settles.creditor] -= expense.amount;
            }
        });

        return balances;
    };

    const calculateOwedAmounts = (currentBalances) => {
        const owed = {};
        const sortedBalances = Object.entries(currentBalances).sort(([, a], [, b]) => a - b); // Sort by balance, ascending

        let i = 0;
        let j = sortedBalances.length - 1;

        while (i < j) {
            let debtor = sortedBalances[i][0];
            let debtorBalance = sortedBalances[i][1];
            let creditor = sortedBalances[j][0];
            let creditorBalance = sortedBalances[j][1];

            if (Math.abs(debtorBalance) < 1e-6) { // Use a small tolerance for floating-point comparisons
                i++;
                continue;
            }
            if (creditorBalance < 1e-6) {
                j--;
                continue;
            }

            const amountToSettle = Math.min(Math.abs(debtorBalance), creditorBalance);

            if (!owed[debtor]) {
                owed[debtor] = {};
            }
            owed[debtor][creditor] = (owed[debtor][creditor] || 0) + amountToSettle;

            sortedBalances[i][1] += amountToSettle;
            sortedBalances[j][1] -= amountToSettle;

            if (Math.abs(sortedBalances[i][1]) < 1e-6) {
                i++;
            }
            if (Math.abs(sortedBalances[j][1]) < 1e-6) {
                j--;
            }
        }
        return owed;
    };

    return (
        <div className="group-expense-calculator">
            <Navbar />
            <h2>Group Expense Calculator</h2>

            <div className="group-management-section">
                <h3>Select Group</h3>
                <select
                    value={selectedGroup?.id || ""}
                    onChange={(e) => {
                        const foundGroup = groups.find(g => g.id === e.target.value);
                        setSelectedGroup(foundGroup || null);
                    }}
                    className="select-field"
                >
                    <option value="">Select a Group</option>
                    {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>

                <h3>Create New Group</h3>
                <div className="add-group">
                    <input
                        type="text"
                        placeholder="Group Name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleCreateGroup} className="add-btn">Create Group</button>
                </div>
            </div>

            {selectedGroup ? (
                <>
                    <h3>Current Group: {selectedGroup.name}</h3>
                    <div className="participants-section">
                        <h3>Participants</h3>
                        <ul>
                            {participants.map(participant => (
                                <li key={participant}>{participant}</li>
                            ))}
                        </ul>
                        <div className="add-participant">
                            <input
                                type="text"
                                placeholder="Add Participant"
                                value={newParticipant}
                                onChange={(e) => setNewParticipant(e.target.value)}
                                className="input-field"
                            />
                            <button onClick={handleAddParticipant} className="add-btn">Add</button>
                        </div>
                    </div>

                    <div className="add-expense-section">
                        <h3>Add New Expense</h3>
                        <div className="form-group">
                            <label>Describe:</label>
                            <input
                                type="text"
                                placeholder="Description"
                                value={newExpenseDescription}
                                onChange={(e) => setNewExpenseDescription(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Amount:</label>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newExpenseAmount}
                                onChange={(e) => setNewExpenseAmount(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Paid By:</label>
                            <select
                                value={newExpensePaidBy}
                                onChange={(e) => setNewExpensePaidBy(e.target.value)}
                                className="select-field"
                            >
                                <option value="">Select Payer</option>
                                {participants.map(person => (
                                    <option key={person} value={person}>{person}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleAddExpense} className="add-btn">Add Expense</button>
                    </div>

                    <div className="expenses-list-section">
                        <h3>Expenses</h3>
                        {expenses.length === 0 ? (
                            <p>No expenses added yet for this group.</p>
                        ) : (
                            <ul>
                                {expenses.map((expense) => (
                                    <li key={expense.id}>
                                        <span>{expense.description}: ₹{expense.amount.toFixed(2)} paid by {expense.paidBy}</span>
                                        <button onClick={() => handleDeleteExpense(expense.id)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="balances-section">
                        <h3>Balances</h3>
                        {Object.entries(balances).map(([person, balance]) => (
                            <p key={person}>
                                {person}: ₹{balance.toFixed(2)} {balance > 0 ? ' owes' : balance < 0 ? ' is owed' : ''}
                            </p>
                        ))}

                        <h3>Who Owes Whom</h3>
                        {Object.entries(owedAmounts).length === 0 ? (
                            <p>All settled up for this group!</p>
                        ) : (
                            Object.entries(owedAmounts).map(([debtor, creditors]) => (
                                <div key={debtor}>
                                    <p>{debtor} needs to pay:</p>
                                    <ul>
                                        {Object.entries(creditors).map(([creditor, amount]) => (
                                            <li key={`${debtor}-owes-${creditor}`}>
                                                ₹{amount.toFixed(2)} to {creditor}
                                                <button onClick={() => handleMarkPaid(debtor, creditor, amount)}>Mark Paid</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                user && groups.length > 0 ? (
                    <p>Please select a group to manage expenses.</p>
                ) : user ? (
                    <p>No groups created yet. Create your first group above!</p>
                ) : (
                    <p>Please log in to manage groups and expenses.</p>
                )
            )}
        </div>
    );
};

export default GroupExpenseCalculator;

