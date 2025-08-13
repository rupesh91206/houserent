import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/MovieDetail.css';

const MovieDetail = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatAvailability, setSeatAvailability] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovieDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMovieDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/movies/${id}`);
      setMovie(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching movie details');
      setLoading(false);
    }
  };

  const fetchSeatAvailability = async (showtimeIndex) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/movies/${id}/showtimes/${showtimeIndex}/seats`
      );
      setSeatAvailability(response.data);
    } catch (err) {
      console.error('Error fetching seat availability:', err);
    }
  };

  const handleShowtimeSelect = (showtime, index) => {
    setSelectedShowtime({ ...showtime, index });
    setSelectedSeats([]);
    fetchSeatAvailability(index);
  };

  const generateSeatMap = () => {
    const totalSeats = seatAvailability?.totalSeats || 100;
    const bookedSeats = seatAvailability?.bookedSeats || [];
    const seats = [];
    const rows = Math.ceil(totalSeats / 10);

    for (let row = 0; row < rows; row++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C, etc.
      const rowSeats = [];
      
      for (let seatNum = 1; seatNum <= Math.min(10, totalSeats - row * 10); seatNum++) {
        const seatId = `${rowLetter}${seatNum}`;
        const isBooked = bookedSeats.includes(seatId);
        const isSelected = selectedSeats.some(seat => seat.seatNumber === seatId);
        
        rowSeats.push({
          id: seatId,
          isBooked,
          isSelected,
          type: row < 2 ? 'premium' : row < 4 ? 'regular' : 'regular'
        });
      }
      seats.push(rowSeats);
    }

    return seats;
  };

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    const isSelected = selectedSeats.some(s => s.seatNumber === seat.id);
    
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.seatNumber !== seat.id));
    } else {
      setSelectedSeats(prev => [...prev, {
        seatNumber: seat.id,
        type: seat.type
      }]);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedShowtime || !selectedSeats.length) return 0;
    
    return selectedSeats.reduce((total, seat) => {
      const basePrice = selectedShowtime.price || 200;
      const seatPrice = seat.type === 'premium' ? basePrice * 1.5 : basePrice;
      return total + seatPrice;
    }, 0);
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedShowtime || !selectedSeats.length) {
      setError('Please select showtime and seats');
      return;
    }

    setIsBooking(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/movies/${id}/book`,
        {
          showtimeIndex: selectedShowtime.index,
          seats: selectedSeats
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return <div className="alert alert-danger">Movie not found</div>;
  }

  return (
    <div className="movie-detail">
      {bookingSuccess && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3" style={{zIndex: 1050}}>
          🎉 Booking successful! Redirecting to your tickets...
        </div>
      )}

      <div className="movie-header">
        <div className="row">
          <div className="col-md-4">
            <div className="movie-poster">
              {movie.images && movie.images.length > 0 ? (
                <div className="image-carousel">
                  <img
                    src={movie.images[currentImageIndex]}
                    alt={movie.title}
                    className="img-fluid rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400?text=No+Poster';
                    }}
                  />
                  {movie.images.length > 1 && (
                    <div className="image-navigation">
                      {movie.images.map((_, index) => (
                        <button
                          key={index}
                          className={`nav-dot ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src="https://via.placeholder.com/300x400?text=No+Poster"
                  alt={movie.title}
                  className="img-fluid rounded"
                />
              )}
            </div>
          </div>
          <div className="col-md-8">
            <div className="movie-info">
              <h1>{movie.title}</h1>
              <div className="movie-meta">
                <span className="rating-badge">{movie.rating}</span>
                <span className="duration">{formatDuration(movie.duration)}</span>
                <span className="year">{new Date(movie.releaseDate).getFullYear()}</span>
              </div>
              <div className="genre-tags">
                {Array.isArray(movie.genre) ? movie.genre.map(g => (
                  <span key={g} className="genre-tag">{g}</span>
                )) : <span className="genre-tag">{movie.genre}</span>}
              </div>
              <p className="director"><strong>Director:</strong> {movie.director}</p>
              {movie.cast && movie.cast.length > 0 && (
                <p className="cast"><strong>Cast:</strong> {movie.cast.join(', ')}</p>
              )}
              <p className="description">{movie.description}</p>
              {movie.theater && (
                <div className="theater-info">
                  <h5>🎭 {movie.theater.name}</h5>
                  <p>{movie.theater.location.city}, {movie.theater.location.state}</p>
                </div>
              )}
              {movie.trailer && (
                <a 
                  href={movie.trailer} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-primary"
                >
                  Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes */}
      <div className="showtimes-section mt-5">
        <h3>Select Showtime</h3>
        <div className="showtimes-grid">
          {movie.showtimes && movie.showtimes.map((showtime, index) => (
            <div
              key={index}
              className={`showtime-card ${selectedShowtime?.index === index ? 'selected' : ''}`}
              onClick={() => handleShowtimeSelect(showtime, index)}
            >
              <div className="showtime-date">{formatDate(showtime.date)}</div>
              <div className="showtime-time">{formatTime(showtime.time)}</div>
              <div className="showtime-screen">{showtime.screen}</div>
              <div className="showtime-price">₹{showtime.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Selection */}
      {selectedShowtime && seatAvailability && (
        <div className="seat-selection mt-5">
          <h3>Select Seats</h3>
          <div className="screen-indicator">
            <div className="screen">SCREEN</div>
          </div>
          
          <div className="seat-map">
            {generateSeatMap().map((row, rowIndex) => (
              <div key={rowIndex} className="seat-row">
                <div className="row-label">{String.fromCharCode(65 + rowIndex)}</div>
                <div className="seats">
                  {row.map((seat) => (
                    <div
                      key={seat.id}
                      className={`seat ${seat.isBooked ? 'booked' : ''} ${
                        seat.isSelected ? 'selected' : ''
                      } ${seat.type}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seat.id}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="seat booked"></div>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="seat premium"></div>
              <span>Premium (+50%)</span>
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="booking-summary">
              <div className="summary-details">
                <h5>Booking Summary</h5>
                <p><strong>Movie:</strong> {movie.title}</p>
                <p><strong>Date & Time:</strong> {formatDate(selectedShowtime.date)} at {formatTime(selectedShowtime.time)}</p>
                <p><strong>Screen:</strong> {selectedShowtime.screen}</p>
                <p><strong>Seats:</strong> {selectedSeats.map(s => s.seatNumber).join(', ')}</p>
                <p><strong>Total Amount:</strong> ₹{calculateTotalPrice()}</p>
              </div>
              
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
              
              <button
                className="btn btn-primary btn-lg"
                onClick={handleBooking}
                disabled={isBooking}
              >
                {isBooking ? 'Booking...' : 'Book Tickets'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieDetail;