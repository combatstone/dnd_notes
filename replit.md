# Campaign Chronicle - Digital DM Notebook

## Overview

Campaign Chronicle is a full-stack web application designed for Dungeon Masters to manage their D&D campaigns. It provides a comprehensive digital notebook system for tracking timeline events, characters, plots, and world lore. The application features AI-powered document processing to automatically extract and organize campaign information from uploaded documents, making it easier for DMs to maintain detailed campaign records.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Handling**: Multer for document uploads with support for PDF, TXT, DOC, and DOCX files
- **AI Integration**: OpenAI API for document processing and content extraction

### Data Architecture
The application uses a PostgreSQL database with the following core entities:
- **Campaigns**: Main campaign containers with metadata
- **Timeline Events**: Chronological campaign events with linking to characters, plots, and locations
- **Characters**: Both player characters and NPCs with detailed attributes
- **Plots**: Storylines categorized as main plots, subplots, or side quests
- **Lore Entries**: World-building content organized by categories (locations, history, organizations, etc.)
- **Documents**: Uploaded campaign materials with processing metadata

### Authentication & Sessions
- Session-based authentication using PostgreSQL session storage
- Connect-pg-simple for session management

### AI Document Processing
- Automated extraction of characters, events, plots, and lore from uploaded documents
- Configurable processing options for selective content extraction
- Integration with campaign data structures for seamless organization

### Development Environment
- TypeScript configuration supporting both client and server code
- Path aliases for clean imports (@/, @shared/, @assets/)
- Development server with hot module replacement
- Replit-specific tooling for cloud development

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for frontend state management
- **Node.js Backend**: Express.js, TypeScript execution via tsx
- **Database**: Drizzle ORM, Neon Database serverless driver, PostgreSQL session store

### UI & Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS for processing
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation resolvers

### AI & File Processing
- **OpenAI**: GPT integration for document processing and content extraction
- **File Upload**: Multer for handling multipart form data
- **Document Processing**: Support for PDF, DOC, DOCX, and TXT file formats

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Migrations**: Drizzle Kit for schema management
- **Development Environment**: Replit-specific plugins for cloud development
- **Code Quality**: TypeScript for static typing, ESBuild for production bundling

### Additional Libraries
- **Date Handling**: date-fns for date manipulation and formatting
- **Utilities**: clsx and class-variance-authority for conditional styling
- **Carousel**: Embla Carousel for interactive UI components
- **Validation**: Zod with Drizzle integration for schema validation