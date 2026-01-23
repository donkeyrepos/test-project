const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const { protect, admin } = require('../middleware/auth');
const { uploadFiles } = require('../middleware/upload');

router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const recipes = await Recipe.find()
      .populate('author', 'username email')
      .exec();

    const sortedRecipes = recipes.sort((a, b) => {
      const avgA = a.averageRating || 0;
      const avgB = b.averageRating || 0;

      if (avgA > 0 && avgB > 0) {
        return avgB - avgA;
      }

      if (avgA > 0) return -1;
      if (avgB > 0) return 1;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const featuredRecipes = sortedRecipes.slice(0, limit * 1);

    res.json({
      recipes: featuredRecipes,
      total: featuredRecipes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const { search, category, difficulty, page = 1, limit = 12 } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Recipe.countDocuments(query);

    res.json({
      recipes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username email role');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', protect, uploadFiles, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('prepTime').isInt({ min: 1 }).withMessage('Prep time must be at least 1 minute'),
  body('cookTime').isInt({ min: 1 }).withMessage('Cook time must be at least 1 minute'),
  body('servings').isInt({ min: 1 }).withMessage('Servings must be at least 1')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, ingredients, instructions, category, prepTime, cookTime, servings, difficulty, referenceUrls } = req.body;

    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    const parsedReferenceUrls = referenceUrls && typeof referenceUrls === 'string' ? JSON.parse(referenceUrls) : referenceUrls;

    const images = req.files?.images ? req.files.images.map(file => file.path) : [];
    const attachments = req.files?.attachments ? req.files.attachments.map(file => ({
      filename: file.originalname,
      path: file.path
    })) : [];

    const recipe = await Recipe.create({
      title,
      description,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty: difficulty || 'Medium',
      images,
      attachments,
      referenceUrls: parsedReferenceUrls || [],
      author: req.user._id
    });
    
    const populatedRecipe = await Recipe.findById(recipe._id).populate('author', 'username email');
    
    res.status(201).json(populatedRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating recipe', error: error.message });
  }
});

router.put('/:id', protect, uploadFiles, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const { title, description, ingredients, instructions, category, prepTime, cookTime, servings, difficulty, referenceUrls } = req.body;

    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    const parsedReferenceUrls = referenceUrls && typeof referenceUrls === 'string' ? JSON.parse(referenceUrls) : referenceUrls;

    const newImages = req.files?.images ? req.files.images.map(file => file.path) : [];
    const newAttachments = req.files?.attachments ? req.files.attachments.map(file => ({
      filename: file.originalname,
      path: file.path
    })) : [];

    recipe.title = title || recipe.title;
    recipe.description = description || recipe.description;
    recipe.ingredients = parsedIngredients || recipe.ingredients;
    recipe.instructions = parsedInstructions || recipe.instructions;
    recipe.category = category || recipe.category;
    recipe.prepTime = prepTime || recipe.prepTime;
    recipe.cookTime = cookTime || recipe.cookTime;
    recipe.servings = servings || recipe.servings;
    recipe.difficulty = difficulty || recipe.difficulty;

    if (parsedReferenceUrls) {
      recipe.referenceUrls = parsedReferenceUrls;
    }

    if (newImages.length > 0) {
      recipe.images = [...recipe.images, ...newImages];
    }
    if (newAttachments.length > 0) {
      recipe.attachments = [...recipe.attachments, ...newAttachments];
    }

    await recipe.save();

    const updatedRecipe = await Recipe.findById(recipe._id).populate('author', 'username email');

    res.json(updatedRecipe);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error updating recipe', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await recipe.deleteOne();

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error deleting recipe', error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.params.userId })
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const existingRatingIndex = recipe.ratings.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRatingIndex !== -1) {
      recipe.ratings[existingRatingIndex].rating = rating;
      recipe.ratings[existingRatingIndex].createdAt = Date.now();
    } else {
      recipe.ratings.push({
        user: req.user._id,
        rating: rating
      });
    }

    await recipe.save();

    const updatedRecipe = await Recipe.findById(recipe._id)
      .populate('author', 'username email role');

    res.json({
      message: 'Rating submitted successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const alreadyLiked = recipe.likes.some(
      userId => userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({ message: 'Recipe already liked' });
    }

    recipe.likes.push(req.user._id);
    await recipe.save();

    const updatedRecipe = await Recipe.findById(recipe._id)
      .populate('author', 'username email role');

    res.json({
      message: 'Recipe liked successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id/like', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const likeIndex = recipe.likes.findIndex(
      userId => userId.toString() === req.user._id.toString()
    );

    if (likeIndex === -1) {
      return res.status(400).json({ message: 'Recipe not liked yet' });
    }

    recipe.likes.splice(likeIndex, 1);
    await recipe.save();

    const updatedRecipe = await Recipe.findById(recipe._id)
      .populate('author', 'username email role');

    res.json({
      message: 'Recipe unliked successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

