import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navbar.css';
import mangoLogo from '../../src/images/mango-logo.png';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPlannerDropdownOpen, setIsPlannerDropdownOpen] = useState(false);
    const [isUserProfileDropdownOpen, setIsUserProfileDropdownOpen] = useState(false);
    const [isAIToolsDropdownOpen, setIsAIToolsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/'); // Redirect to homepage after logout
        } catch (error) {
            console.error('Logout error:', error.message);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const togglePlannerDropdown = () => {
        setIsPlannerDropdownOpen(!isPlannerDropdownOpen);
    };

    const toggleUserProfileDropdown = () => {
        setIsUserProfileDropdownOpen(!isUserProfileDropdownOpen);
    };
    const toggleAIToolsDropdown = () => {
        setIsAIToolsDropdownOpen(!isAIToolsDropdownOpen);
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand" onClick={() => navigate('/')}>
                <img src={mangoLogo} alt="Mango Logo" className="logo-image" />
                Mango
            </div>
            <button className="hamburger-menu" onClick={toggleMenu}>
                ☰
            </button>
            <div className={`nav-links-mobile ${isMenuOpen ? 'active' : ''}`}>
                <span className="link" onClick={() => navigate('/dashboard')}>
                    Dashboard
                </span>
                <span className="link" onClick={() => navigate('/report')}>
                    Report
                </span>
                <span className="link" onClick={() => navigate('/budgetingpage')}>
                    Budget
                </span>
                <div className="dropdown-mobile">
                    <span className="link" onClick={toggleUserProfileDropdown}>
                        Profile
                    </span>
                    {isUserProfileDropdownOpen && (
                        <div className="dropdown-content-mobile">
                            <span className="link" onClick={() => navigate('/financialpersonalityprofiler')}>
                                Personality
                            </span>
                            <span className="link" onClick={() => navigate('/incomeprofile')}>
                                Income
                            </span>
                            <span className="link" onClick={() => navigate('/savingsprofile')}>
                                Savings
                            </span>
                            <span className="link" onClick={() => navigate('/investmentprofile')}>
                                Investments
                            </span>
                            <span className="link" onClick={() => navigate('/debtprofile')}>
                                Debts
                            </span>
                            <span className="link" onClick={() => navigate('/userprofilepage')}>
                                Overview
                            </span>
                        </div>
                    )}
                </div>
                <span className="link" onClick={() => navigate('/groupexpensecalculator')}>
                    Groups
                </span>
                <div className="dropdown-mobile">
                    <span className="link" onClick={togglePlannerDropdown}>
                        Planner
                    </span>
                    {isPlannerDropdownOpen && (
                        <div className="dropdown-content-mobile">
                            <span className="link" onClick={() => navigate('/studentexpenseplanner')}>
                                Student Planner
                            </span>
                            <span className="link" onClick={() => navigate('/homexpenseplanner')}>
                                Home Planner
                            </span>
                            <span className="link" onClick={() => navigate('/specialplannerpage')}>
                                Special Planner
                            </span>
                        </div>
                    )}
                </div>
                <div className="dropdown-mobile">
                    <span className="link" onClick={toggleAIToolsDropdown}>
                        AI Tools
                    </span>
                    {isAIToolsDropdownOpen && (
                        <div className="dropdown-content-mobile">
                            <span className="link" onClick={() => navigate('/budgetanomaliespage')}>
                                Budget Anomalies
                            </span>
                            <span className="link" onClick={() => navigate('/aibudgetpage')}>
                                AI Budget
                            </span>
                        </div>
                    )}
                </div>
                <span className="link" onClick={handleLogout}>
                    Logout
                </span>
            </div>
            <div className="nav-links">
                <span className="link" onClick={() => navigate('/dashboard')}>
                    Dashboard
                </span>
                <span className="link" onClick={() => navigate('/report')}>
                    Report
                </span>
                <span className="link" onClick={() => navigate('/budgetingpage')}>
                    Budget
                </span>
                <div className="dropdown" onMouseEnter={() => setIsUserProfileDropdownOpen(true)} onMouseLeave={() => setIsUserProfileDropdownOpen(false)}>
                    <span className="link dropdown-button" onClick={toggleUserProfileDropdown}>
                        Profile
                    </span>
                    <div className={`dropdown-content ${isUserProfileDropdownOpen ? 'show' : ''}`}>
                        <span className="link" onClick={() => navigate('/financialpersonalityprofiler')}>
                            Personality
                        </span>
                        <span className="link" onClick={() => navigate('/incomeprofile')}>
                            Income
                        </span>
                        <span className="link" onClick={() => navigate('/savingsprofile')}>
                            Savings
                        </span>
                        <span className="link" onClick={() => navigate('/investmentprofile')}>
                            Investments
                        </span>
                        <span className="link" onClick={() => navigate('/debtprofile')}>
                            Debts
                        </span>
                        <span className="link" onClick={() => navigate('/userprofilepage')}>
                            Overview
                        </span>
                    </div>
                </div>
                <span className="link" onClick={() => navigate('/groupexpensecalculator')}>
                    Groups
                </span>
                <div className="dropdown" onMouseEnter={() => setIsPlannerDropdownOpen(true)} onMouseLeave={() => setIsPlannerDropdownOpen(false)}>
                    <span className="link dropdown-button" onClick={togglePlannerDropdown}>
                        Planner
                    </span>
                    <div className={`dropdown-content ${isPlannerDropdownOpen ? 'show' : ''}`}>
                        <span className="link" onClick={() => navigate('/studentexpenseplanner')}>
                            Student Planner
                        </span>
                        <span className="link" onClick={() => navigate('/homexpenseplanner')}>
                            Home Planner
                        </span>
                        <span className="link" onClick={() => navigate('/specialplannerpage')}>
                            Special Planner
                        </span>
                    </div>
                </div>
                {/* AI Tools Dropdown for Desktop */}
                <div className="dropdown" onMouseEnter={() => setIsAIToolsDropdownOpen(true)} onMouseLeave={() => setIsAIToolsDropdownOpen(false)}>
                    <span className="link dropdown-button" onClick={toggleAIToolsDropdown}>
                        AI Tools
                    </span>
                    <div className={`dropdown-content ${isAIToolsDropdownOpen ? 'show' : ''}`}>
                        <span className="link" onClick={() => navigate('/budgetanomaliespage')}>
                            Budget Anomalies
                        </span>
                        <span className="link" onClick={() => navigate('/aibudgetpage')}>
                            AI Budget
                        </span>
                    </div>
                </div>
                <span className="link" onClick={handleLogout}>
                    Logout
                </span>
            </div>
        </nav>
    );
};

export default Navbar;