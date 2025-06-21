import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { getAuth } from "firebase/auth"; // Import getAuth

const Chatbot = ({ user, currentPage }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const chatContainerRef = useRef(null);
    const initialMessageSent = useRef(false); // Use useRef to persist across renders
    const auth = getAuth(); // Initialize Firebase Auth

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!initialMessageSent.current) {
            let initialText = '';
            if (user && user.email) {
                initialText = `Hello ${user.email}! How can I assist you on the ${getPageDisplayName(currentPage)} page?`;
            } else {
                initialText = `Hello! How can I help you today?`;
            }
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: initialText }]);
            initialMessageSent.current = true;
        }
    }, [user?.email, currentPage]);

    const getPageDisplayName = (path) => {
        switch (path) {
            case '/':
                return 'Home';
            case '/login':
                return 'Login';
            case '/signup':
                return 'Sign Up';
            case '/dashboard':
                return 'Dashboard';
            case '/budgetingpage':
                return 'Budgeting';
            case '/report':
                return 'Report';
            case '/financialpersonalityprofiler':
                return 'Financial Personality Profiler';
            case '/studentexpenseplanner':
                return 'Student Expense Planner';
            case '/homeexpenseplanner':
                return 'Home Expense Planner';
            case '/groupexpensecalculator':
                return 'Group Expense Calculator';
            case '/incomeprofile':
                return 'Income Profile';
            case '/savingsprofile':
                return 'Savings Profile';
            case '/debtprofile':
                return 'Debt Profile';
            case '/investmentprofile':
                return 'Investment Profile';
            case '/userprofilepage':
                return 'User Profile';
            case '/budgetanomaliespage':
                return 'Budget Anomalies';
            case '/aibudgetpage':
                return ' AI Budget';
            default:
                return 'this page';
        }
    };

    const handleSendMessage = () => {
        if (inputText.trim()) {
            const newUserMessage = { text: inputText, sender: 'user' };
            setMessages(prevMessages => [...prevMessages, newUserMessage]);
            setInputText('');

            // Simulate bot response based on user input (Front-end logic)
            setTimeout(() => {
                const botResponse = getBotResponse(inputText, currentPage, user);
                const newBotMessage = { text: botResponse, sender: 'bot' };
                setMessages(prevMessages => [...prevMessages, newBotMessage]);
            }, 500);
        }
    };

    const getBotResponse = (userMessage, currentPage, user) => {
        const lowerCaseMessage = userMessage.toLowerCase();

        if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hey')) {
            return `Hello! How can I help you with the ${getPageDisplayName(currentPage)} page today?`;
        }

        if (currentPage === '/dashboard') {
            if (lowerCaseMessage.includes('budget')) {
                return "On the dashboard, you can see a summary of your current budget and spending.";
            } else if (lowerCaseMessage.includes('report')) {
                return "You can generate detailed financial reports from the 'Report' section.";
            } else if (lowerCaseMessage.includes('add expense')) {
                return "To add a new expense, please navigate to the 'Budgeting' page.";
            } else if (lowerCaseMessage.includes('view accounts')) {
                return "Your linked financial accounts are displayed in the accounts overview section.";
            } else {
                return "I can provide information related to your budget, reports, and account overview on this dashboard page. What specifically are you interested in?";
            }
        }

        if (currentPage === '/budgetingpage') {
            if (lowerCaseMessage.includes('create budget')) {
                return "You can create a new budget by clicking on the 'Create Budget' button and defining your income and expense categories.";
            } else if (lowerCaseMessage.includes('edit budget')) {
                return "To edit an existing budget, find it in your list and click the 'Edit' option.";
            } else if (lowerCaseMessage.includes('track spending')) {
                return "Your spending is automatically tracked based on the transactions from your linked accounts.";
            } else {
                return "On the budgeting page, you can create, edit, and view your budgets, as well as track your spending. How can I assist you with budgeting?";
            }
        }

        if (currentPage === '/report') {
            if (lowerCaseMessage.includes('generate report')) {
                return "You can generate various financial reports by selecting the desired type and date range.";
            } else if (lowerCaseMessage.includes('spending by category')) {
                return "To see your spending broken down by category, choose the 'Spending by Category' report.";
            } else if (lowerCaseMessage.includes('income vs expense')) {
                return "The 'Income vs Expense' report provides a comparison of your earnings and expenditures.";
            } else {
                return "The report page allows you to generate and view different types of financial reports. What kind of report are you interested in?";
            }
        }

        if (currentPage === '/financialpersonalityprofiler') {
            if (lowerCaseMessage.includes('start quiz')) {
                return "Click on the 'Start Quiz' button to begin the financial personality assessment.";
            } else if (lowerCaseMessage.includes('understand results')) {
                return "Once you complete the quiz, your results will explain your financial tendencies and provide insights.";
            } else {
                return "The Financial Personality Profiler helps you understand your financial behavior. Are you ready to start the quiz or learn more about it?";
            }
        }

        // Add more page-specific logic here

        if (lowerCaseMessage.includes('help')) {
            return `I can provide information related to the content of the ${getPageDisplayName(currentPage)} page. What are you looking for help with?`;
        }

        if (lowerCaseMessage.includes('thanks') || lowerCaseMessage.includes('thank you')) {
            return "You're welcome! Let me know if you have any other questions.";
        }

        // Default response if no specific logic matches
        return "I'm here to help with questions related to this page. Could you please be more specific?";
    };

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const handleInputKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">Chat with Mango</div>
            <div ref={chatContainerRef} className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="chatbot-input">
                <textarea
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyPress={handleInputKeyPress}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chatbot;