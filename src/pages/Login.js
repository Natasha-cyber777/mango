// Login.js
import { useState } from 'react';
import { signInWithEmailAndPassword, getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // 🔽 Added
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import NewNavbar from '../components/NewNavbar';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const firebaseAuth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists() || !userDocSnap.data()?.uid) {
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            uid: user.uid,
          }, { merge: true });
          console.log("User profile created/updated with UID on login:", user.uid);
        }

        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔽 Added: Handle login with Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          uid: user.uid,
        }, { merge: true });

        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <NewNavbar />
      <h2 className="login-title">Login</h2>
      {error && <p className="login-error">{error}</p>}
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="login-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="login-input"
        />
        <button type="submit" className="login-button">
          Login
        </button>

        {/* 🔽 Added: OR separator */}
        <div className="login-separator"><span>OR</span></div>

        {/* 🔽 Added: Google login button */}
        <button type="button" className="google-login-button" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </form>
      <p>
        Don’t have an account?{' '}
        <span className="login-signup-link" onClick={() => navigate('/signup')}>
          Sign up here
        </span>
      </p>
    </div>
  );
};

export default Login;
