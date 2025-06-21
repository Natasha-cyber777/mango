import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const TransactionForm = ({ fetchTransactions }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !description) return;

    try {
      await addDoc(collection(db, 'transactions'), {
        amount: Number(amount),
        type,
        description,
        timestamp: serverTimestamp(),
      });

      fetchTransactions(); // Refresh transaction list
      setAmount('');
      setType('expense');
      setDescription('');
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        required
        style={styles.input}
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
        style={styles.input}
      />
      <select value={type} onChange={(e) => setType(e.target.value)} style={styles.input}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <button type="submit" style={styles.button}>Add Transaction</button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default TransactionForm;
