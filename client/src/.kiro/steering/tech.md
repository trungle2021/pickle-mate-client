# Technology Stack

## Frontend Framework
- **React 18** with TypeScript
- **Vite** as build tool and dev server
- **Tailwind CSS** for styling with dark mode support

## Key Libraries
- **@tanstack/react-query** - Server state management and caching
- **axios** - HTTP client with retry logic and interceptors
- **React Context API** - Global state management
- **shadcn/ui** - UI component library built on Radix UI

## Architecture Patterns
- Custom hooks for reusable logic
- Context providers for global state
- Service layer pattern for API calls
- Centralized API client with retry mechanisms

## Development Workflow
Since no package.json was found in the current directory, build commands may be located in the parent directory. Common Vite commands:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linting
```

## API Integration
- RESTful API calls through centralized `apiClient`
- Automatic retry logic with exponential backoff
- Error handling and logging
- Backend endpoint: `https://pickle-mate-server.vercel.app/`