Mango - A Personal Finance Assistant (MVP)
🚀 Overview
Mango is a full-stack personal finance web application designed to help users efficiently track and manage their expenses, incomes, and financial goals. As an Minimum Viable Product (MVP), it provides a robust foundation for personal financial management, aiming to empower users with better control over their money.

✨ Key Features
Expense Tracking: Easily record and categorize daily expenses.

Income Management: Log various sources of income.

Financial Overview: Get a quick summary of your financial health.

Intuitive User Interface: A clean, responsive, and easy-to-navigate design.

Scalable Architecture: Built on modern technologies for future expansion.

🛠️ Technologies Used
Frontend:

React.js: A declarative, component-based JavaScript library for building user interfaces.

JavaScript: The core programming language for web interactivity.

HTML/CSS: For structuring and styling the web application.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

Backend & Database:

Firebase: A comprehensive platform from Google for building mobile and web applications, used for:

Firebase Authentication: For user registration and login.

Firestore: A NoSQL cloud database for storing user financial data.

🚀 Live Demo
Experience Mango live: https://mango-bcf17.web.app/

🏗️ Installation & Setup
Follow these steps to get a local copy of Mango up and running on your machine.

Prerequisites
Node.js (LTS version recommended)

npm or Yarn

Steps
Clone the repository:

git clone https://github.com/Natasha-cyber777/mango.git
cd mango

(Note: Replace https://github.com/Natasha-cyber777/mango.git with the actual URL of your Mango repository if it's different).

Install dependencies:

npm install
# or if you prefer yarn:
yarn install

Firebase Configuration (Environment Variables):
Mango connects to Firebase, and your sensitive configuration details should not be committed to Git.

Create a .env file in the root of your project directory.

Populate it with your Firebase project's configuration. You can find these values in your Firebase project settings (Project overview -> Project settings -> General -> Your apps -> Web app section). Remember to prefix variables with REACT_APP_ for Create React App projects:

REACT_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID

Crucially, ensure .env is listed in your .gitignore file.

Run the application:

npm start
# or:
yarn start

This will start the development server, and Mango should open in your browser, usually at http://localhost:3000.

🛣️ Future Enhancements
Detailed Financial Reports: Generate charts and graphs for spending habits over time.

Budgeting Tools: Set and track budgets for different categories.

Investment Tracking: Integrate features for monitoring investment portfolios.

Goal Setting: Help users define and track progress towards financial goals (e.g., saving for a down payment).

Bank Integrations: (Advanced) Connect directly with bank accounts for automatic transaction syncing.

🤝 Contributing
Contributions are welcome! If you have suggestions or want to contribute, please feel free to:

Fork the repository.

Create a new branch (git checkout -b feature/your-feature).

Make your changes.

Commit your changes (git commit -m 'Add new feature X').

Push to the branch (git push origin feature/your-feature).

Open a Pull Request.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📧 Contact
For questions or collaborations, feel free to reach out:

Natasha Robinson: matasha093@gmail.com

LinkedIn: www.linkedin.com/in/natasha-robinson-29abb517a

GitHub: github.com/Natasha-cyber777
