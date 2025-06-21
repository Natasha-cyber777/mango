import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import "../styles/FinancialPersonalityProfiler.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPiggyBank, faChartLine, faShoppingCart, faRedo } from '@fortawesome/free-solid-svg-icons';

const personalityDescriptions = {
    "Financially Disciplined": { description: "You are a meticulous planner and saver. You prioritize budgeting, saving, and responsible debt management. You likely have clear financial goals and work diligently towards them.", strengths: ["Excellent at budgeting and tracking expenses.", "Consistent in saving money.", "Responsible with debt management.", "Likely to achieve long-term financial goals."], weaknesses: ["May be overly cautious with investments.", "Could miss out on some growth opportunities due to risk aversion.", "Might find it difficult to make spontaneous purchases."], recommendations: ["Continue your disciplined approach to saving and budgeting.", "Consider diversifying your investments to balance caution with potential growth.", "Allow for some flexibility in your budget for occasional enjoyable expenses."], icon: faPiggyBank, color: "#8bc34a" },
    "Risk-Taking Investor": { description: "You are comfortable taking calculated risks with your finances. You are likely interested in investments and are open to exploring opportunities for higher returns, even if they come with higher volatility.", strengths: ["Comfortable with investing in stocks, crypto, or other growth assets.", "Likely to seek out opportunities for higher returns.", "Proactive in managing and growing wealth."], weaknesses: ["May take on excessive risk without proper diversification.", "Could be more susceptible to market fluctuations.", "Might overlook the importance of a strong financial foundation with savings."], recommendations: ["Ensure your risk tolerance aligns with your financial goals and time horizon.", "Diversify your investment portfolio to manage risk effectively.", "Don't neglect the importance of emergency savings."], icon: faChartLine, color: "#ff9800" },
    "Spontaneous Spender": { description: "You enjoy spending and may prioritize immediate gratification. While you may enjoy life's pleasures, it's important to balance spending with saving and financial planning for the future.", strengths: ["Enjoys life and is not afraid to spend on experiences.", "May be generous with others."], weaknesses: ["May struggle with budgeting and saving consistently.", "Could accumulate debt due to impulse purchases.", "Might not have a clear long-term financial plan."], recommendations: ["Develop a budget to track your spending and identify areas to save.", "Consider setting financial goals to motivate saving.", "Practice delaying purchases to avoid impulsive spending."], icon: faShoppingCart, color: "#f44336" },
    "Balanced Individual": { description: "You exhibit a balanced approach to your finances, showing aspects of discipline, risk awareness, and enjoyment of spending. You likely have a good understanding of financial basics and strive for a healthy financial life.", strengths: ["Good understanding of financial principles.", "Balances saving and spending.", "Likely to make informed financial decisions."], weaknesses: ["May need to focus more on specific areas like investing or stricter budgeting to achieve more ambitious financial goals."], recommendations: ["Continue to maintain a balanced approach.", "Identify specific financial goals and tailor your strategies accordingly (e.g., more aggressive saving or investment).", "Regularly review your financial plan to ensure it aligns with your evolving needs."], icon: faPiggyBank, color: "#9e9e9e" },
};

const questions = [
    { id: 1, type: "yesno", text: "Do you regularly set aside money for savings?" },
    { id: 2, type: "multiple", text: "How do you track your expenses?", options: ["App", "Spreadsheet", "Notebook", "I don't track"] },
    { id: 3, type: "rating", text: "On a scale of 1-5, how disciplined are you with budgeting?" },
    { id: 4, type: "yesno", text: "Do you invest in stocks or mutual funds?" },
    { id: 5, type: "multiple", text: "What type of investments do you prefer?", options: ["Stocks", "Real Estate", "Crypto", "Bonds"] },
    { id: 6, type: "rating", text: "How comfortable are you with financial risks?" },
    { id: 7, type: "yesno", text: "Do you often buy things on impulse?" },
    { id: 8, type: "multiple", text: "What do you spend most of your money on?", options: ["Food", "Entertainment", "Shopping", "Savings"] },
    { id: 9, type: "rating", text: "How often do you stick to your planned budget?" },
    { id: 10, type: "yesno", text: "Do you have any outstanding loans or credit card debt?" },
    { id: 11, type: "multiple", text: "How do you handle debt repayment?", options: ["Minimum payment", "Pay in full", "Ignore it"] },
    { id: 12, type: "rating", text: "How confident are you in managing debt?" }
];

const FinancialPersonalityProfiler = () => {
    const { user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [answers, setAnswers] = useState({});
    const [showSummary, setShowSummary] = useState(false);
    const [result, setResult] = useState(null);
    const [loadingResult, setLoadingResult] = useState(true); // To handle initial check

    useEffect(() => {
        if (!user) {
            setLoadingResult(false);
            return;
        }

        const fetchUserData = async () => {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                if (userData && userData.financialPersonality) {
                    setResult(userData.financialPersonality);
                } else {
                    setAnswers(userData.quizResponses || {});
                }
            }
            setLoadingResult(false);
        };
        fetchUserData();
    }, [user]);

    const saveAnswer = async (answer) => {
        if (!user) return alert("Please log in to save your answers.");

        const updatedAnswers = { ...answers, [questions[currentIndex].text]: answer };
        setAnswers(updatedAnswers);

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { quizResponses: updatedAnswers }, { merge: true });

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowSummary(true);
        }
    };

    const calculateResult = async () => {
        console.log("calculateResult called");
        console.log("User in calculateResult:", user);
    
        let disciplined = 0, riskTaker = 0, spender = 0;
    
        Object.entries(answers).forEach(([question, answer]) => {
            const answerString = String(answer); // Convert answer to string
    
            if (question.includes("savings") || question.includes("budgeting") || question.includes("debt")) {
                if (answer === "Yes" || parseInt(answer) >= 4 || answer === "Pay in full" || answerString.includes("4") || answerString.includes("5")) disciplined++;
            }
            if (question.includes("risks") || question.includes("investments") || question.includes("stocks") || question.includes("crypto")) {
                if (answer === "Yes" || parseInt(answer) >= 4 || answer === "Stocks" || answer === "Crypto") riskTaker++;
            }
            if (question.includes("impulse") || question.includes("shopping") || question.includes("debt") || question.includes("loans") || question.includes("Shopping")) {
                if (answer === "Yes" || answer === "Minimum payment" || answer === "Ignore it" || answer === "Shopping") spender++;
            }
        });
    
        let finalResult = "Balanced Individual";
        if (disciplined >= 4) finalResult = "Financially Disciplined";
        if (riskTaker >= 3) finalResult = "Risk-Taking Investor";
        if (spender >= 3) finalResult = "Spontaneous Spender";
    
        setResult(finalResult);
        setShowSummary(false);
    
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            console.log("Saving result:", finalResult, "to user:", user.uid);
            try {
                await updateDoc(userDocRef, { financialPersonality: finalResult, quizResponses: {} });
                console.log("Financial personality saved successfully.");
            } catch (error) {
                console.error("Error saving financial personality:", error);
            }
        } else {
            console.log("User is null, cannot save financial personality.");
        }
    };
    const handleRetakeQuiz = () => {
        setCurrentIndex(0); // Start from the first question
        setAnswers({});
        setShowSummary(false);
        setResult(null);
    };

    if (loadingResult) {
        return (
            <div className="quiz-container">
                <Navbar />
                <div className="quiz-content">
                    <p>Loading your previous result...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <Navbar />
            <div className="quiz-content">
                {result ? (
                    <div className="result-container">
                        <h2>Your Financial Personality:</h2>
                        {personalityDescriptions[result] && (
                            <div className="personality-card" style={{ backgroundColor: personalityDescriptions[result].color }}>
                                <div className="personality-icon">
                                    <FontAwesomeIcon icon={personalityDescriptions[result].icon} size="2x" />
                                </div>
                                <h3 className="personality-title">{result}</h3>
                                <p className="personality-description">
                                    {personalityDescriptions[result].description}
                                </p>
                                <div className="strengths-weaknesses">
                                    <h4>Strengths:</h4>
                                    <ul>
                                        {personalityDescriptions[result].strengths.map((strength, index) => (
                                            <li key={`strength-${index}`}>{strength}</li>
                                        ))}
                                    </ul>
                                    <h4>Areas for Consideration:</h4>
                                    <ul>
                                        {personalityDescriptions[result].weaknesses.map((weakness, index) => (
                                            <li key={`weakness-${index}`}>{weakness}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="recommendations">
                                    <h4>Financial Tips for You:</h4>
                                    <ul>
                                        {personalityDescriptions[result].recommendations.map((rec, index) => (
                                            <li key={`recommendation-${index}`}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                                <button onClick={handleRetakeQuiz} className="retake-button">
                                    <FontAwesomeIcon icon={faRedo} style={{ marginRight: '8px' }} />
                                    Retake Quiz
                                </button>
                            </div>
                        )}
                    </div>
                ) : currentIndex === -1 ? (
                    <button id="startButton" onClick={() => setCurrentIndex(0)}>Start Quiz</button>
                ) : showSummary ? (
                    <div className="summary-container">
                        <h2>Summary of Your Responses</h2>
                        <ul>
                            {Object.entries(answers).map(([question, answer], index) => (
                                <li key={index}><strong>{question}</strong>: {answer}</li>
                            ))}
                        </ul>
                        <button onClick={calculateResult}>Get My Financial Personality</button>
                    </div>
                ) : (
                    <>
                        <div className="progress-bar1">
                            <div className="progress" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                        </div>
                        <div className="quiz-path">
                            {questions.map((q, index) => (
                                <div key={q.id} className={`node ${index === currentIndex ? "active" : ""}`}>
                                    {index === currentIndex && (
                                        <>
                                            <p>{q.text}</p>
                                            {q.type === "yesno" && (
                                                <>
                                                    <button onClick={() => saveAnswer("Yes")}>Yes</button>
                                                    <button onClick={() => saveAnswer("No")}>No</button>
                                                </>
                                            )}
                                            {q.type === "multiple" && q.options.map((option, i) => (
                                                <button key={i} onClick={() => saveAnswer(option)}>{option}</button>
                                            ))}
                                            {q.type === "rating" && [1, 2, 3, 4, 5].map((num) => (
                                                <button key={num} onClick={() => saveAnswer(num)}>{num}</button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FinancialPersonalityProfiler;