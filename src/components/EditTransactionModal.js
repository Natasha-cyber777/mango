import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './EditTransactionModal.css';

const EditTransactionModal = ({ transaction, onClose, onUpdate }) => {
    const [amount, setAmount] = useState(transaction?.amount || '');
    const [description, setDescription] = useState(transaction?.description || '');
    const [type, setType] = useState(transaction?.type || 'Expense');
    const [category, setCategory] = useState(transaction?.category || '');
    const [date, setDate] = useState(transaction?.date || '');

    const handleSave = async () => {
        if (!amount || !description) {
            alert('Amount and Description are required!');
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                const transactionRef = doc(db, `users/${user.uid}/transactions`, transaction.id);
                await updateDoc(transactionRef, {
                    amount: parseFloat(amount),
                    description,
                    type,
                    category,
                    date,
                    updatedAt: new Date(),
                });

                // ✅ Update state after successful update
                onUpdate({
                    ...transaction,
                    amount: parseFloat(amount),
                    description,
                    type,
                    category,
                    date,
                    updatedAt: new Date(),
                });
            }
            onClose();
        } catch (error) {
            console.error('Error updating transaction:', error.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit Transaction</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        required
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        required
                    />
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="Expense">Expense</option>
                        <option value="Income">Income</option>
                    </select>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Category"
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <div className="modal-actions">
                        <button type="button" onClick={handleSave} className="save-btn">
                            Save
                        </button>
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTransactionModal;
