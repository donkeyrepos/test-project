import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Pagination } from 'react-bootstrap';
import axios from 'axios';

const SearchRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Appetizer', 'Other'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    document.title = 'COOKit | Search Recipes';
  }, []);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (difficulty !== 'All') params.append('difficulty', difficulty);

      const response = await axios.get(`/api/recipes?${params}`);
      setRecipes(response.data.recipes);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setLoading(false);
    }
  }, [search, category, difficulty, currentPage]);

  useEffect(() => {
    if (hasSearched) {
      fetchRecipes();
    }
  }, [hasSearched, fetchRecipes]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setHasSearched(true);
    fetchRecipes();
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4" style={{ 
        color: '#00ffff', 
        fontWeight: '900',
        textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
        letterSpacing: '2px'
      }}>Search Recipes</h1>
      
      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col md={12}>
          <Form onSubmit={handleSearchSubmit}>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search recipes by title, description or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="primary" type="submit">
                Search
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Select 
            value={category} 
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6} className="mb-3">
          <Form.Select 
            value={difficulty} 
            onChange={(e) => {
              setDifficulty(e.target.value);
              setCurrentPage(1);
            }}
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Recipes Grid */}
      {!hasSearched ? (
        <div className="text-center my-5">
          <div style={{
            padding: '60px 20px',
            background: 'rgba(0, 255, 255, 0.05)',
            borderRadius: '15px',
            border: '2px dashed rgba(0, 255, 255, 0.3)'
          }}>
            <div style={{fontSize: '4rem', marginBottom: '20px'}}>🔍</div>
            <h3 style={{color: '#00ffff', marginBottom: '15px'}}>Find your perfect cooking recipe</h3>
            <p style={{color: '#a0a0a0', fontSize: '1.1rem'}}>
              Use the search box and filters above
            </p>
          </div>
        </div>
      ) : loading ? (
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
                <h4>No recipes found</h4>
                <p>Try adjusting your search or filters</p>
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

export default SearchRecipes;

