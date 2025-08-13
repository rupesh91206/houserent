import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AddHouse.css';

const AddHouse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    amenities: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setSelectedImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to create a listing');
        return;
      }

      const amenitiesArray = formData.amenities
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '');

      // Create FormData object to send files
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'address') {
          Object.keys(formData.address).forEach(addressKey => {
            formDataToSend.append(`address[${addressKey}]`, formData.address[addressKey]);
          });
        } else if (key === 'amenities') {
          amenitiesArray.forEach(amenity => {
            formDataToSend.append('amenities[]', amenity);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append images
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post('http://localhost:5000/api/houses', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Clean up preview URLs
      previewImages.forEach(url => URL.revokeObjectURL(url));
      
      navigate('/houses');
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error creating house listing');
    }
  };

  return (
    <div className="add-house">
      <div className="add-house-card">
        <h2>Add New House Listing</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="price" className="form-label">Price per Month ($)</label>
            <input
              type="number"
              className="form-control"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="bedrooms" className="form-label">Bedrooms</label>
              <input
                type="number"
                className="form-control"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="bathrooms" className="form-label">Bathrooms</label>
              <input
                type="number"
                className="form-control"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="squareFeet" className="form-label">Square Feet</label>
              <input
                type="number"
                className="form-control"
                id="squareFeet"
                name="squareFeet"
                value={formData.squareFeet}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="address.street" className="form-label">Street Address</label>
            <input
              type="text"
              className="form-control"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="address.city" className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="address.state" className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="address.zipCode" className="form-label">ZIP Code</label>
              <input
                type="text"
                className="form-control"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="amenities" className="form-label">Amenities (comma-separated)</label>
            <input
              type="text"
              className="form-control"
              id="amenities"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="e.g. WiFi, Parking, Pool"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="images" className="form-label">Images (up to 5)</label>
            <input
              type="file"
              className="form-control"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
            />
            {previewImages.length > 0 && (
              <div className="image-previews mt-2">
                {previewImages.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="preview-image"
                  />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary">Create Listing</button>
        </form>
      </div>
    </div>
  );
};

export default AddHouse;
