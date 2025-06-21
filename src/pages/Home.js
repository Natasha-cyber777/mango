import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import NewNavbar from '../components/NewNavbar';
import mangoLogo from '../../src/images/mango-logo.png';
import secureIcon from '../../src/images/secure-icon.png'; // Example: Import a security icon

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <NewNavbar />
      <section className="hero-section">
        <div className="hero-content">
          <img src={mangoLogo} alt="Mango Logo" className="hero-logo" />
          <h1 className="home-title">
            Take control of your money —{' '}
            <span className="highlight">without the headache of spreadsheets.</span>
          </h1>
          <p className="home-subtext">
            Simplify your finances and achieve your goals with Mango. Budget smarter, save faster, and gain a clear view of your financial life.
          </p>

          <div className="home-button-container">
            <button className="home-button primary" onClick={() => navigate('/login')}>
              <span className="button-text">Log In</span>
            </button>
            <button className="home-button secondary" onClick={() => navigate('/signup')}>
              <span className="button-text">Sign Up</span>
            </button>
          </div>

          <p className="home-promise">
            <img src={secureIcon} alt="Secure Icon" className="security-icon" /> Your financial data is secure and private. No ads, no spam, just clean finance.
          </p>
        </div>
      </section>

      <section className="problem-solution-section">
        <div className="section-content">
          <h2>Tired of Financial Overwhelm?</h2>
          <p>
            Managing your money shouldn't be a source of stress. Are you struggling with:
          </p>
          <ul>
            <li>Keeping track of where your money goes?</li>
            <li>Creating and sticking to a budget?</li>
            <li>Knowing if you're on track to reach your savings goals?</li>
            <li>Feeling lost in complex spreadsheets?</li>
          </ul>
          <h3>Mango: Your Solution for Simple Finance</h3>
          <p>
            Mango is designed to simplify your financial life. We provide intuitive tools to help you understand, manage, and grow your money effortlessly, all without the complexity of spreadsheets.
          </p>
        </div>
      </section>

      <section className="features-section">
        <div className="section-content">
          <h2>Features Designed for Your Financial Well-being</h2>
          <div className="features-grid">
            <div className="feature">
              {/* You can add an icon here */}
              <h3>Effortless Expense Tracking</h3>
              <p>
                Stop guessing where your money goes. Mango automatically categorizes your transactions, giving you clear insights into your spending habits. <strong>Benefit: Understand your spending patterns and identify areas to save.</strong>
              </p>
            </div>
            <div className="feature">
              {/* You can add an icon here */}
              <h3>Personalized Budgeting Tools</h3>
              <p>
                Create budgets that work for you. Set spending limits for different categories and receive smart notifications to stay on track. <strong>Benefit: Take control of your spending and achieve your financial goals faster.</strong>
              </p>
            </div>
            <div className="feature">
              {/* You can add an icon here */}
              <h3>Clear Financial Overview</h3>
              <p>
                Get a holistic view of your finances in one place. See your account balances, spending trends, and budget progress at a glance. <strong>Benefit: Make informed financial decisions with a clear understanding of your current situation.</strong>
              </p>
            </div>
            <div className="feature">
              {/* You can add an icon here */}
              <h3>Goal Setting & Tracking</h3>
              <p>
                Define your financial aspirations, from saving for a down payment to planning a vacation, and track your progress towards them. <strong>Benefit: Stay motivated and on course to achieve your long-term financial dreams.</strong>
              </p>
            </div>
            {/* Add more features as needed */}
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="section-content">
          <h2>How Mango Simplifies Your Finances</h2>
          <div className="how-it-works-steps">
            <div className="step">
              {/* You can add a step icon */}
              <h3>1. Connect Your Accounts</h3>
              <p>Securely link your bank accounts, credit cards, and other financial institutions.</p>
            </div>
            <div className="step">
              {/* You can add a step icon */}
              <h3>2. Automatic Tracking & Categorization</h3>
              <p>Mango automatically pulls and categorizes your transactions, saving you manual effort.</p>
            </div>
            <div className="step">
              {/* You can add a step icon */}
              <h3>3. Set Your Budgets & Goals</h3>
              <p>Create personalized budgets and define your financial goals within the app.</p>
            </div>
            <div className="step">
              {/* You can add a step icon */}
              <h3>4. Track Progress & Gain Insights</h3>
              <p>Monitor your spending, budget adherence, and progress towards your goals with intuitive charts and summaries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Add this section only if you have actual testimonials */}
      {/* <section className="testimonials-section">
        <div className="section-content">
          <h2>What Our Early Users Are Saying</h2>
          <div className="testimonial">
            <p>"Mango has completely changed how I manage my money. It's so easy to see where everything is going, and I'm finally sticking to my budget!"</p>
            <p>- Sarah M.</p>
          </div>
          <div className="testimonial">
            <p>"I love how simple and intuitive Mango is. No more complicated spreadsheets – just clear, actionable insights."</p>
            <p>- John B.</p>
          </div>
          {/* Add more testimonials */}
        {/* </div>
      </section> */}

      <section className="trust-security-section">
        <div className="section-content">
          <h2>Your Security is Our Priority</h2>
          <p>
            We understand the sensitivity of your financial information. That's why we've implemented robust security measures to protect your data:
          </p>
          <ul>
            <li><strong>End-to-End Encryption:</strong> Your data is encrypted in transit and at rest.</li>
            <li><strong>Secure Authentication:</strong> We use industry-standard authentication protocols to ensure only you can access your account.</li>
            <li><strong>Regular Security Audits:</strong> Our systems undergo regular security audits to identify and address potential vulnerabilities.</li>
            <li><strong>Privacy-Focused Approach:</strong> We are committed to your privacy and will never sell your personal information.</li>
          </ul>
          <p>
            You can trust Mango to provide a secure and reliable platform for managing your finances.
          </p>
        </div>
      </section>

      {/* Consider adding a footer with copyright and other links */}
    </div>
  );
};

export default Home;
