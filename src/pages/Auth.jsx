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
    const [signUpError, setSignUpError] = useState('');

    const handleSignUpClick = () => {
        setLoginError('');
        setIsRightPanelActive(true);
    };
    const handleSignInClick = () => {
        setSignUpError('');
        setIsRightPanelActive(false);
    };

    // Handler for the Sign Up form submission
    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setSignUpError('');
        try {
            const response = await fetch('https://voultback.onrender.com/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: signUpName, email: signUpEmail, password: signUpPassword }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to sign up');
            }

            setSignInEmail(signUpEmail);
            setIsRightPanelActive(false);

        } catch (error) {
            setSignUpError(error.message);
        }
    };

    // Handler for the Sign In form submission
    const handleSignInSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const response = await fetch('https://voultback.onrender.com/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signInEmail, password: signInPassword }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to sign in');
            }

            localStorage.setItem('token', data.token);
            onLogin();
            navigate('/dashboard');

        } catch (error) {
            setLoginError(error.message);
            setSignInPassword('');
        }
    };

    return (
        <>
            <style>{`
                /* ===== BASE / DESKTOP STYLES ===== */
                .auth-page-container { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background: #0b0616; padding: 20px; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; color: #E0E0E0; }
                .auth-brand { text-align: center; margin-bottom: 28px; }
                .auth-brand-name { font-size: 36px; font-weight: 800; letter-spacing: 2px; background: linear-gradient(135deg, #6A11CB 0%, #2575FC 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; }
                .auth-brand-tagline { font-size: 14px; color: #706888; margin-top: 6px; letter-spacing: 0.5px; }
                .auth-container { position: relative; width: 800px; max-width: 100%; min-height: 500px; overflow: hidden; background-color: #110a1f; border-radius: 16px; box-shadow: 0 14px 28px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3); }
                .auth-form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
                .auth-sign-in-container { left: 0; width: 50%; z-index: 2; }
                .auth-sign-up-container { left: 0; width: 50%; z-index: 1; opacity: 0; }
                .auth-container.right-panel-active .auth-sign-in-container { transform: translateX(100%); }
                .auth-container.right-panel-active .auth-sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: authShow 0.6s; }
                @keyframes authShow { 0%, 49.99% { opacity: 0; z-index: 1; } 50%, 100% { opacity: 1; z-index: 5; } }
                .auth-overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
                .auth-container.right-panel-active .auth-overlay-container { transform: translateX(-100%); }
                .auth-overlay { background: linear-gradient(135deg, #6A11CB 0%, #2575FC 100%); color: #fff; position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
                .auth-container.right-panel-active .auth-overlay { transform: translateX(50%); }
                .auth-overlay-panel { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 40px; text-align: center; top: 0; height: 100%; width: 50%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
                .auth-overlay-left { transform: translateX(-20%); }
                .auth-container.right-panel-active .auth-overlay-left { transform: translateX(0); }
                .auth-overlay-right { right: 0; transform: translateX(0); }
                .auth-container.right-panel-active .auth-overlay-right { transform: translateX(20%); }
                .auth-container form { background-color: #110a1f; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 50px; height: 100%; text-align: center; }
                .auth-container h1 { color: #E0E0E0; font-weight: bold; margin: 0; font-size: 28px; }
                .auth-container p { font-size: 14px; font-weight: 300; line-height: 20px; letter-spacing: 0.5px; margin: 20px 0 30px; color: rgba(255,255,255,0.85); }
                .auth-container span { color: #A0A0A0; font-size: 12px; }
                .auth-social-container { margin: 20px 0; display: flex; gap: 15px; }
                .auth-social-container a { border: 1px solid #2a1f40; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; cursor: pointer; text-decoration: none; }
                .auth-container input { background-color: #1a1030; border: 1px solid #2a1f40; padding: 12px 15px; margin: 8px 0; width: 100%; color: #E0E0E0; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; box-sizing: border-box; outline: none; }
                .auth-container input:focus { border-color: #6A11CB; }
                .auth-container input::placeholder { color: #706888; }
                .auth-container button { border-radius: 25px; background: linear-gradient(135deg, #6A11CB 0%, #2575FC 100%); border: none; color: #fff; font-size: 12px; font-weight: bold; padding: 12px 45px; letter-spacing: 1px; text-transform: uppercase; transition: transform 80ms ease-in, box-shadow 0.2s; cursor: pointer; box-shadow: 0 4px 15px rgba(106,17,203,0.3); }
                .auth-container button:active { transform: scale(0.95); }
                .auth-container button.ghost { background: transparent; border: 1px solid #fff; box-shadow: none; }
                .auth-container button:hover { box-shadow: 0 6px 20px rgba(106,17,203,0.5); }
                .auth-container button.ghost:hover { background: rgba(255,255,255,0.1); box-shadow: none; }
                .auth-container a { color: #2575FC; font-size: 14px; text-decoration: none; margin: 15px 0; }
                .auth-container a:hover { text-decoration: underline; }
                .auth-error-message { color: #ff7b7b; font-size: 12px; height: 16px; margin-top: 8px; }
                .auth-mobile-toggle { display: none; }

                /* ===== MOBILE STYLES ===== */
                @media (max-width: 768px) {
                    .auth-brand-name { font-size: 28px; }
                    .auth-brand-tagline { font-size: 13px; }
                    .auth-brand { margin-bottom: 20px; }
                    .auth-container { width: 100%; min-height: auto; border-radius: 12px; overflow: hidden; }
                    .auth-overlay-container { display: none; }
                    .auth-form-container { position: absolute; top: 0; left: 0; width: 100% !important; height: 100%; transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out; }
                    .auth-sign-in-container { opacity: 1; transform: translateX(0); z-index: 2; position: relative; }
                    .auth-sign-up-container { opacity: 0; transform: translateX(100%); z-index: 1; position: absolute; top: 0; pointer-events: none; }
                    .auth-container.right-panel-active .auth-sign-in-container { opacity: 0; transform: translateX(-100%); z-index: 1; position: absolute; pointer-events: none; }
                    .auth-container.right-panel-active .auth-sign-up-container { opacity: 1; transform: translateX(0); z-index: 2; position: relative; pointer-events: auto; animation: none; }
                    .auth-container form { padding: 40px 24px; height: auto; min-height: 420px; }
                    .auth-container h1 { font-size: 24px; margin-bottom: 8px; }
                    .auth-container input { padding: 14px 15px; }
                    .auth-container button { padding: 14px 40px; font-size: 13px; width: 100%; margin-top: 8px; }
                    .auth-mobile-toggle { display: block; margin-top: 24px; font-size: 14px; color: #A0A0A0; }
                    .auth-mobile-toggle span { color: #2575FC; cursor: pointer; font-weight: 600; font-size: 14px; }
                    .auth-mobile-toggle span:hover { text-decoration: underline; }
                }
            `}</style>
            <div className="auth-page-container">
                <div className="auth-brand">
                    <h2 className="auth-brand-name">VOULTIFY</h2>
                    <p className="auth-brand-tagline">Your files, encrypted & secure</p>
                </div>
                <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="auth-container">
                    <div className="auth-form-container auth-sign-up-container">
                        <form onSubmit={handleSignUpSubmit}>
                            <h1>Sign Up</h1>
                            <div className="auth-social-container">
                                {/* <a href="#" className="social"><img src="/google.png" alt="Google" width="24" /></a> */}
                            </div>
                            {/* <span>or use your email for registration</span> */}
                            <input type="text" placeholder="Name" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} required />
                            <input type="email" placeholder="Email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required />
                            <div className="auth-error-message">{signUpError}</div>
                            <button type="submit">Sign Up</button>
                            <div className="auth-mobile-toggle">
                                Already have an account? <span onClick={handleSignInClick}>Sign In</span>
                            </div>
                        </form>
                    </div>
                    <div className="auth-form-container auth-sign-in-container">
                        <form onSubmit={handleSignInSubmit}>
                            <h1>Sign In</h1>
                            <div className="auth-social-container">
                                {/* <a href="#" className="social"><img src="/google.png" alt="Google" width="24" /></a> */}
                            </div>
                            {/* <span>or use your email for login</span> */}
                            <input type="email" placeholder="Email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required />
                            <div className="auth-error-message">{loginError}</div>
                            <a href="#">Forgot Your Password?</a>
                            <button type="submit">Sign In</button>
                            <div className="auth-mobile-toggle">
                                Don't have an account? <span onClick={handleSignUpClick}>Sign Up</span>
                            </div>
                        </form>
                    </div>
                    <div className="auth-overlay-container">
                        <div className="auth-overlay">
                            <div className="auth-overlay-panel auth-overlay-left">
                                <h1>Welcome Back!</h1>
                                <p>To keep connected, please login with your personal info</p>
                                <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
                            </div>
                            <div className="auth-overlay-panel auth-overlay-right">
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







