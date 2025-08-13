import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let response;
      if (user.role === 'owner') {
        response = await axios.get('http://localhost:5000/api/my-property-bookings', { 
          headers,
          withCredentials: true
        });
      } else {
        response = await axios.get('http://localhost:5000/api/my-bookings', { 
          headers,
          withCredentials: true
        });
      }

      // Ensure we have valid booking data
      const validBookings = response.data.filter(booking => 
        booking && booking.house && booking.tenant && booking.owner
      );
      
      setBookings(validBookings);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Error fetching bookings');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      await fetchBookings(); // Refresh the bookings list
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err.response?.data?.message || 'Error updating booking status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge bg-warning';
      case 'approved':
        return 'badge bg-success';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning" role="alert">
        Please <Link to="/login">login</Link> to view your bookings.
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <h1>{user.role === 'owner' ? 'Property Bookings' : 'My Bookings'}</h1>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found</p>
          {user.role !== 'owner' && (
            <Link to="/houses" className="btn btn-primary">
              Browse Houses to Book
            </Link>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            booking && booking.house && (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>
                    <Link to={`/houses/${booking.house._id}`}>
                      {booking.house.title || 'Untitled House'}
                    </Link>
                  </h3>
                  <span className={getStatusBadgeClass(booking.status)}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <p>
                    <strong>Location:</strong> {booking.house.location || 'Location not available'}
                  </p>
                  {user.role === 'owner' && booking.tenant && (
                    <p>
                      <strong>Tenant:</strong> {booking.tenant.name || 'Unknown tenant'}
                    </p>
                  )}
                  {user.role === 'tenant' && booking.owner && (
                    <p>
                      <strong>Owner:</strong> {booking.owner.name || 'Unknown owner'}
                    </p>
                  )}
                  <p>
                    <strong>Booking Date:</strong>{' '}
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                </div>
                {user.role === 'owner' && booking.status === 'pending' && (
                  <div className="booking-actions">
                    <button
                      className="btn btn-success me-2"
                      onClick={() => handleStatusUpdate(booking._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
