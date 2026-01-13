import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const hasVerifiedRef = useRef(false);

  const verifyEmail = useCallback(async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      setStatus('success');
      setMessage(response.data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Email verification failed. The link may be invalid or expired.');
    }
  }, [token, navigate]);

  useEffect(() => {
    // Only verify once, even if React Strict Mode causes double render
    if (!hasVerifiedRef.current && token) {
      hasVerifiedRef.current = true;
      verifyEmail();
    }
  }, [token, verifyEmail]);

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Card style={{
          maxWidth: '500px',
          width: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0e27 100%)',
          border: '2px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 255, 255, 0.2)'
        }}>
          <Card.Body className="text-center p-5">
            {status === 'verifying' && (
              <>
                <Spinner animation="border" style={{ color: '#00ffff', width: '60px', height: '60px' }} />
                <h3 style={{ color: '#00ffff', marginTop: '20px' }}>Verifying Your Email...</h3>
                <p style={{ color: '#a0a0a0' }}>Please wait while we verify your account.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
                <h2 style={{
                  background: 'linear-gradient(135deg, #00ffff 0%, #00ff00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '900',
                  marginBottom: '20px'
                }}>
                  Email Verified!
                </h2>
                <Alert variant="success" style={{ background: 'rgba(0, 255, 0, 0.1)', border: '1px solid rgba(0, 255, 0, 0.3)' }}>
                  {message}
                </Alert>
                <p style={{ color: '#00ffff', marginTop: '20px' }}>
                  Redirecting to login page...
                </p>
                <Link to="/login">
                  <Button style={{
                    background: 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)',
                    border: 'none',
                    fontWeight: '700',
                    padding: '12px 30px',
                    marginTop: '10px'
                  }}>
                    Go to Login Now
                  </Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>❌</div>
                <h2 style={{
                  background: 'linear-gradient(135deg, #ff0000 0%, #ff00ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '900',
                  marginBottom: '20px'
                }}>
                  Verification Failed
                </h2>
                <Alert variant="danger" style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)' }}>
                  {message}
                </Alert>
                <div className="mt-4">
                  <Link to="/login">
                    <Button variant="outline-light" className="me-2">
                      Back to Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button style={{
                      background: 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)',
                      border: 'none',
                      fontWeight: '700'
                    }}>
                      Register Again
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default VerifyEmail;

