import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/MovieList.css';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    rating: '',
    city: ''
  });

  useEffect(() => {
    fetchMovies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`http://localhost:5000/api/movies?${queryParams}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again later.');
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
    fetchMovies();
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300x400?text=No+Poster';
    return `http://localhost:5000/${imageUrl}`;
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
    <div className="movie-list">
      <div className="filters-section mb-4">
        <form onSubmit={handleSubmit} className="filter-form">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search movies..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-control"
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
              >
                <option value="">All Genres</option>
                <option value="Action">Action</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Horror">Horror</option>
                <option value="Romance">Romance</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Thriller">Thriller</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-control"
                name="rating"
                value={filters.rating}
                onChange={handleFilterChange}
              >
                <option value="">All Ratings</option>
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="NC-17">NC-17</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="City"
                name="city"
                value={filters.city}
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

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {movies.map((movie) => (
          <div key={movie._id} className="col">
            <Link to={`/movies/${movie._id}`} className="text-decoration-none">
              <div className="card h-100 movie-card">
                <div className="image-container">
                  <img
                    src={movie.images && movie.images[0] ? getImageUrl(movie.images[0]) : 'https://via.placeholder.com/300x400?text=No+Poster'}
                    className="card-img-top movie-poster"
                    alt={movie.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x400?text=No+Poster';
                    }}
                  />
                  <div className="rating-badge">{movie.rating}</div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <p className="card-text director">
                    <i className="bi bi-person"></i> {movie.director}
                  </p>
                  <p className="card-text genre">
                    {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                  </p>
                  <div className="movie-details">
                    <span><i className="bi bi-clock"></i> {formatDuration(movie.duration)}</span>
                    <span><i className="bi bi-calendar"></i> {new Date(movie.releaseDate).getFullYear()}</span>
                  </div>
                  {movie.theater && (
                    <p className="card-text theater">
                      <i className="bi bi-geo-alt"></i> {movie.theater.name}
                    </p>
                  )}
                  <div className="showtimes-preview">
                    {movie.showtimes && movie.showtimes.length > 0 && (
                      <small className="text-muted">
                        {movie.showtimes.length} showtime{movie.showtimes.length !== 1 ? 's' : ''} available
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {movies.length === 0 && !loading && (
        <div className="text-center py-5">
          <h4>No movies found</h4>
          <p>Try adjusting your filters or check back later for new movies.</p>
        </div>
      )}
    </div>
  );
};

export default MovieList;