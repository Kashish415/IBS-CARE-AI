# IBS Care AI

A production-ready, accessible web application for IBS patients to track symptoms, get AI-powered insights, and manage their health journey.

## 🚀 Tech Stack

- **Frontend**: React + TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI**: Gemini API for personalized health insights
- **Charts**: Recharts for data visualization
- **State Management**: TanStack Query + React Context
- **Testing**: Vitest + Testing Library
- **Deployment**: Netlify (Frontend) + Supabase (Backend)

## 📋 Features

- **Authentication**: Email/password + Google OAuth
- **Daily Logging**: Track mood, energy, symptoms, sleep, water intake
- **AI Chat**: Personalized health insights using Gemini + user history
- **Dashboard**: Real-time charts and health trends
- **History**: Searchable logs with export functionality
- **Profile Management**: Account settings and data privacy controls

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Google Cloud account (for Gemini API)

### Environment Variables

Create `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-only (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key

# Deployment
NETLIFY_SITE_ID=your_netlify_site_id
```

### One-Command Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

1. Create a new Supabase project
2. Run the migration scripts in `/supabase/migrations/`
3. Enable Row Level Security policies
4. Set up authentication providers (Google OAuth optional)

### Edge Functions Setup

Deploy the Gemini chat function to Supabase:

```bash
# Deploy edge functions (if using Supabase CLI)
supabase functions deploy gemini-chat
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### One-Click Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 📊 Database Schema

The application uses the following main tables:

- `profiles` - User profile information
- `daily_logs` - Daily symptom and health tracking
- `chat_messages` - AI chat conversation history
- `user_embeddings` - Vector embeddings for personalized AI responses

## 🤖 AI Integration

The AI chat system combines:

1. **Gemini LLM** for natural language processing
2. **User History** from daily logs for personalization
3. **Vector Search** (optional) for relevant context retrieval

### LLM Prompt Template

The system uses a structured prompt that includes:
- User's recent health logs
- Symptom patterns and trends
- Personalized recommendations
- Medical disclaimer and safety guidelines

## 🔒 Security & Privacy

- **Row Level Security (RLS)** ensures users only access their data
- **JWT Authentication** with secure session management
- **Server-side API calls** keep sensitive keys secure
- **Data Export & Deletion** for user privacy control

## 📱 Responsive Design

- Mobile-first responsive design
- Accessible (WCAG AA compliant)
- Smooth animations and micro-interactions
- Dark mode support

## 🧩 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles

supabase/
├── migrations/         # Database migration scripts
└── functions/          # Edge functions
```

## 🔄 Development Workflow

1. **Feature Development**: Create feature branches
2. **Testing**: Write unit tests for new features
3. **Code Review**: PR review process
4. **CI/CD**: Automated testing and deployment
5. **Monitoring**: Error tracking and performance monitoring

## 📈 Performance

- **Code Splitting**: Lazy loading for optimal bundle size
- **Caching**: Intelligent caching with TanStack Query
- **Real-time Updates**: Supabase subscriptions for live data
- **Optimistic Updates**: Immediate UI feedback

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing GitHub issues
3. Create a new issue with detailed information

## 📄 License

This project is licensed under the MIT License.

---

**Medical Disclaimer**: This application provides supportive guidance and is not intended for medical diagnosis. Always consult healthcare professionals for medical advice.