import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.title = 'COOKit | Cooking Assistant';
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkAIStatus();
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: `Hi ${user?.username}! I'm your Cooking Assistant. I'm here to help you with cooking questions, recipe suggestions, techniques, and more! What would you like to know?`,
      timestamp: new Date().toISOString()
    }]);
  }, [user]);

  const checkAIStatus = async () => {
    try {
      const response = await axios.get('/api/ai-assistant/status');
      setAiAvailable(response.data.available);
      if (!response.data.available) {
        setError(response.data.message);
      }
    } catch (err) {
      setAiAvailable(false);
      setError('AI Assistant is currently unavailable.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axios.post('/api/ai-assistant/chat', {
        message: inputMessage,
        conversationHistory
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get response from AI assistant');
      console.error('AI Assistant Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! How can I help you today?`,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0e27 100%)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0, 255, 255, 0.2)',
            border: '2px solid rgba(0, 255, 255, 0.3)'
          }}>
            <div className="text-center mb-4">
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '10px'
              }}>
                🤖 Cooking Assistant
              </h1>
              <p style={{ color: '#00ffff', fontSize: '1.1rem' }}>
                Your personal digital chef is here to help!
              </p>
            </div>

            {!aiAvailable && (
              <Alert variant="warning" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Chat Messages */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              padding: '20px',
              height: '500px',
              overflowY: 'auto',
              marginBottom: '20px',
              border: '1px solid rgba(0, 255, 255, 0.2)'
            }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '15px',
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    padding: '12px 18px',
                    borderRadius: '15px',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: msg.role === 'user' ? '#0a0e27' : '#ffffff',
                    border: msg.role === 'assistant' ? '1px solid rgba(255, 0, 255, 0.3)' : 'none',
                    boxShadow: msg.role === 'user' 
                      ? '0 4px 15px rgba(0, 255, 255, 0.3)'
                      : '0 4px 15px rgba(255, 0, 255, 0.2)'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-center">
                  <Spinner animation="border" style={{ color: '#00ffff' }} />
                  <p style={{ color: '#00ffff', marginTop: '10px' }}>Thinking...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            {/* Input Form */}
            <Form onSubmit={handleSendMessage}>
              <Row>
                <Col xs={12} md={9} className="mb-2 mb-md-0">
                  <Form.Control
                    type="text"
                    placeholder="Ask me anything about cooking..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={loading || !aiAvailable}
                    className="ai-assistant-input"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(0, 255, 255, 0.3)',
                      color: '#ffffff',
                      padding: '12px'
                    }}
                  />
                </Col>
                <Col xs={6} md={2}>
                  <Button
                    type="submit"
                    disabled={loading || !aiAvailable || !inputMessage.trim()}
                    className="w-100"
                    style={{
                      background: 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)',
                      border: 'none',
                      fontWeight: '700',
                      padding: '12px'
                    }}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </Button>
                </Col>
                <Col xs={6} md={1}>
                  <Button
                    variant="outline-danger"
                    onClick={handleClearChat}
                    className="w-100"
                    style={{ padding: '12px' }}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AIAssistant;

