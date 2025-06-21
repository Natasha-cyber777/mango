import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'transactions'));
      const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(items);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div style={styles.container}>
      <h3>Transactions</h3>
      {transactions.map((transaction) => (
        <div key={transaction.id} style={styles.transaction}>
          <p>{transaction.description}</p>
          <p style={{ color: transaction.type === 'income' ? 'green' : 'red' }}>
            {transaction.type === 'income' ? '+' : '-'} ₹{transaction.amount}
          </p>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
  },
  transaction: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
};

export default TransactionList;
