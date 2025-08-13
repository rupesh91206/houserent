const router = require('express').Router();
const Booking = require('../models/booking.model');
const House = require('../models/house.model');
const auth = require('../middleware/auth');

// Check existing booking for a house
router.get('/houses/:id/bookings', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            house: req.params.id,
            tenant: req.user._id,
            status: { $in: ['pending', 'approved'] }
        }).sort({ createdAt: -1 });

        if (!booking) {
            return res.json(null);
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Error checking booking status' });
    }
});

// Create a booking
router.post('/houses/:id/book', auth, async (req, res) => {
    try {
        const house = await House.findById(req.params.id);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }

        // Check if user is the owner
        if (house.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot book your own house' });
        }

        // Check if user is an owner (not allowed to book)
        if (req.user.role === 'owner') {
            return res.status(400).json({ message: 'Property owners cannot make bookings' });
        }

        // Check if house is already booked
        const existingBooking = await Booking.findOne({
            house: req.params.id,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'House is already booked or has a pending booking' });
        }

        const booking = new Booking({
            house: req.params.id,
            tenant: req.user._id,
            owner: house.owner,
            status: 'pending',
            bookingDate: new Date()
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Error creating booking' });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ tenant: req.user._id })
            .populate('house')
            .populate('owner', 'name')
            .populate('tenant', 'name')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// Get property bookings (for owners)
router.get('/my-property-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ owner: req.user._id })
            .populate('house')
            .populate('owner', 'name')
            .populate('tenant', 'name')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching property bookings' });
    }
});

// Update booking status
router.patch('/bookings/:id/status', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify that the user is the owner of the house
        if (booking.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        booking.status = req.body.status;
        await booking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Error updating booking status' });
    }
});

module.exports = router;
