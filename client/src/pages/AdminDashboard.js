import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    adminUsers: 0,
    totalRecipes: 0
  });
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  useEffect(() => {
    document.title = 'COOKit | Manage Users/Recipes';
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch statistics
      const statsRes = await axios.get('/api/admin/stats');

      // Fetch all users
      const usersRes = await axios.get('/api/admin/users');

      // Fetch all recipes
      const recipesRes = await axios.get('/api/admin/recipes');

      setUsers(usersRes.data.users || []);
      setRecipes(recipesRes.data.recipes || []);
      setStats(statsRes.data.stats || {
        totalUsers: 0,
        verifiedUsers: 0,
        adminUsers: 0,
        totalRecipes: 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, { role: newRole });
      toast.success('User role updated successfully');
      fetchData();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User and their recipes deleted successfully');
      fetchData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await axios.delete(`/api/admin/recipes/${recipeId}`);
      toast.success('Recipe deleted successfully');
      fetchData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
    }
  };

  const openDeleteModal = (target, type) => {
    setDeleteTarget(target);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteType === 'user') {
      handleDeleteUser(deleteTarget._id);
    } else if (deleteType === 'recipe') {
      handleDeleteRecipe(deleteTarget._id);
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
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="text-primary">{stats.totalUsers}</h2>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="text-success">{stats.totalRecipes}</h2>
              <p className="text-muted mb-0">Total Recipes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="text-info">{stats.adminUsers}</h2>
              <p className="text-muted mb-0">Administrators</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="text-warning">{stats.verifiedUsers}</h2>
              <p className="text-muted mb-0">Verified Users</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h4 className="mb-0">All Users ({users.length})</h4>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="me-2"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      Edit Role
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => openDeleteModal(user, 'user')}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Recipes Table */}
      <Card className="shadow-sm">
        <Card.Header>
          <h4 className="mb-0">All Recipes ({recipes.length})</h4>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(recipe => (
                <tr key={recipe._id}>
                  <td>{recipe.title}</td>
                  <td>{recipe.author?.username || 'Unknown'}</td>
                  <td><Badge bg="primary">{recipe.category}</Badge></td>
                  <td><Badge bg="secondary">{recipe.difficulty}</Badge></td>
                  <td>{new Date(recipe.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/recipes/${recipe._id}`}>
                      <Button variant="info" size="sm" className="me-2">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteModal(recipe, 'recipe')}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Edit User Role Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p><strong>User:</strong> {selectedUser.username}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Current Role:</strong> {selectedUser.role}</p>
              <Form.Group>
                <Form.Label>New Role</Form.Label>
                <Form.Select
                  defaultValue={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this {deleteType}? This action cannot be undone.
          {deleteType === 'user' && (
            <p className="text-danger mt-2">
              <strong>Warning:</strong> This will also delete all recipes created by this user.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;

