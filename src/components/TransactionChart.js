import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import './TransactionChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TransactionChart = ({ transactions }) => {
  const categories = ['Income', 'Expense', 'Savings'];
  const data = categories.map(category =>
    transactions
      .filter(transaction => transaction.type === category)
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  );

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Amount (₹)',
        data,
        backgroundColor: [
          '#76ff03', // Income color
          '#ff4d4d', // Expense color
          '#FFC107', // Savings color
        ],
        borderColor: [
          '#388E3C',
          '#D32F2F',
          '#FFA000',
        ],
        borderWidth: 2,
        borderRadius: 8, // More rounded corners
        barPercentage: 0.5,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: 'Arial',
          },
          color: '#bbb', // Updated to match dark theme
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#000',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 14,
            family: 'Arial',
          },
          color: '#bbb', // Updated to match dark theme
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          stepSize: 500,
          font: {
            size: 14,
            family: 'Arial',
          },
          color: '#bbb',
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TransactionChart;
