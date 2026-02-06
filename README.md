# Google Drive Frontend

React-based frontend for Google Drive application with authentication, file management, and AWS S3 integration.

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context/Hooks
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Drag & Drop**: React DnD
- **Icons**: React Icons

## Prerequisites

- Node.js v16+
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/username/googledrive-frontend.git
cd googledrive-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. Start development server:
```bash
npm start
```

Application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable components
├── pages/               # Page components
├── services/            # API services
├── context/             # React Context
├── hooks/               # Custom hooks
├── styles/              # Global styles
├── utils/               # Utility functions
└── App.js               # App entry point
```

## Features

- ✅ User registration and login
- ✅ Email verification workflow
- ✅ Forgot password functionality
- ✅ Dashboard with file/folder display
- ✅ Create folders
- ✅ Drag & drop file upload
- ✅ File download
- ✅ File deletion
- ✅ Toast notifications
- ✅ Responsive design with Tailwind CSS

## Authentication

- JWT token-based authentication
- Token stored in localStorage
- Automatic token refresh
- Protected routes

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`

### Auth Endpoints
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/verify-email` - Verify email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### File Endpoints
- `GET /files` - List files/folders
- `POST /files/folder` - Create folder
- `POST /files/upload` - Upload file
- `GET /files/:fileId/download` - Download file
- `DELETE /files/:fileId` - Delete file

## Development

```bash
npm start      # Start dev server
npm build      # Build for production
npm test       # Run tests
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## License

MIT
