import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { login as apiLogin } from '../api';
import { Lock } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiLogin(username, password);
      if (response.data && response.data.token) {
        login(response.data.token);
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#F5EEDC',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#1F5038',
            padding: '1rem',
            borderRadius: '50%',
            color: '#F5EEDC',
            boxShadow: '0 4px 0 #132A13'
          }}>
            <Lock size={32} />
          </div>
        </div>

        <h2 style={{
          color: '#1F5038',
          marginBottom: '0.5rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          fontSize: '1.8rem'
        }}>
          Staff Login
        </h2>

        <p style={{
          color: '#D82B27',
          marginBottom: '2rem',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          California Burrito Analytics
        </p>

        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            color: '#D82B27',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: '2px solid #D82B27'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} autoComplete="off">
          <div>
            <input
              type="text"
              name="fake_user_field_123"
              id="fake_user_field_123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="off"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '2px solid #1F5038',
                backgroundColor: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1F5038',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <input
              type="password"
              name="fake_pass_field_123"
              id="fake_pass_field_123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '2px solid #1F5038',
                backgroundColor: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1F5038',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={isLoading}
            style={{
              width: 'auto',
              minWidth: '200px',
              display: 'block',
              margin: '1rem auto 0 auto',
              padding: '1rem 1rem 2.1rem 1rem',
              fontSize: '1.1rem',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
