import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/MyProperties.css';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProperties();
  }, [user, navigate]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your properties');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5001/api/houses/my-properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Unable to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/houses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchProperties();
      } catch (err) {
        setError('Error deleting property');
      }
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300x200?text=No+Image';
    return imageUrl.startsWith('http') ? imageUrl : `http://localhost:5001${imageUrl}`;
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
    <div className="my-properties">
      <div className="container">
        <div className="header">
          <h1>My Properties</h1>
          <Link to="/add-house" className="btn btn-primary">
            <i className="bi bi-plus-lg"></i> Add New Property
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="no-properties">
            <i className="bi bi-house-x"></i>
            <h2>No Properties Listed</h2>
            <p>You haven't listed any properties yet.</p>
            <Link to="/add-house" className="btn btn-primary">
              List Your First Property
            </Link>
          </div>
        ) : (
          <div className="properties-grid">
            {properties.map((property) => (
              <div key={property._id} className="property-card">
                <div className="property-image">
                  <img
                    src={getImageUrl(property.images[0])}
                    alt={property.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  {property.images.length > 1 && (
                    <div className="image-count">
                      <i className="bi bi-images"></i>
                      <span>{property.images.length}</span>
                    </div>
                  )}
                </div>
                <div className="property-details">
                  <h3>{property.title}</h3>
                  <p className="location">
                    <i className="bi bi-geo-alt"></i>
                    {property.address.city}, {property.address.state}
                  </p>
                  <p className="price">${property.price}/month</p>
                  <div className="features">
                    <span><i className="bi bi-door-closed"></i> {property.bedrooms} beds</span>
                    <span><i className="bi bi-droplet"></i> {property.bathrooms} baths</span>
                    <span><i className="bi bi-rulers"></i> {property.squareFeet} sq ft</span>
                  </div>
                  <div className="property-actions">
                    <Link to={`/houses/${property._id}`} className="btn btn-outline-primary">
                      <i className="bi bi-eye"></i> View
                    </Link>
                    <Link to={`/edit-house/${property._id}`} className="btn btn-outline-secondary">
                      <i className="bi bi-pencil"></i> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="btn btn-outline-danger"
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;
