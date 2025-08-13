import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AddMovie.css';

const EditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: [],
    duration: '',
    rating: 'PG',
    releaseDate: '',
    director: '',
    cast: [],
    language: 'English',
    trailer: '',
    theater: {
      name: '',
      location: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    showtimes: [],
    active: true
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMovieDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const movie = response.data;
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        genre: movie.genre || [],
        duration: movie.duration || '',
        rating: movie.rating || 'PG',
        releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
        director: movie.director || '',
        cast: movie.cast || [],
        language: movie.language || 'English',
        trailer: movie.trailer || '',
        theater: movie.theater || {
          name: '',
          location: { street: '', city: '', state: '', zipCode: '' }
        },
        showtimes: movie.showtimes || [],
        active: movie.active !== false
      });
      
      setExistingImages(movie.images || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movie:', error);
      setError('Failed to load movie details');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value
            }
          }
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleGenreChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      genre: value.split(',').map(g => g.trim()).filter(g => g)
    }));
  };

  const handleCastChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      cast: value.split(',').map(c => c.trim()).filter(c => c)
    }));
  };

  const handleShowtimeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      showtimes: prev.showtimes.map((showtime, i) => 
        i === index ? { ...showtime, [field]: value } : showtime
      )
    }));
  };

  const addShowtime = () => {
    setFormData(prev => ({
      ...prev,
      showtimes: [...prev.showtimes, {
        date: '',
        time: '',
        screen: 'Screen 1',
        totalSeats: 100,
        availableSeats: 100,
        price: 200
      }]
    }));
  };

  const removeShowtime = (index) => {
    setFormData(prev => ({
      ...prev,
      showtimes: prev.showtimes.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    setSelectedImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to update the movie');
      }

      const movieFormData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'genre' || key === 'cast') {
          movieFormData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'theater') {
          movieFormData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'showtimes') {
          movieFormData.append(key, JSON.stringify(formData[key]));
        } else {
          movieFormData.append(key, formData[key]);
        }
      });

      selectedImages.forEach(image => {
        movieFormData.append('images', image);
      });

      await axios.patch(
        `http://localhost:5000/api/movies/${id}`,
        movieFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      navigate('/my-movies');
    } catch (error) {
      console.error('Error updating movie:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update movie');
    } finally {
      setUpdating(false);
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
    <div className="add-movie">
      <div className="container">
        <h2 className="mb-4">Edit Movie</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-movie-form">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Director *</label>
                <input
                  type="text"
                  className="form-control"
                  name="director"
                  value={formData.director}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Genres (comma separated) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Action, Drama, Comedy"
                  value={formData.genre.join(', ')}
                  onChange={handleGenreChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Cast (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Actor 1, Actor 2, Actor 3"
                  value={formData.cast.join(', ')}
                  onChange={handleCastChange}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Duration (minutes) *</label>
                <input
                  type="number"
                  className="form-control"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Rating *</label>
                <select
                  className="form-control"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                >
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="NC-17">NC-17</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Release Date *</label>
                <input
                  type="date"
                  className="form-control"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Language</label>
                <input
                  type="text"
                  className="form-control"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="active">
                Movie is active and available for booking
              </label>
            </div>
          </div>

          {/* Theater Information */}
          <h4 className="mt-4 mb-3">Theater Information</h4>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Theater Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="theater.name"
                  value={formData.theater.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-control"
                  name="theater.location.city"
                  value={formData.theater.location.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Showtimes */}
          <h4 className="mt-4 mb-3">Showtimes</h4>
          {formData.showtimes.map((showtime, index) => (
            <div key={index} className="showtime-item mb-3 p-3 border rounded">
              <div className="row">
                <div className="col-md-2">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={showtime.date ? showtime.date.split('T')[0] : ''}
                    onChange={(e) => handleShowtimeChange(index, 'date', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={showtime.time}
                    onChange={(e) => handleShowtimeChange(index, 'time', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Screen</label>
                  <input
                    type="text"
                    className="form-control"
                    value={showtime.screen}
                    onChange={(e) => handleShowtimeChange(index, 'screen', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Total Seats</label>
                  <input
                    type="number"
                    className="form-control"
                    value={showtime.totalSeats}
                    onChange={(e) => handleShowtimeChange(index, 'totalSeats', parseInt(e.target.value))}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={showtime.price}
                    onChange={(e) => handleShowtimeChange(index, 'price', parseInt(e.target.value))}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeShowtime(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            className="btn btn-outline-primary mb-3"
            onClick={addShowtime}
          >
            Add Showtime
          </button>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Current Images</label>
              <div className="image-preview">
                <div className="row">
                  {existingImages.map((image, index) => (
                    <div key={index} className="col-md-2 mb-2">
                      <img
                        src={`http://localhost:5000/${image}`}
                        alt={`Current ${index + 1}`}
                        className="img-thumbnail"
                        style={{ height: '100px', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="mb-3">
            <label className="form-label">Add New Images (Max 10)</label>
            <input
              type="file"
              className="form-control"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {previewImages.length > 0 && (
            <div className="image-preview mb-3">
              <div className="row">
                {previewImages.map((preview, index) => (
                  <div key={index} className="col-md-2 mb-2">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="img-thumbnail"
                      style={{ height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? 'Updating Movie...' : 'Update Movie'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/my-movies')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovie;