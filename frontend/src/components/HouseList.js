import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/HouseList.css';

const HouseList = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`http://localhost:5000/api/houses?${queryParams}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      setHouses(response.data);
    } catch (error) {
      console.error('Error fetching houses:', error);
      setError('Failed to load houses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHouses();
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300x200?text=No+Image';
    
    // Using full path directly
    return `http://localhost:5000/${imageUrl}`;
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
    <div className="house-list">
      <div className="filters-section mb-4">
        <form onSubmit={handleSubmit} className="filter-form">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by location or title..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Min Price"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Max Price"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Bedrooms"
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {houses.map((house) => (
          <div key={house._id} className="col">
            <Link to={`/houses/${house._id}`} className="text-decoration-none">
              <div className="card h-100 house-card">
                <div className="image-container">
                  <img
                    src={house.images && house.images[0] ? getImageUrl(house.images[0]) : 'https://via.placeholder.com/300x200?text=No+Image'}
                    className="card-img-top"
                    alt={house.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  {house.images && house.images.length > 1 && (
                    <span className="image-count">+{house.images.length - 1}</span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{house.title}</h5>
                  <p className="card-text location">
                    <i className="bi bi-geo-alt"></i> {house.address.city}
                  </p>
                  <p className="card-text price">₹{house.price}/month</p>
                  <div className="house-features">
                    <span><i className="bi bi-door-closed"></i> {house.bedrooms} Beds</span>
                    <span><i className="bi bi-droplet"></i> {house.bathrooms} Baths</span>
                    <span><i className="bi bi-rulers"></i> {house.squareFeet} sq ft</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HouseList;
