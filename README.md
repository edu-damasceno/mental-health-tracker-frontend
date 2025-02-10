# Mental Health Tracker Frontend

A modern, responsive Next.js application for tracking and visualizing daily mental health metrics.

## Features

- 📝 Daily mood and wellness logging
- 😊 Interactive mood tracking
- 😴 Sleep quality monitoring
- 🏃‍♂️ Activity logging
- 🎯 Symptom tracking
- 📊 Data visualization and trends
- 📱 Responsive design
- 🔄 Real-time updates

## Tech Stack

- Next.js 14
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
```

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
