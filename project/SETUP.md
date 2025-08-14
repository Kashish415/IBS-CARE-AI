# IBS Care AI - Local Development Setup Guide

## 🚀 Quick Start (One Command Setup)

```bash
# Clone the repository (if downloading from GitHub)
git clone <your-repo-url>
cd ibs-care-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **pnpm** package manager
- **Git** (for version control)

## 🔧 Environment Setup

### 1. Supabase Setup

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Supabase Credentials**
   - In your Supabase dashboard, go to Settings → API
   - Copy the following values:
     - `Project URL` (VITE_SUPABASE_URL)
     - `anon public` key (VITE_SUPABASE_ANON_KEY)
     - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

3. **Set Up Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/create_initial_schema.sql`
   - Run the migration

### 2. Gemini API Setup

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key (GEMINI_API_KEY)

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration (Public - safe for frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-only Environment Variables (NEVER expose to frontend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key

# Optional: Development Configuration
NODE_ENV=development
```

**⚠️ IMPORTANT SECURITY NOTES:**
- Never commit the `.env` file to version control
- The `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` should NEVER be exposed to the frontend
- Only `VITE_*` prefixed variables are safe for frontend use

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Running Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🗄️ Database Setup Details

### Running Migrations

1. **Option 1: Supabase Dashboard (Recommended)**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy the contents of `supabase/migrations/create_initial_schema.sql`
   - Paste and execute the SQL

2. **Option 2: Supabase CLI (Advanced)**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push
   ```

### Database Schema Overview

The application uses the following main tables:

- **`profiles`** - User profile information
- **`daily_logs`** - Daily symptom and health tracking
- **`chat_messages`** - AI chat conversation history
- **`user_embeddings`** - Vector embeddings for personalized AI responses

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## 🤖 AI Integration Setup

### Supabase Edge Functions

1. **Deploy Edge Functions** (Optional - for production)
   ```bash
   # Deploy the Gemini chat function
   supabase functions deploy gemini-chat --project-ref your-project-ref
   ```

2. **Set Environment Variables in Supabase**
   - Go to Settings → Edge Functions in your Supabase dashboard
   - Add the `GEMINI_API_KEY` environment variable

### Local Development Note

For local development, the AI chat feature uses mock responses. To enable real AI responses:

1. Deploy the edge function to Supabase
2. Update the `useChat.ts` hook to call the actual edge function
3. Ensure your Gemini API key is properly configured

## 🔐 Authentication Setup

### Email/Password Authentication

Email/password authentication is enabled by default in Supabase.

### Google OAuth (Optional)

1. **Configure Google OAuth in Supabase**
   - Go to Authentication → Settings in your Supabase dashboard
   - Enable Google provider
   - Add your Google OAuth credentials

2. **Google Cloud Console Setup**
   - Create a project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

## 🚀 Deployment

### Frontend Deployment (Netlify)

1. **Connect to Netlify**
   - Push your code to GitHub
   - Connect your GitHub repository to Netlify
   - Netlify will automatically detect the build settings from `netlify.toml`

2. **Set Environment Variables in Netlify**
   - Go to Site Settings → Environment Variables
   - Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

3. **Deploy**
   - Netlify will automatically build and deploy your site
   - Your site will be available at `https://your-site-name.netlify.app`

### Backend Deployment (Supabase)

Your Supabase backend is already hosted. Just ensure:
- Database migrations are applied
- Edge functions are deployed (if using real AI)
- Environment variables are set

## 🧪 Testing

The application includes comprehensive tests:

- **Unit Tests** - Testing individual components and hooks
- **Integration Tests** - Testing complete user flows
- **Test Coverage** - Ensuring code quality

Run tests with:
```bash
npm run test
```

## 📱 Features Overview

### Core Features
- **User Authentication** - Secure signup/login with session management
- **Daily Logging** - Track mood, energy, symptoms, sleep, water intake
- **AI Chat Assistant** - Get personalized health insights
- **Dashboard** - Visual charts and health trends
- **History** - Browse and export past logs
- **Profile Management** - Account settings and data privacy

### Technical Features
- **Responsive Design** - Works on all devices
- **Real-time Updates** - Live dashboard updates
- **Offline Support** - Basic offline functionality
- **Data Export** - CSV and JSON export options
- **Accessibility** - WCAG AA compliant

## 🔧 Troubleshooting

### Common Issues

1. **White Screen on Load**
   - Check browser console for errors
   - Verify environment variables are set correctly
   - Ensure Supabase project is active

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check if database migrations were applied
   - Ensure RLS policies are enabled

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`
   - Verify all dependencies are installed

4. **Authentication Issues**
   - Check Supabase Auth settings
   - Verify redirect URLs are configured
   - Ensure JWT tokens are valid

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure database migrations have been applied
4. Check Supabase project status and quotas

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

## 🎯 Next Steps

After setup:
1. Create your first user account
2. Add some sample daily logs
3. Try the AI chat feature
4. Explore the dashboard and charts
5. Customize the application for your needs

The application is now ready for development and production use!