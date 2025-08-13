import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleListProperty = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/my-properties');
    }
  };

  return (
    <div className="home">
      <div className="hero-section text-center">
        <h1 className="display-4 mb-4">Find Your Perfect Home</h1>
        <p className="lead mb-4">
          Browse through our extensive collection of rental properties
        </p>
        <div className="cta-buttons">
          <Link to="/houses" className="btn btn-primary btn-lg me-3">
            Browse Houses
          </Link>
          <button onClick={handleListProperty} className="btn btn-outline-primary btn-lg">
            List Your Property
          </button>
        </div>
      </div>

      <div className="features-section mt-5">
        <div className="row">
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <i className="bi bi-house-door feature-icon"></i>
              <h3>Wide Selection</h3>
              <p>Browse through various properties that match your needs</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <i className="bi bi-shield-check feature-icon"></i>
              <h3>Verified Listings</h3>
              <p>All our listings are verified for your peace of mind</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card text-center p-4">
              <i className="bi bi-cash feature-icon"></i>
              <h3>Best Prices</h3>
              <p>Find properties that fit your budget</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
