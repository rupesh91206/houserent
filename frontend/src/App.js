import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import HouseList from './components/HouseList';
import AddHouse from './components/AddHouse';
import HouseDetail from './components/HouseDetail';
import MyProperties from './components/MyProperties';
import EditHouse from './components/EditHouse';
import Bookings from './components/Bookings';
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
              <Route path="/houses" element={<HouseList />} />
              <Route
                path="/add-house"
                element={
                  <PrivateRoute>
                    <AddHouse />
                  </PrivateRoute>
                }
              />
              <Route path="/houses/:id" element={<HouseDetail />} />
              <Route path="/my-properties" element={<MyProperties />} />
              <Route path="/edit-house/:id" element={<EditHouse />} />
              <Route
                path="/bookings"
                element={
                  <PrivateRoute>
                    <Bookings />
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
