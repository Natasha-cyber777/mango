// Signup.js
import { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import NewNavbar from '../components/NewNavbar';
import '../styles/Signup.css';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const firebaseAuth = getAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          uid: user.uid,
        });
        console.log("User signed up with UID:", user.uid);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          uid: user.uid,
        });
      }

      console.log("Signed in with Google:", user.uid);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <NewNavbar />
      <h2 className="signup-title">Sign Up</h2>
      {error && <p className="signup-error">{error}</p>}
      <form onSubmit={handleSignup} className="signup-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="signup-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="signup-input"
        />
        <button type="submit" className="signup-button">
          Sign Up
        </button>

        <div className="signup-separator"><span>OR</span></div>

        <button type="button" onClick={handleGoogleSignup} className="signup-button google-signup-button">
          Sign Up with Google
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <span
          className="signup-login-link"
          onClick={() => navigate('/login')}
        >
          Login here
        </span>
      </p>
    </div>
  );
};

export default Signup;
