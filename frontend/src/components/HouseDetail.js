import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/HouseDetail.css';

const HouseDetail = () => {
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingStatus, setBookingStatus] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [existingBooking, setExistingBooking] = useState(null);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHouseDetails();
    if (user && user.role !== 'owner') {
      checkExistingBooking();
    }
  }, [id, user]);

  const fetchHouseDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/houses/${id}`);
      setHouse(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching house details');
      setLoading(false);
    }
  };

  const checkExistingBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/houses/${id}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingBooking(response.data);
    } catch (err) {
      console.error('Error checking booking status:', err);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsBooking(true);
    setBookingStatus('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/houses/${id}/book`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingStatus('success:Booking request sent successfully!');
      checkExistingBooking();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to book the house. Please try again.';
      setBookingStatus(`error:${errorMessage}`);
    } finally {
      setIsBooking(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/houses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/houses');
      } catch (err) {
        setError('Error deleting house');
      }
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/800x400?text=No+Image';
    return imageUrl; // No need to transform as backend now sends full URLs
  };

  const nextImage = () => {
    if (house.images && house.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === house.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const previousImage = () => {
    if (house.images && house.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? house.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!house) return <div className="alert alert-warning">House not found</div>;

  const showBookButton = user && 
    user.role !== 'owner' && 
    user._id !== house.owner && 
    (!existingBooking || existingBooking.status === 'rejected');

  return (
    <div className="house-detail-container">
      <div className="house-detail-content">
        <h1>{house.title}</h1>
        <p className="location"><i className="bi bi-geo-alt"></i> {house.location}</p>
        <p className="price">₹{house.price}/month</p>

        <div className="image-gallery">
          {house.images && house.images.length > 0 ? (
            <>
              <img 
                src={getImageUrl(house.images[currentImageIndex])} 
                alt={`${house.title} - Image ${currentImageIndex + 1}`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
              {house.images.length > 1 && (
                <div className="image-navigation">
                  <button onClick={previousImage} className="nav-button prev">
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <span className="image-counter">
                    {currentImageIndex + 1} / {house.images.length}
                  </span>
                  <button onClick={nextImage} className="nav-button next">
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <img 
              src="https://via.placeholder.com/800x400?text=No+Image" 
              alt="No image available"
              className="no-image"
            />
          )}
        </div>

        <div className="house-info">
          <div className="house-stats">
            <div><i className="bi bi-door-closed"></i> {house.bedrooms} Bedrooms</div>
            <div><i className="bi bi-droplet"></i> {house.bathrooms} Bathrooms</div>
            <div><i className="bi bi-rulers"></i> {house.area} sq ft</div>
          </div>

          <h2>Description</h2>
          <p>{house.description}</p>

          <h2>Amenities</h2>
          <div className="amenities">
            {house.amenities && house.amenities.map((amenity, index) => (
              <span key={index}><i className="bi bi-check2"></i> {amenity}</span>
            ))}
          </div>
        </div>

        <div className="booking-section">
          {bookingStatus && (
            <div className={`alert ${bookingStatus.startsWith('success:') ? 'alert-success' : 'alert-danger'}`}>
              {bookingStatus.split(':')[1]}
            </div>
          )}

          {existingBooking && (
            <div className={`alert ${existingBooking.status === 'approved' ? 'alert-success' : 
              existingBooking.status === 'pending' ? 'alert-warning' : 'alert-danger'}`}>
              {existingBooking.status === 'approved' && 'Your booking has been approved!'}
              {existingBooking.status === 'pending' && 'Your booking request is pending approval.'}
              {existingBooking.status === 'rejected' && 'Your previous booking was rejected. You can try booking again.'}
            </div>
          )}

          {showBookButton && (
            <button 
              onClick={handleBooking} 
              className="btn btn-primary booking-btn"
              disabled={isBooking}
            >
              {isBooking ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Booking...
                </>
              ) : (
                <>
                  <i className="bi bi-calendar-check"></i> Book Now
                </>
              )}
            </button>
          )}

          {user && user._id === house.owner && (
            <div className="action-buttons">
              <button onClick={() => navigate(`/edit-house/${id}`)} className="btn btn-primary">
                <i className="bi bi-pencil"></i> Edit
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseDetail;
