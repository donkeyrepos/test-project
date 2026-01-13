const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Appetizer', 'Other']
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute']
  },
  cookTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [1, 'Cooking time must be at least 1 minute']
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  images: [{
    type: String
  }],
  attachments: [{
    filename: String,
    path: String
  }],
  referenceUrls: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Allow empty strings (will be filtered out)
        if (!v || v.trim() === '') return true;
        // URL validation that supports query parameters, fragments, etc.
        try {
          new URL(v);
          return true;
        } catch (err) {
          // If URL constructor fails, try with https:// prefix
          try {
            new URL('https://' + v);
            return true;
          } catch (err2) {
            return false;
          }
        }
      },
      message: 'Please enter a valid URL'
    }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for average rating
recipeSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual field for total ratings count
recipeSchema.virtual('ratingsCount').get(function() {
  return this.ratings.length;
});

// Virtual field for likes count
recipeSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Ensure virtuals are included in JSON
recipeSchema.set('toJSON', { virtuals: true });
recipeSchema.set('toObject', { virtuals: true });

// Update the updatedAt timestamp before saving
recipeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Text index for search functionality
recipeSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);

