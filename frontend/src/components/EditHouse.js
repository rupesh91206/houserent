import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/AddHouse.css';

const EditHouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    amenities: [],
    images: [],
    keepExistingImages: true
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHouseDetails();
  }, [id, user, navigate]);

  const fetchHouseDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/houses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const house = response.data;
      setFormData({
        title: house.title,
        description: house.description,
        price: house.price,
        bedrooms: house.bedrooms,
        bathrooms: house.bathrooms,
        squareFeet: house.squareFeet,
        street: house.address.street,
        city: house.address.city,
        state: house.address.state,
        zipCode: house.address.zipCode,
        amenities: house.amenities || [],
        keepExistingImages: true
      });
      setExistingImages(house.images || []);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch house details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenitiesChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter(item => item !== value)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataObj = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else {
          formDataObj.append(key, formData[key]);
        }
      });

      // Append images
      selectedFiles.forEach(file => {
        formDataObj.append('images', file);
      });

      // Append existing images info
      formDataObj.append('keepExistingImages', 'true');

      const response = await axios.patch(
        `http://localhost:5000/api/houses/edit/${id}`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data) {
        navigate('/my-properties');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating property');
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

  return (
    <div className="add-house">
      <div className="container">
        <h1>Edit Property</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-12 mb-3">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Property Details</h2>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="price">Monthly Rent ($)</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="squareFeet">Square Feet</label>
                <input
                  type="number"
                  className="form-control"
                  id="squareFeet"
                  name="squareFeet"
                  value={formData.squareFeet}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="bedrooms">Bedrooms</label>
                <input
                  type="number"
                  className="form-control"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="bathrooms">Bathrooms</label>
                <input
                  type="number"
                  className="form-control"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Address</h2>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label htmlFor="street">Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  className="form-control"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Amenities</h2>
            <div className="amenities-grid">
              {[
                'Air Conditioning',
                'Heating',
                'Washer/Dryer',
                'Parking',
                'Gym',
                'Pool',
                'Dishwasher',
                'Furnished',
                'Pet Friendly',
                'Security System'
              ].map((amenity) => (
                <div key={amenity} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={amenity}
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={handleAmenitiesChange}
                  />
                  <label className="form-check-label" htmlFor={amenity}>
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Images</h2>
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h3>Existing Images</h3>
                <div className="image-previews">
                  {existingImages.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img
                        src={`http://localhost:5000${image}`}
                        alt={`Existing ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeExistingImage(index)}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="images">Add New Images</label>
              <input
                type="file"
                className="form-control"
                id="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
              />
            </div>
            
            {previewUrls.length > 0 && (
              <div className="image-previews">
                {previewUrls.map((url, index) => (
                  <div key={index} className="image-preview">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeNewImage(index)}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/my-properties')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHouse;
