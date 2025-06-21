import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import BudgetingPage from './pages/BudgetingPage';
import FinancialPersonalityProfiler from './pages/FinancialPersonalityProfiler';
import StudentExpensePlanner from './pages/StudentExpensePlanner';
import HomeExpensePlanner from './pages/HomeExpensePlanner';
import LoadingPage from './components/LoadingPage';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import GroupExpenseCalculator from './pages/GroupExpenseCalculator';
import IncomeProfile from './pages/IncomeProfile';
import SavingsProfile from './pages/SavingsProfile';
import InvestmentProfile from './pages/InvestmentProfile';
import UserProfilePage from './pages/UserProfilePage';
import DebtProfile from './pages/DebtProfile';
import SpecialPlannerPage from './pages/SpecialPlannerPage';
import Chatbot from './components/Chatbot'; // Import the Chatbot component
import './App.css'; // Ensure you have App.css for global styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import BudgetAnomaliesPage from './pages/BudgetAnomaliesPage';
import AIBudgetPage from './pages/AIBudgetPage';
function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

function AppContent() {
    const location = useLocation();
    const excludedPaths = ['/', '/login', '/signup'];
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const { user } = useAuth(); // Get the user object from the AuthContext

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
    };

    // Effect to scroll to top on route change (optional, but good for SPA behavior)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="app-container">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/budgetingpage" element={<RequireAuth><BudgetingPage /></RequireAuth>} />
                <Route path="/report" element={<RequireAuth><Report /></RequireAuth>} />
                <Route path="/financialpersonalityprofiler" element={<RequireAuth><FinancialPersonalityProfiler /></RequireAuth>} />
                <Route path="/studentexpenseplanner" element={<RequireAuth><StudentExpensePlanner /></RequireAuth>} />
                <Route path="/homexpenseplanner" element={<RequireAuth><HomeExpensePlanner /></RequireAuth>} />
                <Route path="/groupexpensecalculator" element={<RequireAuth><GroupExpenseCalculator /></RequireAuth>} />
                <Route path="/incomeprofile" element={<RequireAuth><IncomeProfile /></RequireAuth>} />
                <Route path="/savingsprofile" element={<RequireAuth><SavingsProfile /></RequireAuth>} />
                <Route path="/debtprofile" element={<RequireAuth><DebtProfile /></RequireAuth>} />
                <Route path="/investmentprofile" element={<RequireAuth><InvestmentProfile /></RequireAuth>} />
                <Route path="/userprofilepage" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
                <Route path="/specialplannerpage" element={<RequireAuth><SpecialPlannerPage /></RequireAuth>} />
                <Route path="/budgetanomaliespage" element={<RequireAuth><BudgetAnomaliesPage /></RequireAuth>} />
                <Route path="/aibudgetpage" element={<RequireAuth><AIBudgetPage /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {!excludedPaths.includes(location.pathname) && user && ( // ✅ Only show chatbot if user is authenticated
                <div className="chatbot-icon-container">
                    <button className="chatbot-icon" onClick={toggleChatbot}>
                        <FontAwesomeIcon icon={faCommentDots} />
                    </button>
                    {isChatbotOpen && 
                    <Chatbot
                    currentPage={location.pathname}
                    userId={user.uid}
                    // Pass other relevant data if needed, e.g., budgetId, transactionId
                />}
                </div>
            )}
        </div>
    );
}

// 🔒 Protect routes that require authentication
function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingPage />; // Show a spinner or loading screen
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default App;