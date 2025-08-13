const router = require('express').Router();
const Movie = require('../models/movie.model');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware to authenticate user
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Create movie listing with images
router.post('/', auth, upload.array('images', 10), async (req, res) => {
    try {
        const imageFiles = req.files;
        const imageUrls = imageFiles ? imageFiles.map(file => `uploads/${file.filename}`) : [];

        // Parse showtimes if they're strings
        let showtimes = [];
        if (req.body.showtimes) {
            showtimes = typeof req.body.showtimes === 'string' 
                ? JSON.parse(req.body.showtimes) 
                : req.body.showtimes;
        }

        // Parse genre if it's a string
        let genre = req.body.genre;
        if (typeof genre === 'string') {
            genre = genre.split(',').map(g => g.trim());
        }

        // Parse cast if it's a string
        let cast = req.body.cast;
        if (typeof cast === 'string') {
            cast = cast.split(',').map(c => c.trim());
        }

        const movie = new Movie({
            ...req.body,
            genre,
            cast,
            showtimes,
            images: imageUrls,
            owner: req.userId
        });
        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        res.status(400).json({ message: 'Error creating movie', error: error.message });
    }
});

// Get all movies with optional search
router.get('/', async (req, res) => {
    try {
        console.log('Fetching movies with query:', req.query);
        const { search, genre, rating, city } = req.query;
        let query = { active: true };

        if (search) {
            query.$text = { $search: search };
        }

        if (genre) {
            query.genre = { $in: [genre] };
        }

        if (rating) {
            query.rating = rating;
        }

        if (city) {
            query['theater.location.city'] = new RegExp(city, 'i');
        }

        const movies = await Movie.find(query)
            .populate('owner', 'name email')
            .sort('-createdAt');
        
        // Transform image URLs to include full path if needed
        const moviesWithFullImagePaths = movies.map(movie => {
            const movieObj = movie.toObject();
            if (movieObj.images && movieObj.images.length > 0) {
                movieObj.images = movieObj.images.map(image => 
                    image.startsWith('http') ? image : `http://localhost:5000/${image}`
                );
            }
            return movieObj;
        });
        

        res.json(moviesWithFullImagePaths);
    } catch (error) {
        console.error('Error in GET /movies:', error);
        res.status(500).json({ message: 'Error fetching movies', error: error.message });
    }
});

// Get single movie
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)
            .populate('owner', 'name email');
        
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Transform image URLs to include full path
        const movieObj = movie.toObject();
        if (movieObj.images && movieObj.images.length > 0) {
            movieObj.images = movieObj.images.map(image => 
                image.startsWith('http') ? image : `http://localhost:5000/${image}`
            );
        }

        res.json(movieObj);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching movie', error: error.message });
    }
});

// Update movie
router.patch('/:id', auth, upload.array('images', 10), async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        if (movie.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this movie' });
        }

        const imageFiles = req.files;
        let imageUrls = movie.images || [];

        if (imageFiles && imageFiles.length > 0) {
            const newImageUrls = imageFiles.map(file => `http://localhost:5000/uploads/${file.filename}`);
            imageUrls = [...imageUrls, ...newImageUrls];
        }

        // Parse showtimes if they're strings
        let showtimes = req.body.showtimes;
        if (showtimes && typeof showtimes === 'string') {
            showtimes = JSON.parse(showtimes);
        }

        // Parse genre if it's a string
        let genre = req.body.genre;
        if (genre && typeof genre === 'string') {
            genre = genre.split(',').map(g => g.trim());
        }

        // Parse cast if it's a string
        let cast = req.body.cast;
        if (cast && typeof cast === 'string') {
            cast = cast.split(',').map(c => c.trim());
        }

        const updates = {
            ...req.body,
            ...(genre && { genre }),
            ...(cast && { cast }),
            ...(showtimes && { showtimes }),
            images: imageUrls
        };

        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('owner', 'name email');

        // Transform image URLs to include full path
        const movieObj = updatedMovie.toObject();
        if (movieObj.images && movieObj.images.length > 0) {
            movieObj.images = movieObj.images.map(image => 
                image.startsWith('http') ? image : `http://localhost:5000/${image}`
            );
        }

        res.json(movieObj);
    } catch (error) {
        res.status(500).json({ message: 'Error updating movie', error: error.message });
    }
});

// Delete movie
router.delete('/:id', auth, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        if (movie.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this movie' });
        }

        // Delete associated images
        if (movie.images && movie.images.length > 0) {
            movie.images.forEach(image => {
                if (!image.startsWith('http')) {
                    const imagePath = path.join(__dirname, '..', image);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
            });
        }

        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting movie', error: error.message });
    }
});

module.exports = router;
