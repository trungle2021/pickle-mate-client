# Project Structure

## Root Level
- `main.tsx` - Application entry point with providers setup
- `App.tsx` - Main app component with routing logic
- `config.ts` - Configuration constants and environment variables
- `vite-env.d.ts` - Vite type definitions

## Directory Organization

### `/components`
- `Navigation.tsx` - Main navigation bar component
- `theme-provider.tsx` - Theme context provider for dark/light mode
- `/ui/` - Reusable UI components (shadcn/ui based)
  - button, card, checkbox, dialog, dropdown-menu, form, input, label
- `/utils/` - Utility components like ThemeToggler

### `/contexts`
- `AppContext.tsx` - Global application state management
  - Navigation state, player selection, sessions, matches
  - Loading states and data fetching logic

### `/hooks`
- Custom React hooks for reusable logic
- `useNavigation.ts` - Navigation logic and validation
- `usePlayerSelection.ts` - Player selection management
- `useDebounce.ts`, `useTimeout.ts` - Utility hooks

### `/services`
- API service layer with domain-specific modules
- `apiClient.ts` - Centralized HTTP client with retry logic
- `playersApi.ts`, `matchesApi.ts`, `sessionsApi.ts`, `skillPointsApi.ts` - Domain APIs
- `api.ts` - Generic API utilities

### `/types`
- `api.ts` - TypeScript interfaces for API data models
- Player, Match, Session, and API response types

### `/pages`
- `Home.tsx` - Main dashboard/home page
- `Match.tsx` - Match management and gameplay page

### `/lib`
- `utils.ts` - Shared utility functions

### `/assets`
- `/styles/global.css` - Global CSS styles and Tailwind imports

## Naming Conventions
- PascalCase for React components and TypeScript interfaces
- camelCase for functions, variables, and file exports
- kebab-case for CSS classes (following Tailwind conventions)
- Descriptive file names that match their primary export