import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import MovieList from './components/MovieList';
import AddMovie from './components/AddMovie';
import MovieDetail from './components/MovieDetail';
import MyMovies from './components/MyMovies';
import EditMovie from './components/EditMovie';
import MyTickets from './components/MyTickets';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/movies" element={<MovieList />} />
              <Route
                path="/add-movie"
                element={
                  <PrivateRoute>
                    <AddMovie />
                  </PrivateRoute>
                }
              />
              <Route path="/movies/:id" element={<MovieDetail />} />
              <Route path="/my-movies" element={<MyMovies />} />
              <Route path="/edit-movie/:id" element={<EditMovie />} />
              <Route
                path="/my-tickets"
                element={
                  <PrivateRoute>
                    <MyTickets />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
