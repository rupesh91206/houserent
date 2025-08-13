const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  genre: {
    type: [String],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  rating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  director: {
    type: String,
    required: true
  },
  cast: [String],
  language: {
    type: String,
    default: 'English'
  },
  images: [String], // movie posters/stills
  trailer: String, // URL to trailer
  theater: {
    name: String,
    location: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  showtimes: [{
    date: Date,
    time: String,
    screen: String,
    totalSeats: Number,
    availableSeats: Number,
    price: Number
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // theater owner/admin
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add text index for search functionality
movieSchema.index({ 
  title: 'text', 
  description: 'text',
  genre: 'text',
  director: 'text',
  'theater.name': 'text',
  'theater.location.city': 'text'
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
