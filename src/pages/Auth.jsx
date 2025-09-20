import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// This is the self-contained Login/SignUp component with its own state and logic.
const LoginSignUpForm = ({ onLogin }) => {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const navigate = useNavigate();

    // State for the Sign In form
    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // State for the Sign Up form
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpError, setSignUpError] = useState(''); // New state for sign-up errors

    const handleSignUpClick = () => {
        setLoginError(''); // Clear previous errors
        setIsRightPanelActive(true);
    };
    const handleSignInClick = () => {
        setSignUpError(''); // Clear previous errors
        setIsRightPanelActive(false);
    };

    // Handler for the Sign Up form submission
    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setSignUpError(''); // Reset sign-up error
        try {
            const response = await fetch('https://mwnwp6z7-3000.inc1.devtunnels.ms/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: signUpName, email: signUpEmail, password: signUpPassword }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to sign up');
            }

            console.log('Sign up successful:', data.msg);
            setSignInEmail(signUpEmail); // Pre-fill email in the sign-in form
            setIsRightPanelActive(false); // Switch to sign-in panel

        } catch (error) {
            setSignUpError(error.message); // Set the sign-up specific error
        }
    };

    // Handler for the Sign In form submission
    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const response = await fetch('https://mwnwp6z7-3000.inc1.devtunnels.ms/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signInEmail, password: signInPassword }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to sign in');
            }

            // Store the token and update the auth state
            localStorage.setItem('token', data.token);
            onLogin(); // Tell App.jsx that the user is authenticated
            navigate('/dashboard');

        } catch (error) {
            setLoginError(error.message);
            setSignInPassword('');
        }
    };

    return (
        <>
            <style>{`
                .page-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1A1A2E; padding: 20px; box-sizing: border-box; font-family: Arial, sans-serif; color: #E0E0E0; }
                .container { position: relative; width: 800px; max-width: 100%; min-height: 500px; overflow: hidden; background-color: #2D2D44; border-radius: 10px; box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22); }
                .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
                .sign-in-container { left: 0; width: 50%; z-index: 2; }
                .sign-up-container { left: 0; width: 50%; z-index: 1; opacity: 0; }
                .container.right-panel-active .sign-in-container { transform: translateX(100%); }
                .container.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; }
                @keyframes show { 0%, 49.99% { opacity: 0; z-index: 1; } 50%, 100% { opacity: 1; z-index: 5; } }
                .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
                .container.right-panel-active .overlay-container { transform: translateX(-100%); }
                .overlay { background: linear-gradient(to right, #4A00B7, #7A00B7); color: #fff; position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
                .container.right-panel-active .overlay { transform: translateX(50%); }
                .overlay-panel { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 40px; text-align: center; top: 0; height: 100%; width: 50%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
                .overlay-left { transform: translateX(-20%); }
                .container.right-panel-active .overlay-left { transform: translateX(0); }
                .overlay-right { right: 0; transform: translateX(0); }
                .container.right-panel-active .overlay-right { transform: translateX(20%); }
                form { background-color: #2D2D44; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 50px; height: 100%; text-align: center; }
                h1 { color: #E0E0E0; font-weight: bold; margin: 0; }
                p { font-size: 14px; font-weight: 100; line-height: 20px; letter-spacing: 0.5px; margin: 20px 0 30px; }
                span { color: #A0A0A0; font-size: 12px; }
                .social-container { margin: 20px 0; display: flex; gap: 15px; }
                .social-container a { border: 1px solid #444455; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; cursor: pointer; text-decoration: none; }
                input { background-color: #3A3A50; border: none; padding: 12px 15px; margin: 8px 0; width: 100%; color: #E0E0E0; border-radius: 5px; }
                input::placeholder { color: #A0A0A0; }
                button { border-radius: 20px; background: linear-gradient(to right, #6A00FF, #A000FF); border: none; color: #fff; font-size: 12px; font-weight: bold; padding: 12px 45px; letter-spacing: 1px; text-transform: uppercase; transition: transform 80ms ease-in; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
                button:active { transform: scale(0.95); }
                button.ghost { background-color: transparent; border: 1px solid #fff; box-shadow: none; }
                button:hover { opacity: 0.9; }
                a { color: #9A8CFF; font-size: 14px; text-decoration: none; margin: 15px 0; }
                .error-message { color: #ff7b7b; font-size: 12px; height: 16px; margin-top: 8px; }
            `}</style>
            <div className="page-container">
                <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
                    <div className="form-container sign-up-container">
                        <form onSubmit={handleSignUpSubmit}>
                            <h1>Sign Up</h1>
                            <div className="social-container">
                                <a href="#" className="social"><img src="/google.png" alt="Google" width="24" /></a>
                            </div>
                            <span>or use your email for registration</span>
                            <input type="text" placeholder="Name" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} required />
                            <input type="email" placeholder="Email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
                            <div className="error-message">{signUpError}</div>
                            <button type="submit">Sign Up</button>
                        </form>
                    </div>
                    <div className="form-container sign-in-container">
                        <form onSubmit={handleSignInSubmit}>
                            <h1>Sign In</h1>
                            <div className="social-container">
                                <a href="#" className="social"><img src="/google.png" alt="Google" width="24" /></a>
                            </div>
                            <span>or use your email for login</span>
                            <input type="email" placeholder="Email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required />
                            <div className="error-message">{loginError}</div>
                            <a href="#">Forgot Your Password?</a>
                            <button type="submit">Sign In</button>
                        </form>
                    </div>
                    <div className="overlay-container">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1>Welcome Back!</h1>
                                <p>To keep connected, please login with your personal info</p>
                                <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1>Hello, Friend!</h1>
                                <p>Enter your personal details and start your journey with us</p>
                                <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function Auth({ onLogin }) {
  return <LoginSignUpForm onLogin={onLogin} />;
}
