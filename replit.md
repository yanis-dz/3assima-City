# RIXEL ROLEPLAY - MTA Server Website

## Overview

This is a full-stack web application for RIXEL ROLEPLAY (ريكسل للحياة الواقعية), an MTA (Multi Theft Auto) gaming server community website. The application provides a public-facing website with news, rules, staff/factions information, and a store, along with an admin dashboard for content management. The site is primarily in Arabic with RTL (right-to-left) layout support.

**Server IP**: 109.176.229.142:22003

## User Preferences

- Preferred communication style: Simple, everyday language (Arabic)
- Design style: Dark zinc/black theme with blue primary color, inspired by FLN RP design
- Full-screen hero with background slider, centered content, rounded buttons (rounded-3xl)
- Stats section with animated counters
- Clean professional navbar with logo, nav links, server status badge

## Design System

### Colors & Theme
- **Primary**: Blue (hsl 217 91% 60%)
- **Background**: Zinc-950 (#09090b) for main sections
- **Cards/Sections**: Zinc-900 for alternating sections, Zinc-950 for cards
- **Borders**: Zinc-800 default, primary/50 on hover
- **Text**: White for headings, Zinc-300 for body, Zinc-400 for muted

### Typography
- **Display font**: 'Rajdhani' for headings (font-display)
- **Body font**: 'Tajawal' for Arabic body text (font-body)

### Component Patterns
- Buttons: `rounded-3xl` with large padding (px-10 py-5)
- Cards: `rounded-3xl` with zinc-950 bg and zinc-800 border
- Status badges: `rounded-2xl` with colored borders
- Navbar: Fixed top, transparent on top → dark on scroll

### Logo
- Logo image at `/images/logo.png` (blue RIXEL mark on black)
- Used in Navbar, Hero section, and Footer

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and effects
- **Icons**: lucide-react + react-icons (for brand logos like Discord)
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Key Frontend Files
- `client/src/components/Navbar.tsx` - Main navigation with scroll-based transparency
- `client/src/components/Footer.tsx` - Site footer with links
- `client/src/pages/Home.tsx` - Landing page with hero slider, stats, news, CTA
- `client/src/hooks/use-server-data.ts` - All API hooks (React Query)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Security**: Helmet with CSP, rate limiting
- **Session Management**: express-session with cookie-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **API Design**: RESTful endpoints

### Data Storage
- **Current**: JSON file-based storage in `server/data/` directory (`server/jsonStorage.ts`)
- **Prepared**: PostgreSQL with Drizzle ORM (configuration in `drizzle.config.ts`)
- **Schema Definition**: Zod schemas in `shared/schema.ts` define all data types

### Authentication & Authorization
- Session-based authentication with secure cookies
- Role-based access control: owner, admin, moderator, user
- Owner role required for admin dashboard access
- Default owner account seeded in `server/data/users.json`

### Pages
- `/` - Home (hero slider, stats, news, CTA)
- `/rules` - Server rules
- `/factions` or `/staff` - Factions/staff listing
- `/store` - Product store
- `/faq` - FAQ/support
- `/login` - Authentication (login/register + OAuth)
- `/admin` - Admin dashboard (owner only)
- `/account` - Account settings
- `/wallet` - Wallet management
- `/topup` - Top-up balance

## External Dependencies

### Database
- **Drizzle ORM**: Database toolkit configured for PostgreSQL
- **pg**: PostgreSQL client (node-postgres)

### UI Framework
- **Radix UI**: Full suite of accessible UI primitives
- **shadcn/ui**: Pre-built component library using Radix
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **react-icons**: Brand icons (Discord, etc.)

### Data & Forms
- **TanStack React Query**: Server state management and caching
- **Zod**: Schema validation for API inputs
- **React Hook Form** (with resolvers): Form handling

### Date/Time
- **date-fns**: Date formatting with Arabic locale support

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required when using database storage)
- `SESSION_SECRET`: Required for secure session management
