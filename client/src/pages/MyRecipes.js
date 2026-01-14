import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'COOKit | My Recipes';
  }, []);

  const fetchMyRecipes = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axios.get(`/api/recipes/user/${user._id}`);
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyRecipes();
    }
  }, [user, fetchMyRecipes]);

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{
          color: '#00ffff',
          fontWeight: '900',
          textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
          letterSpacing: '2px'
        }}>My Recipes</h1>
        {recipes.length > 0 && (
          <Link to="/upload">
            <Button variant="primary">Upload Recipe</Button>
          </Link>
        )}
      </div>

      {recipes.length > 0 ? (
        <Row>
          {recipes.map((recipe) => (
            <Col key={recipe._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="recipe-card h-100">
                {recipe.images && recipe.images.length > 0 ? (
                  <Card.Img
                    variant="top"
                    src={`${process.env.REACT_APP_API_URL}/${recipe.images[0]}`}
                    className="recipe-image"
                    alt={recipe.title}
                  />
                ) : (
                  <div className="recipe-image bg-secondary d-flex align-items-center justify-content-center">
                    <span className="text-white fs-1">🍽️</span>
                  </div>
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-truncate">{recipe.title}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {recipe.description.substring(0, 80)}...
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary">{recipe.category}</span>
                    <span className="badge bg-secondary">{recipe.difficulty}</span>
                  </div>
                  <div className="text-muted small mb-3">
                    ⏱️ {recipe.prepTime + recipe.cookTime} mins
                  </div>
                  <div className="d-flex gap-2 mt-auto">
                    <Link to={`/recipes/${recipe._id}`} className="flex-grow-1">
                      <Button variant="primary" size="sm" className="w-100">
                        View
                      </Button>
                    </Link>
                    <Link to={`/edit/${recipe._id}`} className="flex-grow-1">
                      <Button variant="warning" size="sm" className="w-100">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center my-5">
          <h4 style={{ color: '#ffffff' }}>You haven't created any recipes yet</h4>
          <p style={{ color: '#00ffff', fontSize: '1.1rem' }} className="mb-4">Start sharing your cooking creations with the world!</p>
          <Link to="/upload">
            <Button variant="primary" size="lg">Upload Your First Recipe</Button>
          </Link>
        </div>
      )}
    </Container>
  );
};

export default MyRecipes;

