import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/cool-dude-karaoke-logo-v2-nobg.png';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.errors?.[0]?.msg
        || err.message
        || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-wrap">
          <img src={logo} alt="Cool Dude Karaoke" className="auth-logo" />
          <span className="logo-subtitle">AMPED</span>
        </div>
        <h2>{isLogin ? 'Welcome Back, Dude' : 'Join the Party'}</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Hold tight...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <button
          className="auth-toggle"
          onClick={() => { setIsLogin(!isLogin); setError(null); }}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
