// UserProfilePage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import "../styles/UserProfilePage.css";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Navbar from '../components/Navbar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#a98ff3']; // Extended colors

function UserProfilePage() {
    const { userProfile } = useAuth();

    const calculateTotalIncome = () => {
        return userProfile?.incomeSources?.reduce((sum, source) => sum + (source.amount || 0), 0) || 0;
    };

    const calculateTotalSavings = () => {
        return userProfile?.savingsAccounts?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;
    };

    const calculateTotalInvestmentValue = () => {
        return userProfile?.investments?.reduce((sum, investment) => sum + (investment.currentValue || 0), 0) || 0;
    };

    const calculateTotalDebt = () => {
        return userProfile?.debts?.reduce((sum, debt) => sum + (debt.balance || 0), 0) || 0;
    };

    const getPersonalityType = () => {
        return userProfile?.financialPersonality || 'Not yet determined';
    };

    const calculateNetWorth = () => {
        const savings = calculateTotalSavings();
        const investments = calculateTotalInvestmentValue();
        const debt = calculateTotalDebt();
        return savings + investments - debt;
    };

    const calculateSavingsRate = () => {
        const totalIncome = calculateTotalIncome();
        const totalSavings = calculateTotalSavings();
        if (totalIncome > 0) {
            return ((totalSavings / totalIncome) * 100).toFixed(2);
        }
        return 'N/A';
    };

    const calculateDebtToIncomeRatio = () => {
        const totalIncome = calculateTotalIncome();
        const totalDebt = calculateTotalDebt();
        if (totalIncome > 0) {
            return ((totalDebt / totalIncome) * 100).toFixed(2);
        }
        return 'N/A';
    };

    // Income Breakdown Data for Pie Chart
    const incomeData = userProfile?.incomeSources?.map(source => ({
        name: source.name,
        value: source.amount,
    })) || [];

    // Savings Goals Data for Bar Chart
    const savingsGoalData = userProfile?.savingsGoals?.map(goal => ({
        name: goal.name,
        saved: goal.currentAmount || 0,
        target: goal.targetAmount || 0,
    })) || [];

    // Investment Portfolio Breakdown Data for Pie Chart
    const investmentData = () => {
        if (userProfile?.investments) {
            const portfolio = {};
            userProfile.investments.forEach(investment => {
                const type = investment.type || 'Other';
                portfolio[type] = (portfolio[type] || 0) + (investment.currentValue || 0);
            });
            return Object.keys(portfolio).map(key => ({ name: key, value: portfolio[key] }));
        }
        return [];
    };

    // Personalized Insights
    const getFinancialInsight = () => {
        const savingsRate = parseFloat(calculateSavingsRate());
        const debtToIncome = parseFloat(calculateDebtToIncomeRatio());
        const netWorth = calculateNetWorth();

        let insights = [];

        if (!isNaN(savingsRate)) {
            if (savingsRate < 10) {
                insights.push("Your savings rate is quite low. Consider creating a budget to identify areas for potential savings.");
            } else if (savingsRate < 20) {
                insights.push("Aim to increase your savings rate to reach your financial goals more quickly.");
            } else {
                insights.push("Excellent savings habits! Keep up the great work.");
            }
        }

        if (!isNaN(debtToIncome)) {
            if (debtToIncome > 50) {
                insights.push("Your debt-to-income ratio is high. Explore strategies for debt reduction.");
            } else if (debtToIncome > 30) {
                insights.push("Consider focusing on paying down your debt to improve your financial flexibility.");
            } else {
                insights.push("Your debt level appears to be well-managed.");
            }
        }

        if (netWorth < 0) {
            insights.push("Your net worth is currently negative. Focus on reducing debt and increasing assets.");
        } else if (netWorth < calculateTotalAnnualExpenses() * 3) { // Basic emergency fund guideline
            insights.push("Consider building an emergency fund to cover at least 3-6 months of living expenses.");
        }

        return insights.length > 0 ? insights.join(" ") : "No specific insights at this time.";
    };

    const calculateTotalAnnualExpenses = () => {
        // This is a placeholder - you'd need to implement expense tracking
        return 0;
    };

    return (
        <div className="user-profile-page-container">
            <Navbar />
            <h2>Your Financial Overview</h2>

            <div className="profile-section">
                <h3>Financial Personality</h3>
                <p>Your current financial personality type: <strong>{getPersonalityType()}</strong></p>
                <Link to="/financialpersonalityprofiler" className="action-link">Review/Update Your Profile</Link>
            </div>

            <div className="profile-section">
                <h3>Financial Summary</h3>
                <p><strong>Estimated Net Worth: ₹{calculateNetWorth().toFixed(2)}</strong></p>
            </div>

            <div className="profile-section">
                <h3>Income Overview</h3>
                <p>Total Annual Income: <strong>₹{calculateTotalIncome().toFixed(2)}</strong></p>
                <h4>Income Breakdown</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={incomeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label
                        >
                            {incomeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} labelFormatter={() => "Amount"} />
                    </PieChart>
                </ResponsiveContainer>
                <Link to="/incomeprofile" className="action-link">Manage Income Sources</Link>
            </div>

            <div className="profile-section">
                <h3>Savings Overview</h3>
                <p>Total Savings: <strong>₹{calculateTotalSavings().toFixed(2)}</strong></p>
                <h4>Savings Goal Progress</h4>
                {savingsGoalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={savingsGoalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                            <Bar dataKey="saved" fill="#2ecc71" name="Saved" />
                            <Bar dataKey="target" fill="#3498db" name="Target" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p>No savings goals recorded yet. <Link to="/savingsprofile" className="action-link">Add a Goal</Link></p>
                )}
                <Link to="/savingsprofile" className="action-link">Manage Savings & Goals</Link>
            </div>

            <div className="profile-section">
                <h3>Investment Overview</h3>
                <p>Total Investment Value: <strong>₹{calculateTotalInvestmentValue().toFixed(2)}</strong></p>
                <h4>Portfolio Breakdown</h4>
                {investmentData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={investmentData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label
                            >
                                {investmentData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} labelFormatter={() => "Value"} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p>No investments recorded yet. <Link to="/investmentprofile" className="action-link">Add Investment</Link></p>
                )}
                <Link to="/investmentprofile" className="action-link">Manage Investments</Link>
            </div>

            <div className="profile-section">
                <h3>Debt Overview</h3>
                <p>Total Outstanding Debt: <strong>₹{calculateTotalDebt().toFixed(2)}</strong></p>
                <Link to="/debtprofile" className="action-link">Manage Your Debts</Link>
            </div>

            <div className="profile-section">
                <h3>Key Metrics</h3>
                <p><strong>Savings Rate: {calculateSavingsRate()}%</strong> (Total Savings / Total Income)</p>
                <p><strong>Debt-to-Income Ratio: {calculateDebtToIncomeRatio()}%</strong> (Total Debt / Total Income)</p>
                {/* Add more key metrics here as needed */}
            </div>

            <div className="profile-section">
                <h3>Personalized Insights</h3>
                <p>{getFinancialInsight()}</p>
            </div>

        </div>
    );
}

export default UserProfilePage;