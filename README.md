# Mental Health Tracker Frontend

Web interface for the Mental Health Tracker application.

## Features

- User authentication and profile management
- Google Sign-In integration
- Daily mood and activity logging
- Responsive design

## Tech Stack

- Next.js 15
- React & TypeScript
- Tailwind CSS
- React Hook Form
- Zod Validation
- date-fns
- Axios
- React Hot Toast

## Components

### Core Features

- Daily Log Entry Form
- Edit Log Form
- Trends Visualization
- Dashboard Overview

### UI Components

- Rating Component
- Loading Spinner
- Input Fields
- Text Areas
- Cards

## Setup

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see below)
4. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL="http://localhost:8080"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
```

## Authentication

Users can sign in using:

1. Email and password
2. Google account (Single Sign-On)

### Google Authentication

To enable Google Sign-In:

1. Create a project in Google Cloud Console
2. Configure OAuth 2.0 credentials
3. Add authorized JavaScript origins
4. Set the client ID in environment variables

## Project Structure

```
src/
├── app/                 # Next.js app router
│   └── (authenticated) # Protected routes
├── components/
│   ├── dashboard/      # Dashboard components
│   ├── logs/          # Logging components
│   └── ui/            # Shared UI components
├── lib/               # Utilities and API client
└── types/            # TypeScript definitions
```

## License

MIT
