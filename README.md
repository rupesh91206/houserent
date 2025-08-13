# MovieTix - Movie Ticket Booking System

A MERN stack web application for movie ticket booking and cinema management.

## Features
- User Authentication (Sign Up/Sign In)
- Movie listings with detailed information
- Advanced search and filtering (genre, rating, city)
- Interactive seat selection for movie showtimes
- Ticket booking and management system
- Cinema owner dashboard for movie management
- Responsive and modern UI design

## Tech Stack
- MongoDB: Database
- Express.js: Backend framework
- React.js: Frontend library
- Node.js: Runtime environment
- Bootstrap: UI styling

## Setup Instructions
1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Create a `.env` file in the backend directory with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/movietix
   JWT_SECRET=your-secret-key
   PORT=5000
   ```
4. Run the application:
   ```bash
   # Start backend server
   cd backend
   npm start

   # Start frontend development server (in another terminal)
   cd frontend
   npm start
   ```

## Key Features

### For Movie-Goers
- Browse movies with filters for genre, rating, and location
- View detailed movie information including cast, director, and showtimes
- Interactive seat selection interface
- Book tickets for specific showtimes
- Manage your ticket bookings
- View booking history and ticket details

### For Cinema Owners
- Add and manage movie listings
- Set up showtimes with different screens and pricing
- Upload movie posters and promotional materials
- View booking analytics and customer details
- Manage theater information and locations

## API Endpoints

### Movies
- `GET /api/movies` - Get all movies with optional filters
- `GET /api/movies/:id` - Get specific movie details
- `POST /api/movies` - Create new movie (cinema owners only)
- `PATCH /api/movies/:id` - Update movie details
- `DELETE /api/movies/:id` - Delete movie

### Tickets
- `GET /api/movies/:id/showtimes/:showtimeIndex/seats` - Get seat availability
- `POST /api/movies/:id/book` - Book movie tickets
- `GET /api/my-tickets` - Get user's tickets
- `GET /api/my-movie-bookings` - Get cinema owner's bookings
- `PATCH /api/tickets/:id/status` - Update ticket status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## UI Components

### User Interface
- **MovieList**: Browse movies with advanced filtering
- **MovieDetail**: Detailed movie view with seat selection
- **MyTickets**: User ticket management dashboard

### Cinema Owner Interface
- **AddMovie**: Add new movies with showtimes
- **MyMovies**: Manage owned movie listings
- **EditMovie**: Update movie details and showtimes

## Database Models

### Movie Schema
- Basic info: title, description, director, cast, genre
- Technical details: duration, rating, release date, language
- Theater information: name, location, screens
- Showtimes: dates, times, pricing, seat availability

### Ticket Schema
- Movie and user references
- Showtime details: date, time, screen
- Seat selection: seat numbers and types
- Booking information: reference number, status, payment
- Pricing: total amount and seat-specific pricing

## Development Notes
- Built with responsive design for mobile and desktop
- Includes comprehensive error handling and validation
- Optimized for production deployment
- Follows React best practices and modern JavaScript patterns
