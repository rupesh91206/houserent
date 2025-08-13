const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    showtime: {
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        screen: {
            type: String,
            required: true
        }
    },
    seats: [{
        seatNumber: String,
        type: {
            type: String,
            enum: ['regular', 'premium', 'vip'],
            default: 'regular'
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    bookingReference: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate booking reference before saving
ticketSchema.pre('save', function(next) {
    if (!this.bookingReference) {
        this.bookingReference = 'TKT' + Date.now().toString(36).toUpperCase();
    }
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
