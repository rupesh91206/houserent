import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/MyTickets.css';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let response;
      if (user.role === 'owner') {
        response = await axios.get('http://localhost:5000/api/my-movie-bookings', { 
          headers,
          withCredentials: true
        });
      } else {
        response = await axios.get('http://localhost:5000/api/my-tickets', { 
          headers,
          withCredentials: true
        });
      }

      // Ensure we have valid ticket data
      const validTickets = response.data.filter(ticket => 
        ticket && ticket.movie && ticket.user
      );
      
      setTickets(validTickets);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to load tickets');
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tickets/${ticketId}/status`,
        { status: 'cancelled' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Refresh the tickets list
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel ticket');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-danger';
      case 'completed':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'failed':
        return 'badge bg-danger';
      case 'refunded':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  };

  const isShowtimePassed = (date, time) => {
    const showtimeDateTime = new Date(`${date} ${time}`);
    return showtimeDateTime < new Date();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-tickets">
      <div className="container">
        <h2 className="mb-4">
          {user.role === 'owner' ? 'Movie Bookings' : 'My Tickets'}
        </h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="no-tickets">
            <div className="text-center py-5">
              <i className="bi bi-ticket-perforated display-1 text-muted"></i>
              <h4 className="mt-3">
                {user.role === 'owner' ? 'No bookings found' : 'No tickets found'}
              </h4>
              <p className="text-muted mb-4">
                {user.role === 'owner' 
                  ? 'No one has booked your movies yet.' 
                  : "You haven't booked any movie tickets yet."}
              </p>
              <Link to="/movies" className="btn btn-primary">
                Browse Movies
              </Link>
            </div>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="ticket-card">
                <div className="row">
                  <div className="col-md-3">
                    <div className="movie-poster">
                      <img
                        src={
                          ticket.movie.images && ticket.movie.images[0]
                            ? `http://localhost:5000/${ticket.movie.images[0]}`
                            : 'https://via.placeholder.com/200x300?text=No+Poster'
                        }
                        alt={ticket.movie.title}
                        className="img-fluid rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x300?text=No+Poster';
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="ticket-details">
                      <h5 className="movie-title">{ticket.movie.title}</h5>
                      
                      <div className="showtime-info">
                        <p><strong>Date:</strong> {formatDate(ticket.showtime.date)}</p>
                        <p><strong>Time:</strong> {formatTime(ticket.showtime.time)}</p>
                        <p><strong>Screen:</strong> {ticket.showtime.screen}</p>
                      </div>

                      <div className="seat-info">
                        <p><strong>Seats:</strong> {ticket.seats.map(seat => seat.seatNumber).join(', ')}</p>
                        <p><strong>Total Amount:</strong> ₹{ticket.totalPrice}</p>
                      </div>

                      <div className="booking-info">
                        <p><strong>Booking Reference:</strong> {ticket.bookingReference}</p>
                        <p><strong>Booked on:</strong> {new Date(ticket.bookingDate).toLocaleDateString()}</p>
                        {user.role === 'owner' && (
                          <p><strong>Customer:</strong> {ticket.user.name} ({ticket.user.email})</p>
                        )}
                      </div>

                      {ticket.movie.theater && (
                        <div className="theater-info">
                          <p><strong>Theater:</strong> {ticket.movie.theater.name}</p>
                          {ticket.movie.theater.location && (
                            <p><strong>Location:</strong> {ticket.movie.theater.location.city}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="ticket-actions">
                      <div className="status-badges mb-3">
                        <div className="mb-2">
                          <span className={getStatusBadgeClass(ticket.status)}>
                            {ticket.status.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className={getPaymentStatusBadgeClass(ticket.paymentStatus)}>
                            {ticket.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {ticket.status === 'confirmed' && 
                       !isShowtimePassed(ticket.showtime.date, ticket.showtime.time) && 
                       (user._id === ticket.user._id || user.role === 'owner') && (
                        <button
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={() => handleCancelTicket(ticket._id)}
                        >
                          Cancel Ticket
                        </button>
                      )}

                      <div className="qr-code-placeholder mt-3">
                        <div className="qr-placeholder">
                          <i className="bi bi-qr-code display-4"></i>
                          <small className="d-block text-muted">Show at theater</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {user.role !== 'owner' && (
          <div className="text-center mt-4">
            <Link to="/movies" className="btn btn-primary">
              Book More Tickets
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;