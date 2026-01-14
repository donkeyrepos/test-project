import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchRecipe = useCallback(async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data);

      // Check if user has rated this recipe
      if (user && response.data.ratings) {
        const userRatingObj = response.data.ratings.find(r => r.user === user._id);
        if (userRatingObj) {
          setUserRating(userRatingObj.rating);
        }
      }

      // Check if user has liked this recipe
      if (user && response.data.likes) {
        setIsLiked(response.data.likes.includes(user._id));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      setLoading(false);
    }
  }, [id, user]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`/api/comments/recipe/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipe();
    fetchComments();
  }, [fetchRecipe, fetchComments]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/recipes/${id}`);
      toast.success('Recipe deleted successfully');
      navigate('/recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      toast.error('Please login to rate this recipe');
      return;
    }

    try {
      const response = await axios.post(`/api/recipes/${id}/rate`, { rating });
      setRecipe(response.data.recipe);
      setUserRating(rating);
      toast.success('Rating submitted successfully');
    } catch (error) {
      console.error('Error rating recipe:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like this recipe');
      return;
    }

    try {
      if (isLiked) {
        const response = await axios.delete(`/api/recipes/${id}/like`);
        setRecipe(response.data.recipe);
        setIsLiked(false);
        toast.success('Recipe unliked');
      } else {
        const response = await axios.post(`/api/recipes/${id}/like`);
        setRecipe(response.data.recipe);
        setIsLiked(true);
        toast.success('Recipe liked');
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
      toast.error('Failed to update like');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setLoadingComments(true);
      const response = await axios.post('/api/comments', {
        recipeId: id,
        text: newComment
      });
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const canModify = () => {
    return user && (user._id === recipe?.author._id || isAdmin());
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container className="my-5 text-center">
        <h3>Recipe not found</h3>
        <Link to="/recipes">
          <Button variant="primary">Back to Recipes</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col lg={8}>
          {/* Recipe Image */}
          {recipe.images && recipe.images.length > 0 ? (
            <img
              src={`${process.env.REACT_APP_API_URL}/${recipe.images[0]}`}
              alt={recipe.title}
              className="recipe-detail-image mb-4 w-100"
            />
          ) : (
            <div className="recipe-detail-image bg-secondary d-flex align-items-center justify-content-center mb-4">
              <span className="text-white" style={{ fontSize: '5rem' }}>🍽️</span>
            </div>
          )}

          {/* Recipe Title and Info */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1 style={{
                color: '#00ffff',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.6)',
                fontWeight: '900'
              }}>
                {recipe.title}
              </h1>
              <p style={{ color: '#00ffff', fontSize: '1rem', fontWeight: '500' }}>
                By <strong style={{ color: '#ffffff' }}>{recipe.author.username}</strong> • {new Date(recipe.createdAt).toLocaleDateString()}
              </p>
            </div>
            {canModify() && (
              <div>
                <Link to={`/edit/${recipe._id}`}>
                  <Button variant="warning" size="sm" className="me-2">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="mb-4">
            <Badge bg="primary" className="me-2 badge-custom">{recipe.category}</Badge>
            <Badge bg="secondary" className="me-2 badge-custom">{recipe.difficulty}</Badge>
            <Badge bg="info" className="badge-custom">
              ⏱️ {recipe.prepTime + recipe.cookTime} mins total
            </Badge>
          </div>

          {/* Social Media Share Buttons */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">Share this Recipe</h5>
              <div className="d-flex flex-wrap gap-2">
                {/* Facebook Share */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
                  }}
                  style={{ backgroundColor: '#1877F2', borderColor: '#1877F2' }}
                >
                  📘 Facebook
                </Button>

                {/* X (Twitter) Share */}
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Check out this recipe: ${recipe.title}`);
                    window.open(`https://x.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
                  }}
                  style={{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF' }}
                >
                  𝕏 Twitter
                </Button>

                {/* WhatsApp Share */}
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Check out this recipe: ${recipe.title}\n`);
                    window.open(`https://wa.me/?text=${text}${url}`, '_blank');
                  }}
                  style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                >
                  💬 WhatsApp
                </Button>

                {/* Pinterest Share */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const description = encodeURIComponent(recipe.description);
                    const media = recipe.images && recipe.images.length > 0
                      ? encodeURIComponent(`http://localhost:5000/${recipe.images[0]}`)
                      : '';
                    window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${description}&media=${media}`, '_blank', 'width=600,height=400');
                  }}
                  style={{ backgroundColor: '#E60023', borderColor: '#E60023' }}
                >
                  📌 Pinterest
                </Button>

                {/* Copy Link */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  🔗 Copy Link
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Rating and Like Section */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>Rate this Recipe</h5>
                  <div className="d-flex align-items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          cursor: 'pointer',
                          fontSize: '2rem',
                          color: star <= (hoverRating || userRating) ? '#FFD700' : '#ddd',
                          transition: 'color 0.2s'
                        }}
                      >
                        ★
                      </span>
                    ))}
                    {userRating > 0 && (
                      <span className="ms-2" style={{ color: '#00ffff' }}>
                        Your rating: {userRating}/5
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    Average: {recipe.averageRating || 0} ⭐ ({recipe.ratingsCount || 0} ratings)
                  </div>
                </Col>
                <Col md={6} className="text-md-end">
                  <Button
                    variant={isLiked ? 'danger' : 'outline-danger'}
                    onClick={handleLike}
                    className="mt-3 mt-md-0"
                  >
                    {isLiked ? '❤️ Liked' : '🤍 Like'} ({recipe.likesCount || 0})
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Description */}
          <Card className="mb-4">
            <Card.Body>
              <h4>Description</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.description}</p>
            </Card.Body>
          </Card>

          {/* Ingredients */}
          <Card className="mb-4">
            <Card.Body>
              <h4>Ingredients</h4>
              <ListGroup variant="flush">
                {recipe.ingredients.map((ingredient, index) => (
                  <ListGroup.Item key={index}>
                    ✓ {ingredient}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Instructions */}
          <Card className="mb-4">
            <Card.Body>
              <h4>Instructions</h4>
              <ListGroup variant="flush" as="ol" numbered>
                {recipe.instructions.map((instruction, index) => (
                  <ListGroup.Item key={index} as="li">
                    {instruction}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Attachments */}
          {recipe.attachments && recipe.attachments.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h4>Attachments</h4>
                <ListGroup variant="flush">
                  {recipe.attachments.map((attachment, index) => (
                    <ListGroup.Item key={index}>
                      <a
                        href={`http://localhost:5000/${attachment.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📎 {attachment.filename}
                      </a>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {/* Source URLs */}
          {recipe.referenceUrls && recipe.referenceUrls.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h4>Source Links</h4>
                <p className="text-muted mb-3">
                  External resources and original references for this recipe
                </p>
                <ListGroup variant="flush">
                  {recipe.referenceUrls.map((url, index) => (
                    <ListGroup.Item key={index}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#00ffff',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>🔗</span>
                        <span style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                          {url}
                        </span>
                      </a>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {/* Comments Section */}
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-4">Comments ({comments.length})</h4>

              {/* Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-4">
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      maxLength={1000}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loadingComments || !newComment.trim()}
                  >
                    {loadingComments ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              ) : (
                <div className="alert alert-info mb-4">
                  Please <Link to="/login">login</Link> to leave a comment.
                </div>
              )}

              {/* Comments List */}
              <div>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="border-bottom pb-3 mb-3"
                      style={{ borderColor: '#00ffff20' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong style={{ color: '#00ffff' }}>
                            {comment.user.username}
                          </strong>
                          <small className="text-muted ms-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        {user && (user._id === comment.user._id || isAdmin()) && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {comment.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card className="mb-4 sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <h5 className="mb-3">Recipe Info</h5>
              <div className="mb-3">
                <strong>Category:</strong>
                <div className="text-muted">{recipe.category}</div>
              </div>
              <div className="mb-3">
                <strong>Difficulty:</strong>
                <div className="text-muted">{recipe.difficulty}</div>
              </div>
              <div className="mb-3">
                <strong>Preparation Time:</strong>
                <div className="text-muted">{recipe.prepTime} minutes</div>
              </div>
              <div className="mb-3">
                <strong>Cooking Time:</strong>
                <div className="text-muted">{recipe.cookTime} minutes</div>
              </div>
              <div className="mb-3">
                <strong>Total Time:</strong>
                <div className="text-muted">{recipe.prepTime + recipe.cookTime} minutes</div>
              </div>
              <div className="mb-3">
                <strong>Servings:</strong>
                <div className="text-muted">{recipe.servings} servings</div>
              </div>
            </Card.Body>
          </Card>

          {/* Additional Images */}
          {recipe.images && recipe.images.length > 1 && (
            <Card>
              <Card.Body>
                <h5 className="mb-3">More Images</h5>
                <Row>
                  {recipe.images.slice(1).map((image, index) => (
                    <Col xs={6} key={index} className="mb-2">
                      <img
                        src={`${process.env.REACT_APP_API_URL}/${image}`}
                        alt={`${recipe.title} ${index + 2}`}
                        className="img-fluid rounded"
                      />
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this recipe? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Recipe
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecipeDetail;

