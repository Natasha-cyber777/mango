// CreatePlannerModal.js
import React, { useState, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust the path to your AuthContext
import './CreatePlannerModal.css';

function CreatePlannerModal({ onClose, onPlannerCreated }) {
  const [plannerName, setPlannerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { auth } = useContext(useAuth); // Assuming you have an AuthContext

  const handleInputChange = (event) => {
    setPlannerName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('/createSpecialPlanner', { // Use the correct Cloud Function URL if different
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plannerName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData?.error || 'Failed to create planner'}`);
      }

      const newPlanner = await response.json();
      onPlannerCreated(newPlanner);
      onClose();
      setLoading(false);
    } catch (error) {
      console.error('Error creating planner:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="create-planner-modal">
      <h3>Create New Planner</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="plannerName">Planner Name:</label>
          <input
            type="text"
            id="plannerName"
            value={plannerName}
            onChange={handleInputChange}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="modal-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePlannerModal;