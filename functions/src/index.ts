import {onRequest} from "firebase-functions/v2/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {Request, Response} from "express"; // Or use 'node:http' if you prefer
import * as admin from "firebase-admin";
import * as natural from "natural";

admin.initializeApp();
const db = admin.firestore();

// *** Chatbot Cloud Function ***


/**
 * Generates a chatbot response based on user message, user details, and page context.
 * @param {string} userMessage - The message sent by the user.
 * @param {object} user - The user object containing a unique identifier.
 * @param {string} user.uid - The unique identifier of the user.
 * @param {string} page - The current page where the message was sent.
 * @return {Promise<string>} - The chatbot response.
 */
async function getBotResponse(
  userMessage: string,
  user: { uid: string },
  page: string
): Promise<string> {
  const tokenizer = new natural.WordTokenizer();
  const tokens: string[] = tokenizer.tokenize(userMessage.toLowerCase());

  const greetingKeywords = [
    "hello",
    "hi",
    "hey",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
  ];
  if (tokens.some((token: string) => greetingKeywords.includes(token))) {
    return "Hello there! How can I help you today?";
  }

  // Page-specific logic
  if (page === "/dashboard") {
    if (userMessage.includes("balance")) {
      return await handleBalanceQuery(user);
    } else if (userMessage.includes("recent expenses")) {
      return await handleLastExpenseQuery(user);
    } else {
      return "On your dashboard, you can see an overview of your financial status.";
    }
  }

  if (page === "/budgetingpage") {
    return userMessage.includes("budget") ?
      await handleBudgetQuery(user) :
      "On the budgeting page, you can set and manage your financial goals.";
  }

  return "I'm still learning. Ask me about your budgets, balance, or recent expenses.";
}

/**
 * Retrieves the user's total balance.
 * @param {object} user - The user object.
 * @param {string} user.uid - The unique identifier of the user.
 * @return {Promise<string>} - A promise resolving to the user's total balance as a formatted string.
 */
async function handleBalanceQuery(user: { uid: string }): Promise<string> {
  try {
    if (!user || !user.uid) return "Could not determine the user.";

    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) return "Could not find your user profile.";

    const userData = userDoc.data() as { totalBalance?: number };
    return `Your total balance is: ₹${userData.totalBalance ?? "N/A"}`;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "Sorry, I encountered an error while fetching your balance.";
  }
}

/**
 * Retrieves the user's most recent expenses.
 * @param {object} user - The user object.
 * @param {string} user.uid - The unique identifier of the user.
 * @return {Promise<string>} - A promise resolving to a formatted string listing the recent expenses.
 */
async function handleLastExpenseQuery(user: { uid: string }): Promise<string> {
  try {
    if (!user || !user.uid) return "Could not determine the user.";

    const expensesSnapshot = await db
      .collection("expenses")
      .where("uid", "==", user.uid)
      .orderBy("date", "desc")
      .limit(3)
      .get();

    if (expensesSnapshot.empty) return "No recent expenses found.";

    let expenseList = "Here are your last few expenses:\n";
    expensesSnapshot.forEach((doc) => {
      const data = doc.data() as {
        amount: number;
        date?: admin.firestore.Timestamp;
        description?: string;
      };
      const date = data.date ? data.date.toDate().toLocaleDateString() : "N/A";
      expenseList += `- ₹${data.amount} on ${date} for ${data.description ?? "N/A"}\n`;
    });

    return expenseList;
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    return "Sorry, I encountered an error while fetching your recent expenses.";
  }
}

/**
 * Retrieves the user's recent budgets.
 * @param {object} user - The user object.
 * @param {string} user.uid - The unique identifier of the user.
 * @return {Promise<string>} - A promise resolving to a formatted string listing the recent budgets.
 */
async function handleBudgetQuery(user: { uid: string }): Promise<string> {
  try {
    if (!user || !user.uid) return "Could not determine the user.";

    const budgetSnapshot = await db
      .collection("budgets")
      .where("uid", "==", user.uid)
      .limit(5)
      .get();

    if (budgetSnapshot.empty) return "You haven't set up any budgets yet.";

    let budgetList = "Here are some of your recent budgets:\n";
    budgetSnapshot.forEach((doc) => {
      const data = doc.data() as { category: string; amount: number; period: string };
      budgetList += `- <span class="math-inline">{data.category}: ₹</span>{data.amount} (${data.period})\n`;
    });

    return budgetList;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return "Sorry, I encountered an error while fetching your budgets.";
  }
}

/**
 * Interface defining the structure of an expense object.
 */
interface Expense {
  amount: number;
  category: string;
  date?: admin.firestore.Timestamp | admin.firestore.FieldValue;
}

/**
 * Fetches student budget data for a specific user.
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<{ [key: string]: number }>} - A promise resolving to an object where keys are budget categories and values are budget amounts.
 */
async function fetchStudentBudgets(userId: string): Promise<{ [key: string]: number }> {
  const budgets: { [key: string]: number } = {};
  const snapshot = await db.collection("user_budgets").where("userId", "==", userId).get();
  snapshot.forEach((doc) => {
    const data = doc.data() as { category?: string; amount?: number };
    if (data.category && data.amount) {
      budgets[data.category] = data.amount;
    }
  });
  return budgets;
}

/**
 * Fetches student expense data for a specific user within a given date range.
 * @param {string} userId - The unique identifier of the user.
 * @param {Date} startDate - The starting date of the expense period.
 * @param {Date} endDate - The ending date of the expense period.
 * @return {Promise<Expense[]>} - A promise resolving to an array of expense objects.
 */
async function fetchStudentExpenses(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
  const expenses: Expense[] = [];
  const snapshot = await db
    .collection("expenses")
    .where("userId", "==", userId)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .get();

  snapshot.forEach((doc) => {
    const data = doc.data() as Expense;
    if (data.amount && data.category && data.date) {
      expenses.push(data);
    }
  });

  return expenses;
}

/**
 * Fetches special budget data for a specific user.
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<{ [key: string]: number }>} - A promise resolving to an object where keys are budget categories and values are budget amounts.
 */
async function fetchSpecialBudgets(userId: string): Promise<{ [key: string]: number }> {
  const budgets: { [key: string]: number } = {};
  const snapshot = await db.collection("sp_budgets").where("userId", "==", userId).get();
  snapshot.forEach((doc) => {
    const data = doc.data() as { category?: string; amount?: number };
    if (data.category && data.amount) {
      budgets[data.category] = data.amount;
    }
  });
  return budgets;
}

/**
 * Fetches special expense data for a specific user within a given date range.
 * @param {string} userId - The unique identifier of the user.
 * @param {Date} startDate - The starting date of the expense period.
 * @param {Date} endDate - The ending date of the expense period.
 * @return {Promise<Expense[]>} - A promise resolving to an array of expense objects.
 */
async function fetchSpecialExpenses(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
  const expenses: Expense[] = [];
  const snapshot = await db
    .collection("sp_items")
    .where("userId", "==", userId)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .get();

  snapshot.forEach((doc) => {
    const data = doc.data() as Expense;
    if (data.amount && data.category && data.date) {
      expenses.push(data);
    }
  });

  return expenses;
}

/**
 * Fetches home budget data for a specific user.
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<{ [key: string]: number }>} - A promise resolving to an object where keys are budget categories and values are budget amounts.
 */
async function fetchHomeBudgets(userId: string): Promise<{ [key: string]: number }> {
  const budgets: { [key: string]: number } = {};
  const snapshot = await db.collection("home_user_budgets").where("userId", "==", userId).get();
  snapshot.forEach((doc) => {
    const data = doc.data() as { category?: string; budget?: number };
    if (data.category && data.budget) {
      budgets[data.category] = data.budget;
    }
  });
  return budgets;
}

/**
 * Fetches home expense data for a specific user within a given date range.
 * @param {string} userId - The unique identifier of the user.
 * @param {Date} startDate - The starting date of the expense period.
 * @param {Date} endDate - The ending date of the expense period.
 * @return {Promise<Expense[]>} - A promise resolving to an array of expense objects.
 */
async function fetchHomeExpenses(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
  const expenses: Expense[] = [];
  const snapshot = await db
    .collection("home_expenses")
    .where("userId", "==", userId)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .get();

  snapshot.forEach((doc) => {
    const data = doc.data() as Expense;
    if (data.amount && data.category && data.date) {
      expenses.push(data);
    }
  });

  return expenses;
}

/**
 * Interface defining the structure of an anomaly object.
 */
interface Anomaly {
  planner: string;
  category: string;
  budget: number;
  spending: number;
  anomaly_type: string;
}

/**
 * Detects budget anomalies by comparing spending to budget thresholds across different planners.
 * @param {object} studentBudgets - Object containing student budgets by category.
 * @param {Expense[]} studentExpenses - Array of student expense objects.
 * @param {object} specialBudgets - Object containing special budgets by category.
 * @param {Expense[]} specialExpenses - Array of special expense objects.
 * @param {object} homeBudgets - Object containing home budgets by category.
 * @param {Expense[]} homeExpenses - Array of home expense objects.
 * @param {number} [anomalyThreshold=0.9] - The threshold (as a fraction) above which spending is considered an anomaly.
 * @return {Anomaly[]} - An array of anomaly objects.
 */
function detectBudgetAnomalies(
  studentBudgets: { [key: string]: number },
  studentExpenses: Expense[],
  specialBudgets: { [key: string]: number },
  specialExpenses: Expense[],
  homeBudgets: { [key: string]: number },
  homeExpenses: Expense[],
  anomalyThreshold: number = 0.9
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  /**
   * Analyzes budget versus spending for a given planner type.
   * @param {object} budgets - Object containing budgets by category.
   * @param {Expense[]} expenses - Array of expense objects.
   * @param {string} plannerType - The type of planner (e.g., "Student", "Special", "Home").
   */
  function analyze(budgets: { [key: string]: number }, expenses: Expense[], plannerType: string): void {
    const spendingByCategory: { [key: string]: number } = {};

    expenses.forEach((exp: Expense) => {
      const category = exp.category;
      spendingByCategory[category] = (spendingByCategory[category] || 0) + exp.amount;
    });

    for (const [category, budget] of Object.entries(budgets)) {
      const spending = spendingByCategory[category] || 0;
      if (spending > budget * anomalyThreshold) {
        anomalies.push({
          planner: plannerType,
          category,
          budget,
          spending,
          anomaly_type: "Exceeded Threshold",
        });
      }
    }
  }

  analyze(studentBudgets, studentExpenses, "Student");
  analyze(specialBudgets, specialExpenses, "Special");
  analyze(homeBudgets, homeExpenses, "Home");

  return anomalies;
}

/**
 * Scheduled function to analyze user budgets daily for anomalies.
 */
/**
 * Scheduled function to analyze user budgets daily for anomalies.
 */

