const router = require('express').Router();
const House = require('../models/house.model');
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

// Create house listing with images
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        const imageFiles = req.files;
        const imageUrls = imageFiles ? imageFiles.map(file => `uploads/${file.filename}`) : [];

        const house = new House({
            ...req.body,
            images: imageUrls,
            owner: req.userId
        });
        await house.save();
        res.status(201).json(house);
    } catch (error) {
        res.status(400).json({ message: 'Error creating listing', error: error.message });
    }
});

// Get all houses with optional search
router.get('/', async (req, res) => {
    try {
        console.log('Fetching houses with query:', req.query);
        const { search, minPrice, maxPrice, bedrooms } = req.query;
        let query = {};

        if (search) {
            query.$text = { $search: search };
        }

        if (minPrice) {
            query.price = { ...query.price, $gte: Number(minPrice) };
        }

        if (maxPrice) {
            query.price = { ...query.price, $lte: Number(maxPrice) };
        }

        if (bedrooms) {
            query.bedrooms = Number(bedrooms);
        }

        const houses = await House.find(query)
            .populate('owner', 'name email')
            .sort('-createdAt');
        
        // Transform image URLs to include full path if needed
        const housesWithFullImagePaths = houses.map(house => {
            const houseObj = house.toObject();
            if (houseObj.images && houseObj.images.length > 0) {
                houseObj.images = houseObj.images.map(image => 
                    image.startsWith('http') ? image : `http://localhost:5000/${image}`
                );
            }
            return houseObj;
        });
        

        res.json(housesWithFullImagePaths);
    } catch (error) {
        console.error('Error in GET /houses:', error);
        res.status(500).json({ message: 'Error fetching houses', error: error.message });
    }
});

// Get single house
router.get('/:id', async (req, res) => {
    try {
        const house = await House.findById(req.params.id)
            .populate('owner', 'name email');
        
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        // Transform image URLs to include full path
        const houseObj = house.toObject();
        if (houseObj.images && houseObj.images.length > 0) {
            houseObj.images = houseObj.images.map(image => 
                image.startsWith('http') ? image : `http://localhost:5000/${image}`
            );
        }

        res.json(houseObj);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching house', error: error.message });
    }
});

// Update house
router.patch('/:id', auth, upload.array('images', 5), async (req, res) => {
    try {
        const house = await House.findById(req.params.id);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        if (house.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this house' });
        }

        const imageFiles = req.files;
        let imageUrls = house.images || [];

        if (imageFiles && imageFiles.length > 0) {
            const newImageUrls = imageFiles.map(file => `http://localhost:5000/uploads/${file.filename}`);
            imageUrls = [...imageUrls, ...newImageUrls];
        }

        const updates = {
            ...req.body,
            images: imageUrls
        };

        const updatedHouse = await House.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('owner', 'name email');

        // Transform image URLs to include full path
        const houseObj = updatedHouse.toObject();
        if (houseObj.images && houseObj.images.length > 0) {
            houseObj.images = houseObj.images.map(image => 
                image.startsWith('http') ? image : `http://localhost:5000/${image}`
            );
        }

        res.json(houseObj);
    } catch (error) {
        res.status(500).json({ message: 'Error updating house', error: error.message });
    }
});

// Delete house
router.delete('/:id', auth, async (req, res) => {
    try {
        const house = await House.findById(req.params.id);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        if (house.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this house' });
        }

        // Delete associated images
        if (house.images && house.images.length > 0) {
            house.images.forEach(image => {
                if (!image.startsWith('http')) {
                    const imagePath = path.join(__dirname, '..', image);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
            });
        }

        await house.remove();
        res.json({ message: 'House deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting house', error: error.message });
    }
});

module.exports = router;
