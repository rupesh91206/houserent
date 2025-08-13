import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyMovies();
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMyMovies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/movies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter movies owned by current user
      const myMovies = response.data.filter(movie => 
        movie.owner && movie.owner._id === user._id
      );
      
      setMovies(myMovies);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to load your movies');
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh the movies list
      fetchMyMovies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
    <div className="my-movies container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Movies</h2>
        <Link to="/add-movie" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Add New Movie
        </Link>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {movies.length === 0 ? (
        <div className="no-movies text-center py-5">
          <i className="bi bi-film display-1 text-muted"></i>
          <h4 className="mt-3">No movies found</h4>
          <p className="text-muted mb-4">You haven't added any movies yet.</p>
          <Link to="/add-movie" className="btn btn-primary">
            Add Your First Movie
          </Link>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie._id} className="movie-card">
              <div className="movie-image">
                <img
                  src={
                    movie.images && movie.images[0]
                      ? `http://localhost:5000/${movie.images[0]}`
                      : 'https://via.placeholder.com/300x400?text=No+Poster'
                  }
                  alt={movie.title}
                  className="img-fluid"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400?text=No+Poster';
                  }}
                />
                <div className="movie-overlay">
                  <div className="movie-actions">
                    <Link
                      to={`/movies/${movie._id}`}
                      className="btn btn-sm btn-outline-light me-2"
                    >
                      <i className="bi bi-eye"></i> View
                    </Link>
                    <Link
                      to={`/edit-movie/${movie._id}`}
                      className="btn btn-sm btn-outline-warning me-2"
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteMovie(movie._id)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="movie-details">
                <h5 className="movie-title">{movie.title}</h5>
                <div className="movie-meta">
                  <span className="rating-badge">{movie.rating}</span>
                  <span className="duration">{formatDuration(movie.duration)}</span>
                </div>
                <div className="genre-tags">
                  {Array.isArray(movie.genre) ? movie.genre.slice(0, 2).map(g => (
                    <span key={g} className="genre-tag">{g}</span>
                  )) : <span className="genre-tag">{movie.genre}</span>}
                </div>
                <p className="director">
                  <i className="bi bi-person"></i> {movie.director}
                </p>
                <p className="release-date">
                  <i className="bi bi-calendar"></i> {formatDate(movie.releaseDate)}
                </p>
                {movie.theater && (
                  <p className="theater">
                    <i className="bi bi-geo-alt"></i> {movie.theater.name}
                  </p>
                )}
                <div className="showtimes-count">
                  <i className="bi bi-clock"></i> {movie.showtimes?.length || 0} showtime{movie.showtimes?.length !== 1 ? 's' : ''}
                </div>
                <div className="movie-status mt-2">
                  <span className={`badge ${movie.active ? 'bg-success' : 'bg-secondary'}`}>
                    {movie.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMovies;