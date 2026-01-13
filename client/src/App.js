import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';

// Components
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeList from './pages/RecipeList';
import BrowseRecipes from './pages/BrowseRecipes';
import SearchRecipes from './pages/SearchRecipes';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';
import MyRecipes from './pages/MyRecipes';
import AdminDashboard from './pages/AdminDashboard';
import AIAssistant from './pages/AIAssistant';
import VerifyEmail from './pages/VerifyEmail';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recipes" element={<RecipeList />} />
            <Route path="/browse" element={<BrowseRecipes />} />
            <Route path="/search" element={<SearchRecipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route
              path="/create-recipe"
              element={
                <PrivateRoute>
                  <CreateRecipe />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <CreateRecipe />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <PrivateRoute>
                  <EditRecipe />
                </PrivateRoute>
              }
            />
            <Route 
              path="/my-recipes" 
              element={
                <PrivateRoute>
                  <MyRecipes />
                </PrivateRoute>
              } 
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/manage"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <PrivateRoute>
                  <AIAssistant />
                </PrivateRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <PrivateRoute>
                  <AIAssistant />
                </PrivateRoute>
              }
            />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

