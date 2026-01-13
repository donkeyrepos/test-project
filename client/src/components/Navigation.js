import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar
      expand="lg"
      sticky="top"
      style={{
        background: 'rgba(10, 14, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 255, 255, 0.2)'
      }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            fontSize: '2.8rem',
            fontWeight: '900',
            fontFamily: "'Righteous', 'Orbitron', 'Poppins', sans-serif",
            background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
            letterSpacing: '4px'
          }}
        >
          COOKit
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{borderColor: '#00ffff'}} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              style={{
                color: '#00ffff',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
                padding: '0.5rem 0.75rem'
              }}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/browse"
              style={{
                color: '#00ffff',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
                padding: '0.5rem 0.75rem'
              }}
            >
              Browse
            </Nav.Link>
            {user && (
              <>
                <Nav.Link
                  as={Link}
                  to="/upload"
                  style={{
                    color: '#ff00ff',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  Upload
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/my-recipes"
                  style={{
                    color: '#ff00ff',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  My Recipes
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/assistant"
                  style={{
                    color: '#00ff00',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  Assistant
                </Nav.Link>
              </>
            )}
            {isAdmin() && (
              <Nav.Link
                as={Link}
                to="/manage"
                style={{
                  color: '#ffff00',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  fontSize: '0.95rem',
                  padding: '0.5rem 0.75rem'
                }}
              >
                Manage
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-2" style={{color: '#ffffff', fontSize: '0.9rem'}}>
                  <strong style={{color: '#00ffff'}}>{user.username}</strong>
                  {isAdmin() && (
                    <span
                      className="badge ms-1"
                      style={{
                        background: 'linear-gradient(135deg, #ffff00 0%, #ff8000 100%)',
                        color: '#0a0e27',
                        fontWeight: '700',
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        boxShadow: '0 0 10px rgba(255, 255, 0, 0.5)'
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </Navbar.Text>
                <Button
                  size="sm"
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '2px solid #ff00ff',
                    color: '#ff00ff',
                    fontWeight: '700',
                    borderRadius: '25px',
                    padding: '4px 16px',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #ff00ff 0%, #ff0080 100%)';
                    e.target.style.color = '#0a0e27';
                    e.target.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#ff00ff';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <Button
                    size="sm"
                    className="me-2"
                    style={{
                      background: 'transparent',
                      border: '2px solid #00ffff',
                      color: '#00ffff',
                      fontWeight: '700',
                      borderRadius: '25px',
                      padding: '5px 20px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)';
                      e.target.style.color = '#0a0e27';
                      e.target.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#00ffff';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button
                    size="sm"
                    style={{
                      background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
                      border: 'none',
                      color: '#0a0e27',
                      fontWeight: '700',
                      borderRadius: '25px',
                      padding: '5px 20px',
                      boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.boxShadow = '0 0 25px rgba(0, 255, 255, 0.8)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Register
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;

