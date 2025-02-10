# Mental Health Tracker Frontend

A Next.js application for tracking and visualizing mental health metrics.

## Features

- User authentication
- Daily mood, anxiety and stress tracking
- Interactive trend visualization
- Real-time updates
- Responsive design
- Form validation
- Error handling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL="http://localhost:8080/api"
```

4. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Project Structure

```
src/
  app/              # Next.js app router pages
  components/       # React components
  contexts/        # React contexts
  lib/             # Utility functions
  types/           # TypeScript types
```

## License

MIT
