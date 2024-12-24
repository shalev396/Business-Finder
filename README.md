# Business Finder Platform

A full-stack web application where users can find and interact with businesses. Built with React, TypeScript, Node.js, and MongoDB.

## Features

- **User Authentication**

  - Secure login and signup with JWT
  - Role-based access control
  - Different subscription plans (Standard, Gold, Platinum)

- **Business Management**

  - Create, read, update, and delete businesses
  - Search and filter businesses by name and category
  - Subscribe to businesses for updates
  - Leave reviews and comments

- **Real-time Notifications**

  - Receive updates when subscribed businesses change
  - WebSocket integration for instant notifications

- **Admin Features**
  - Moderate reviews
  - Manage businesses
  - User management

## Tech Stack

### Frontend

- React with TypeScript
- Tailwind CSS with shadcn/ui components
- TanStack Query for data fetching
- React Router for navigation
- Axios for API requests

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JSON Web Tokens for authentication
- WebSocket for real-time features

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/business-finder.git
cd business-finder
```

2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

```bash
# In backend directory
cp .env.example .env
```

Edit the `.env` file with your configuration:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/business-finder
JWT_SECRET=your-secret-key
```

4. Start the development servers:

```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
business-finder/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── contexts/
    │   ├── services/
    │   └── types/
    ├── package.json
    └── tsconfig.json
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Businesses

- `GET /api/businesses` - Get all businesses
- `POST /api/businesses` - Create a new business
- `GET /api/businesses/:id` - Get business details
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business

### Subscriptions

- `POST /api/businesses/:id/subscribe` - Subscribe to business
- `DELETE /api/businesses/:id/subscribe` - Unsubscribe from business

### Reviews

- `POST /api/businesses/:id/review` - Add review
- `GET /api/businesses/:id/reviews` - Get business reviews

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
