import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';

const BrowseRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    document.title = 'COOKit | Browse Recipes';
  }, []);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      const response = await axios.get(`/api/recipes?${params}`);
      setRecipes(response.data.recipes);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4" style={{ 
        color: '#00ffff', 
        fontWeight: '900',
        textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
        letterSpacing: '2px'
      }}>Browse Recipes</h1>

      {/* Recipes Grid */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <Row>
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <Col key={recipe._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <Card className="recipe-card h-100">
                    {recipe.images && recipe.images.length > 0 ? (
                      <Card.Img 
                        variant="top" 
                        src={`http://localhost:5000/${recipe.images[0]}`} 
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
                      <Link to={`/recipes/${recipe._id}`} className="mt-auto">
                        <Button variant="primary" size="sm" className="w-100">
                          View Recipe
                        </Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col className="text-center my-5">
                <h4 style={{ color: '#00d4ff' }}>No recipes found</h4>
                <p style={{ color: '#a0a0a0' }}>Be the first to share a recipe!</p>
              </Col>
            )}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <Pagination.Ellipsis key={page} disabled />;
                  }
                  return null;
                })}

                <Pagination.Next
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default BrowseRecipes;

