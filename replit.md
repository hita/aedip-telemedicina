# AEDIP Medical Consultation Platform

## Overview

This is a specialized medical consultation platform for healthcare professionals focusing on primary immunodeficiencies. The application facilitates secure communication between doctors (médicos) and experts (expertos) for case consultations, built with a full-stack TypeScript architecture.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Custom implementation with bcrypt password hashing
- **Database ORM**: Drizzle ORM for type-safe database operations

### Database Design
- **Primary Database**: PostgreSQL via Neon serverless
- **Tables**: 
  - `users`: User authentication and profiles
  - `cases`: Medical consultation cases
  - `messages`: Chat messages for case discussions
- **Schema**: Centralized in `shared/schema.ts` for type safety

## Key Components

### Authentication System
- Role-based access control (médico/experto/coordinador)
- Secure password hashing with bcrypt (12 rounds)
- Anonymous nickname generation for privacy
- Session-based authentication with server-side storage
- Route guards preventing unauthorized access

### Case Management
- Unique 4-character hash IDs for case identification
- Status workflow management (Nuevo → En revisión → Resuelto/Cancelado)
- Urgency levels (Alta/Media/Baja)
- Expert assignment system for case routing
- Centro de Referencia tracking for experts

### Coordinator Dashboard
- Complete user management (create, edit, delete, password reset)
- Case oversight and manual expert assignment
- Centro de Referencia management for expert specialization
- Full-width viewport design for comprehensive data management

### Real-time Communication
- Chat system for case discussions
- Message polling for real-time updates
- Unread message tracking per user
- Anonymous communication support

### User Interface
- Mobile-first responsive design
- Medical professional color scheme
- Accessibility features with Radix UI
- Progressive web app capabilities

## Data Flow

1. **Authentication Flow**: Login → Session validation → Role-based routing
2. **Case Creation**: Doctor creates case → Auto-generates hash ID → Assigns to expert pool
3. **Expert Assignment**: Expert claims case → Status updates to "En revisión"
4. **Communication**: Real-time chat updates → Message status tracking
5. **Case Resolution**: Expert/Doctor marks resolved → Historical tracking

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **bcrypt**: Password hashing and verification
- **drizzle-orm**: Type-safe database ORM
- **express-session**: Session management
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety across the stack
- **Zod**: Runtime type validation

## Deployment Strategy

### Development Environment
- **Replit**: Primary development platform
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Build Process**: Vite for client, esbuild for server
- **Server**: Express.js serving static assets and API
- **Database**: Production PostgreSQL with migrations via Drizzle

### Configuration
- **Environment Variables**: Database URL, session secrets
- **Build Commands**: 
  - Development: `npm run dev`
  - Production: `npm run build && npm run start`
- **Database Management**: `npm run db:push` for schema updates

## Recent Changes
```
- June 25, 2025: Initial setup completed
- June 25, 2025: Added Coordinator role with independent dashboard
- June 25, 2025: Implemented Centro de Referencia system for experts
- June 25, 2025: Enhanced security with role-based access control
- June 25, 2025: Added comprehensive user and case management for coordinators
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```