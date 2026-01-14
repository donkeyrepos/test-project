import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

const Home = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'COOKit | Συνταγές Μαγειρικής/Cooking Recipes';
  }, []);

  useEffect(() => {
    const fetchFeaturedRecipes = async () => {
      try {
        const response = await axios.get('/api/recipes/featured?limit=6');
        setFeaturedRecipes(response.data.recipes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured recipes:', error);
        setLoading(false);
      }
    };

    fetchFeaturedRecipes();
  }, []);

  return (
    <>
      {/* Cyberpunk Hero Section - Redesigned Layout */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 0 60px'
      }}>
        {/* Animated Background Grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.3
        }}></div>

        <Container style={{position: 'relative', zIndex: 2}}>
          <Row className="align-items-center">
            {/* Left Side - Main Content */}
            <Col lg={6} className="mb-4 mb-lg-0">
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 8px 32px rgba(0, 255, 255, 0.15)'
              }}>
                <p style={{
                  color: '#00ffff',
                  fontSize: '1.4rem',
                  marginBottom: '30px',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                  lineHeight: '1.8'
                }}>
                  Transform your cooking ideas into recipes<br />
                  Join an amazing community of food enthusiasts<br />
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/upload">
                    <Button
                      size="lg"
                      style={{
                        background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
                        border: 'none',
                        color: '#0a0e27',
                        fontWeight: '700',
                        padding: '15px 40px',
                        borderRadius: '50px',
                        boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      Upload Recipe
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>

            {/* Right Side - Feature Cards in Vertical Stack */}
            <Col lg={6}>
              <div className="d-flex flex-column gap-3">
                {/* Browse Card */}
                <Link to="/browse" style={{textDecoration: 'none'}}>
                  <div style={{
                    background: 'rgba(0, 255, 255, 0.1)',
                    border: '2px solid #00ffff',
                    borderRadius: '15px',
                    padding: '25px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(10px)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
                  }}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{fontSize: '3rem'}}>⚙️</div>
                      <div>
                        <h4 style={{color: '#00ffff', fontWeight: '700', marginBottom: '5px'}}>DISCOVER RECIPES</h4>
                        <p style={{color: '#a0a0a0', margin: 0, fontSize: '0.9rem'}}>Explore the digital cookbook</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Search & Filter Card */}
                <Link to="/search" style={{textDecoration: 'none'}}>
                  <div style={{
                    background: 'rgba(255, 0, 255, 0.1)',
                    border: '2px solid #ff00ff',
                    borderRadius: '15px',
                    padding: '25px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(10px)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.3)';
                  }}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{fontSize: '3rem'}}>🔍</div>
                      <div>
                        <h4 style={{color: '#ff00ff', fontWeight: '700', marginBottom: '5px'}}>SEARCH RECIPES</h4>
                        <p style={{color: '#a0a0a0', margin: 0, fontSize: '0.9rem'}}>Advanced recipe discovery</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Share Card */}
                <Link to="/upload" style={{textDecoration: 'none'}}>
                  <div style={{
                    background: 'rgba(255, 255, 0, 0.1)',
                    border: '2px solid #ffff00',
                    borderRadius: '15px',
                    padding: '25px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(10px)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 255, 0, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 0, 0.3)';
                  }}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{fontSize: '3rem'}}>👨‍🍳</div>
                      <div>
                        <h4 style={{color: '#ffff00', fontWeight: '700', marginBottom: '5px'}}>CREATE RECIPES</h4>
                        <p style={{color: '#a0a0a0', margin: 0, fontSize: '0.9rem'}}>Upload recipes to the network</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Recipes Section - Light Blue Background */}
      <div style={{
        background: 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #ADD8E6 100%)',
        padding: '80px 0',
        position: 'relative'
      }}>
        <Container>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '900',
              color: '#1a1a2e',
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Featured Recipes
            </h2>
            <div style={{
              width: '100px',
              height: '4px',
              background: 'linear-gradient(90deg, #4A90E2 0%, #5B9BD5 100%)',
              margin: '0 auto',
              boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)'
            }}></div>
          </div>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status" style={{color: '#4A90E2'}}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Row>
              {featuredRecipes.length > 0 ? (
                featuredRecipes.map((recipe, index) => (
                  <Col key={recipe._id} xs={12} sm={6} md={4} className="mb-4">
                    <div style={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}>
                      {recipe.images && recipe.images.length > 0 ? (
                        <div style={{position: 'relative', height: '200px', overflow: 'hidden'}}>
                          <img
                            src={`${process.env.REACT_APP_API_URL}/${recipe.images[0]}`}
                            alt={recipe.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          height: '200px',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{fontSize: '4rem'}}>🍽️</span>
                        </div>
                      )}
                      <div style={{padding: '20px'}}>
                        <h5 style={{
                          color: '#1a1a2e',
                          fontWeight: '700',
                          marginBottom: '10px'
                        }}>
                          {recipe.title}
                        </h5>
                        <p style={{color: '#666', fontSize: '0.9rem', marginBottom: '15px'}}>
                          {recipe.description.substring(0, 100)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span style={{
                            background: '#4A90E2',
                            color: 'white',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {recipe.category}
                          </span>
                          <span style={{
                            background: '#e0e0e0',
                            color: '#333',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {recipe.difficulty}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div style={{color: '#666', fontSize: '0.85rem'}}>
                            ⏱️ {recipe.prepTime + recipe.cookTime} mins | 🍽️ {recipe.servings} servings
                          </div>
                          {recipe.averageRating > 0 && (
                            <div style={{
                              color: '#FFD700',
                              fontSize: '0.9rem',
                              fontWeight: '700'
                            }}>
                              ⭐ {recipe.averageRating}
                            </div>
                          )}
                        </div>
                        <Link to={`/recipes/${recipe._id}`}>
                          <Button
                            size="sm"
                            className="w-100"
                            style={{
                              background: 'linear-gradient(135deg, #4A90E2 0%, #5B9BD5 100%)',
                              border: 'none',
                              color: 'white',
                              fontWeight: '700',
                              padding: '10px',
                              borderRadius: '25px',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontSize: '0.85rem'
                            }}
                          >
                            View Recipe
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Col>
                ))
              ) : (
                <Col className="text-center">
                  <p style={{color: '#333', fontSize: '1.2rem'}}>No recipes available yet. Be the first to share one!</p>
                </Col>
              )}
            </Row>
          )}
          {featuredRecipes.length > 0 && (
            <div className="text-center mt-5">
              <Link to="/browse">
                <Button
                  size="lg"
                  style={{
                    background: 'linear-gradient(135deg, #4A90E2 0%, #5B9BD5 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '700',
                    padding: '15px 50px',
                    borderRadius: '50px',
                    boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}
                >
                  View All Recipes
                </Button>
              </Link>
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default Home;

