const router = require('express').Router();
const Ticket = require('../models/ticket.model');
const Movie = require('../models/movie.model');
const auth = require('../middleware/auth');

// Check available seats for a specific showtime
router.get('/movies/:id/showtimes/:showtimeIndex/seats', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const showtimeIndex = parseInt(req.params.showtimeIndex);
        const showtime = movie.showtimes[showtimeIndex];
        
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Get all booked seats for this showtime
        const bookedTickets = await Ticket.find({
            movie: req.params.id,
            'showtime.date': showtime.date,
            'showtime.time': showtime.time,
            'showtime.screen': showtime.screen,
            status: { $in: ['confirmed', 'completed'] }
        });

        const bookedSeats = bookedTickets.reduce((seats, ticket) => {
            return seats.concat(ticket.seats.map(seat => seat.seatNumber));
        }, []);

        res.json({
            showtime,
            totalSeats: showtime.totalSeats || 100,
            bookedSeats,
            availableSeats: (showtime.totalSeats || 100) - bookedSeats.length
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching seat availability', error: err.message });
    }
});

// Create a ticket booking
router.post('/movies/:id/book', auth, async (req, res) => {
    try {
        const { showtimeIndex, seats } = req.body;
        
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const showtime = movie.showtimes[showtimeIndex];
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        // Check if selected seats are available
        const bookedTickets = await Ticket.find({
            movie: req.params.id,
            'showtime.date': showtime.date,
            'showtime.time': showtime.time,
            'showtime.screen': showtime.screen,
            status: { $in: ['confirmed', 'completed'] }
        });

        const bookedSeats = bookedTickets.reduce((seatNums, ticket) => {
            return seatNums.concat(ticket.seats.map(seat => seat.seatNumber));
        }, []);

        const requestedSeats = seats.map(seat => seat.seatNumber);
        const conflictingSeats = requestedSeats.filter(seat => bookedSeats.includes(seat));

        if (conflictingSeats.length > 0) {
            return res.status(400).json({ 
                message: 'Some seats are already booked', 
                conflictingSeats 
            });
        }

        // Calculate total price
        const totalPrice = seats.reduce((total, seat) => {
            const seatPrice = seat.type === 'premium' ? showtime.price * 1.5 : 
                            seat.type === 'vip' ? showtime.price * 2 : showtime.price;
            return total + seatPrice;
        }, 0);

        const ticket = new Ticket({
            movie: req.params.id,
            user: req.userId,
            showtime: {
                date: showtime.date,
                time: showtime.time,
                screen: showtime.screen
            },
            seats: seats,
            totalPrice: totalPrice,
            status: 'confirmed',
            paymentStatus: 'completed', // Simplified for demo
            bookingDate: new Date()
        });

        await ticket.save();
        
        // Populate movie details for response
        await ticket.populate('movie', 'title theater');
        await ticket.populate('user', 'name email');
        
        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Error creating ticket booking', error: err.message });
    }
});

// Get user's tickets
router.get('/my-tickets', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.userId })
            .populate('movie', 'title genre director theater images')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tickets', error: err.message });
    }
});

// Get movie bookings (for cinema owners)
router.get('/my-movie-bookings', auth, async (req, res) => {
    try {
        // Find movies owned by this user
        const movies = await Movie.find({ owner: req.userId });
        const movieIds = movies.map(movie => movie._id);

        const tickets = await Ticket.find({ movie: { $in: movieIds } })
            .populate('movie', 'title genre director theater')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching movie bookings', error: err.message });
    }
});

// Update ticket status (for cancellations)
router.patch('/tickets/:id/status', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify that the user owns the ticket or owns the movie
        const movie = await Movie.findById(ticket.movie);
        const canUpdate = ticket.user.toString() === req.userId || 
                         movie.owner.toString() === req.userId;

        if (!canUpdate) {
            return res.status(403).json({ message: 'Not authorized to update this ticket' });
        }

        ticket.status = req.body.status;
        await ticket.save();
        
        await ticket.populate('movie', 'title theater');
        await ticket.populate('user', 'name email');
        
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Error updating ticket status', error: err.message });
    }
});

// Get specific ticket details
router.get('/tickets/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('movie', 'title genre director theater images')
            .populate('user', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify user can access this ticket
        const movie = await Movie.findById(ticket.movie);
        const canAccess = ticket.user._id.toString() === req.userId || 
                         movie.owner.toString() === req.userId;

        if (!canAccess) {
            return res.status(403).json({ message: 'Not authorized to view this ticket' });
        }

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching ticket details', error: err.message });
    }
});

module.exports = router;
