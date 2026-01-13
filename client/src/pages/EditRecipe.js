import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Breakfast',
    difficulty: 'Medium',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [''],
    instructions: ['']
  });
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [referenceUrls, setReferenceUrls] = useState(['']);

  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Appetizer', 'Other'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const fetchRecipe = useCallback(async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      const recipe = response.data;

      setFormData({
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        difficulty: recipe.difficulty,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions
      });

      // Set reference URLs if they exist
      if (recipe.referenceUrls && recipe.referenceUrls.length > 0) {
        setReferenceUrls(recipe.referenceUrls);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      navigate('/recipes');
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, '']
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const removeInstruction = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({ ...formData, instructions: newInstructions });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleAttachmentChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const handleReferenceUrlChange = (index, value) => {
    const newUrls = [...referenceUrls];
    newUrls[index] = value;
    setReferenceUrls(newUrls);
  };

  const addReferenceUrl = () => {
    setReferenceUrls([...referenceUrls, '']);
  };

  const removeReferenceUrl = (index) => {
    const newUrls = referenceUrls.filter((_, i) => i !== index);
    // If no URLs left, keep one empty field
    setReferenceUrls(newUrls.length > 0 ? newUrls : ['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.ingredients.some(ing => !ing.trim())) {
      toast.error('Please fill in all ingredients or remove empty fields');
      return;
    }
    
    if (formData.instructions.some(inst => !inst.trim())) {
      toast.error('Please fill in all instructions or remove empty fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const data = new FormData();
      
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('difficulty', formData.difficulty);
      data.append('prepTime', formData.prepTime);
      data.append('cookTime', formData.cookTime);
      data.append('servings', formData.servings);
      data.append('ingredients', JSON.stringify(formData.ingredients));
      data.append('instructions', JSON.stringify(formData.instructions));
      
      images.forEach(image => {
        data.append('images', image);
      });
      
      attachments.forEach(attachment => {
        data.append('attachments', attachment);
      });

      // Append reference URLs (filter out empty ones)
      const validUrls = referenceUrls.filter(url => url.trim() !== '');
      data.append('referenceUrls', JSON.stringify(validUrls));

      await axios.put(`/api/recipes/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Recipe updated successfully!');
      navigate(`/recipes/${id}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      const message = error.response?.data?.message || 'Failed to update recipe';
      toast.error(message);
      setSubmitting(false);
    }
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

  return (
    <Container className="my-5">
      <Card className="shadow">
        <Card.Body className="p-4">
          <h2 className="mb-4">Edit Recipe</h2>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Recipe Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    minLength={3}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={14}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    minLength={10}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Difficulty *</Form.Label>
                  <Form.Select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
                    {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Preparation Time (minutes) *</Form.Label>
                  <Form.Control type="number" name="prepTime" value={formData.prepTime} onChange={handleChange} required min={1} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cooking Time (minutes) *</Form.Label>
                  <Form.Control type="number" name="cookTime" value={formData.cookTime} onChange={handleChange} required min={1} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Servings *</Form.Label>
                  <Form.Control type="number" name="servings" value={formData.servings} onChange={handleChange} required min={1} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Ingredients *</Form.Label>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="d-flex mb-2">
                  <Form.Control
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    required
                  />
                  {formData.ingredients.length > 1 && (
                    <Button variant="danger" className="ms-2" onClick={() => removeIngredient(index)}>Remove</Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addIngredient}>+ Add Ingredient</Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instructions *</Form.Label>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="d-flex mb-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    required
                  />
                  {formData.instructions.length > 1 && (
                    <Button variant="danger" className="ms-2" onClick={() => removeInstruction(index)}>Remove</Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addInstruction}>+ Add Step</Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Add More Images (Max 5)</Form.Label>
              <Form.Control type="file" accept="image/*" multiple onChange={handleImageChange} />
              <Form.Text className="text-muted">Upload additional images (existing images will be kept)</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Add More Attachments (Max 3)</Form.Label>
              <Form.Control type="file" accept=".pdf,.doc,.docx,.txt" multiple onChange={handleAttachmentChange} />
              <Form.Text className="text-muted">Upload additional attachments (existing files will be kept)</Form.Text>
            </Form.Group>

            {/* Reference URLs */}
            <Form.Group className="mb-4">
              <Form.Label>Source Links</Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Add links to original recipes, YouTube videos or other references
              </Form.Text>
              {referenceUrls.map((url, index) => (
                <div key={index} className="d-flex mb-2">
                  <Form.Control
                    type="url"
                    placeholder="URL (e.g https://youtube.com/...)"
                    value={url}
                    onChange={(e) => handleReferenceUrlChange(index, e.target.value)}
                  />
                  <Button
                    variant="danger"
                    className="ms-2"
                    onClick={() => removeReferenceUrl(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addReferenceUrl}>
                + Add Source Link
              </Button>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate(`/recipes/${id}`)} disabled={submitting}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Recipe'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditRecipe;

