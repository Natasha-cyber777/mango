// PlannerDetails.js
import React from 'react';

function PlannerDetails({ selectedPlanner }) {
  if (!selectedPlanner) {
    return <div>Please select a planner.</div>;
  }

  return (
    <div>
      <h3>{selectedPlanner.plannerName}</h3>
      {/* More details and functionality will be added here */}
    </div>
  );
}

export default PlannerDetails;