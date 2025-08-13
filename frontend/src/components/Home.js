import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleManageMovies = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/my-movies');
    }
  };

  return (
    <div className="home">
      <div className="hero-section text-center">
        <h1 className="display-4 mb-4">🎬 Book Your Movie Tickets</h1>
        <p className="lead mb-4">
          Discover the latest movies and book your tickets instantly
        </p>
        <div className="cta-buttons">
          <Link to="/movies" className="btn btn-primary btn-lg me-3">
            Browse Movies
          </Link>
          {user && user.role === 'owner' && (
            <button onClick={handleManageMovies} className="btn btn-outline-primary btn-lg">
              Manage Movies
            </button>
          )}
        </div>
      </div>

      <div className="features-section mt-5">
        <div className="row">
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <i className="bi bi-film feature-icon"></i>
              <h3>Latest Movies</h3>
              <p>Watch the newest releases in high-quality theaters</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <i className="bi bi-ticket-perforated feature-icon"></i>
              <h3>Easy Booking</h3>
              <p>Select your seats and book tickets in just a few clicks</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <i className="bi bi-star feature-icon"></i>
              <h3>Premium Experience</h3>
              <p>Enjoy movies with state-of-the-art sound and visuals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
