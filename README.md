# SaaS Template

A modern, production-ready Next.js SaaS template with authentication, database, email, analytics, and more.

## 🚀 Tech Stack

### Core

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 19** - Latest React features

### Styling

- **Tailwind CSS v4** - Utility-first CSS framework with CSS-first configuration
- **shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Icon library

### Database & ORM

- **Prisma** - Next-generation ORM
- **PostgreSQL** - Database (via Supabase)
- **Supabase** - Local development database

### Authentication

- **Better-auth** - Modern authentication library
- Magic link authentication (passwordless)
- Session management

### State Management

- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management

### HTTP Client

- **Axios** - HTTP client with interceptors
- Global error handling
- Automatic error state management

### Email

- **Resend** - Email delivery service
- **React Email** - Build beautiful emails with React
- **Tailwind CSS** - Styled email templates

### Analytics

- **PostHog** - Product analytics (client & server-side)

### UI/UX

- **React Hot Toast** - Toast notifications
- **shadcn/ui** - Pre-built accessible components

## 📦 Features

- ✅ Authentication with Better-auth (Magic Link)
- ✅ Database with Prisma + PostgreSQL (Supabase)
- ✅ Email sending with Resend + React Email
- ✅ Waitlist functionality
- ✅ Payment processing with Lemon Squeezy
- ✅ Global error handling
- ✅ API client with React Query hooks
- ✅ State management with Zustand
- ✅ Analytics with PostHog
- ✅ UI components with shadcn/ui
- ✅ TypeScript throughout
- ✅ Tailwind CSS v4 styling

## 🛠️ Setup Guide

Follow these steps to get your SaaS template up and running.

### Prerequisites

Before you begin, make sure you have installed:

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm/yarn/pnpm** - Package manager (npm comes with Node.js)
- **Docker Desktop** - Required for local Supabase development
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Make sure Docker is running before starting Supabase

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd saas-template
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, Better-auth, and other dependencies.

### Step 3: Set Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open `.env` and configure the following variables:

#### Database Configuration (Supabase Local)

When you start Supabase locally, it will provide these URLs. For now, use the defaults:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54325/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54325/postgres"
```

#### Authentication (Better-auth)

Generate a secure secret key for Better-auth:

```bash
# Generate a random secret (you can use this command)
openssl rand -base64 32
```

Then add to `.env`:

```env
BETTER_AUTH_SECRET="your-generated-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

#### Email Service (Resend)

1. Sign up for a free account at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add to `.env`:

```env
RESEND_API_KEY="re_your_api_key_here"
```

**Note:** For development/testing, you can use Resend's test domain `onboarding@resend.dev` as the `from` email address. For production, you'll need to verify your own domain.

#### Analytics (PostHog) - Optional

1. Sign up at [PostHog](https://posthog.com) (free tier available)
2. Get your API key from project settings
3. Add to `.env`:

```env
NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

#### Payment Processing (Lemon Squeezy) - Optional

1. Sign up at [Lemon Squeezy](https://lemonsqueezy.com)
2. Create a store and products/variants
3. Get checkout URLs from your Lemon Squeezy dashboard
4. Add checkout URLs to `config.json` in the `pricing.plans` array:

```json
{
  "pricing": {
    "plans": [
      {
        "id": "starter",
        "name": "Starter",
        "checkoutUrl": "https://yourstore.lemonsqueezy.com/buy/{variant-id}?redirect=https://yourdomain.com/checkout/success"
      }
    ]
  }
}
```

**Optional:** If you want to use webhooks for payment events, add to `.env`:

```env
LEMON_SQUEEZY_WEBHOOK_SECRET="your_webhook_secret_here"
```

Then configure the webhook URL in your Lemon Squeezy dashboard: `https://yourdomain.com/api/webhooks/lemonsqueezy`

#### App Environment

```env
NEXT_PUBLIC_APP_ENV="development"
```

### Step 4: Start Supabase (Local Database)

Supabase provides a local PostgreSQL database for development.

1. Start Supabase:

```bash
supabase start
```

This will:

- Start a local PostgreSQL database
- Start Supabase Studio (database GUI)
- Provide connection URLs

2. **Important:** After starting Supabase, check the output and update your `.env` file if the database URLs are different from the defaults.

3. Access Supabase Studio (optional):
   - Open http://127.0.0.1:54328 in your browser
   - You can view and manage your database here

### Step 5: Set Up Database Schema

The template includes a Prisma schema with models for authentication and waitlist. Since the migrations folder is empty (by design), you need to create your initial migration or push the schema directly.

**Option A: Create Migration (Recommended for Production)**

This creates a migration file that you can version control:

```bash
npm run db:migrate
```

When prompted, enter a migration name like `initial_setup` or `init`.

This will:

- Create a migration file in `src/lib/db/migrations/`
- Apply the migration to your database
- Generate Prisma Client automatically

**Option B: Push Schema Directly (Quick for Development)**

This syncs your database schema without creating migration files:

```bash
npm run db:push
```

This is faster and useful for rapid prototyping, but doesn't create migration files for version control.

**Which option to choose?**

- Use **Option A** (`db:migrate`) if you want to track schema changes in git
- Use **Option B** (`db:push`) if you're just prototyping and don't need migration history

**Note:** After running either command, the database will have all tables from `schema.prisma`:

- `user` - User accounts
- `session` - User sessions
- `account` - Authentication accounts
- `verification` - Email verification tokens
- `waitlist` - Waitlist entries

### Step 6: Generate Prisma Client (if needed)

If you used `db:push` in Step 5, you need to generate Prisma Client manually:

```bash
npm run db:generate
```

**Note:** If you used `db:migrate`, Prisma Client is generated automatically, so you can skip this step.

### Step 7: Configure Your Project

1. Open `config.json` and update with your project details:

```json
{
  "project": {
    "name": "Your SaaS Name",
    "shortName": "YourSaaS",
    "description": "Your project description",
    "tagline": "Your tagline here",
    "url": "https://yourdomain.com"
  },
  "contact": {
    "email": "hello@yourdomain.com",
    "supportEmail": "support@yourdomain.com"
  }
}
```

2. Update SEO settings, social links, and feature flags as needed.

### Step 8: Start Development Server

```bash
npm run dev
```

Your application will be available at:

- **Frontend:** http://localhost:3000
- **Supabase Studio:** http://127.0.0.1:54328

### Step 9: Verify Setup

1. **Check Authentication:**
   - Click "Sign In" in the navbar
   - Try signing in with a magic link (email will be sent via Resend)

2. **Check Waitlist:**
   - Scroll to the hero section on the homepage
   - Try joining the waitlist with an email address

3. **Check Database:**
   - Open Supabase Studio at http://127.0.0.1:54328
   - Verify tables are created (user, session, account, waitlist, etc.)

### Troubleshooting

#### Database Connection Issues

- Make sure Docker is running
- Verify Supabase is started: `supabase status`
- Check that `DATABASE_URL` in `.env` matches Supabase output

#### Migration Errors

- If migrations fail, try `npm run db:push` instead
- Make sure your database is running: `supabase status`
- Check Prisma schema syntax: `npx prisma validate`

#### Email Not Sending

- Verify `RESEND_API_KEY` is set correctly
- For development, use `onboarding@resend.dev` as the `from` email
- Check Resend dashboard for email logs
- Check server console for error messages

#### Port Already in Use

- Change the port in `next.config.ts` or use: `npm run dev -- -p 3001`
- For Supabase ports, edit `supabase/config.toml`

### Next Steps

- Customize `config.json` with your branding
- Update landing page content in `src/components/sections/`
- Add your own features and pages
- Set up production database (Supabase Cloud or your own PostgreSQL)
- Configure production environment variables

## 🔐 Environment Variables Reference

All environment variables should be set in your `.env` file. Here's a complete reference:

### Required Variables

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54325/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54325/postgres"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Resend (for email sending)
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="onboarding@resend.dev"  # Optional: defaults to config.contact.email
```

### Optional Variables

```env
# PostHog Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Lemon Squeezy Webhooks (optional - only if using webhooks)
LEMON_SQUEEZY_WEBHOOK_SECRET="your_webhook_secret_here"
```

### Production Variables

For production, update these:

```env
DATABASE_URL="your-production-database-url"
DIRECT_URL="your-production-direct-url"
BETTER_AUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_ENV="production"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
RESEND_FROM_EMAIL="noreply@yourdomain.com"  # Use your verified domain
```

**Security Note:** Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## ⚙️ Configuration

This template uses a centralized `config.json` file to manage project-specific settings like SEO, branding, contact info, and feature flags.

### Config Structure

The `config.json` file contains:

- **Project Info**: Name, description, tagline, URLs, logos
- **SEO**: Title, description, keywords, Open Graph settings
- **Contact**: Email addresses
- **Social**: Social media links
- **Pricing**: Pricing plans with checkout URLs (Lemon Squeezy)
- **Features**: Feature flags (pricing, blog, docs, etc.)

### Using the Config

Simply import the config object and use it directly:

```typescript
import config from "@/lib/config";

function MyComponent() {
  return (
    <div>
      <h1>{config.project.name}</h1>
      <p>{config.project.tagline}</p>
      <p>{config.seo.description}</p>
      <a href={config.social.twitter}>Twitter</a>
    </div>
  );
}
```

### Customizing Your Project

1. **Update `config.json`** with your project details:

```json
{
  "project": {
    "name": "My Awesome SaaS",
    "tagline": "The best tool for your needs",
    "url": "https://myawesomesaas.com"
  },
  "contact": {
    "email": "hello@myawesomesaas.com"
  },
  "pricing": {
    "plans": [
      {
        "id": "starter",
        "name": "Starter",
        "price": "$9",
        "period": "/month",
        "checkoutUrl": "https://yourstore.lemonsqueezy.com/buy/{variant-id}?redirect=https://myawesomesaas.com/checkout/success",
        "features": ["Feature 1", "Feature 2"]
      }
    ]
  }
}
```

2. **Use in components**:

```typescript
import config from "@/lib/config";

const { name, tagline } = config.project;
const plans = config.pricing.plans;
```

### Theme Colors

Theme colors are managed directly in `src/app/globals.css` using Tailwind v4's `@theme` directive. Edit the CSS file to customize colors.

### Complete Config Example

Here's a complete example of what your `config.json` should look like:

```json
{
  "project": {
    "name": "My Awesome SaaS",
    "shortName": "MySaaS",
    "description": "A modern SaaS application",
    "tagline": "Build amazing products faster",
    "url": "https://myawesomesaas.com",
    "logo": "/logo.svg",
    "favicon": "/favicon.ico"
  },
  "seo": {
    "title": "My Awesome SaaS - Build Amazing Products",
    "description": "A modern SaaS application for building amazing products",
    "keywords": ["saas", "productivity", "tools"],
    "author": "Your Name",
    "ogImage": "/og-image.png",
    "twitterHandle": "@yourhandle"
  },
  "contact": {
    "email": "hello@myawesomesaas.com",
    "supportEmail": "support@myawesomesaas.com"
  },
  "social": {
    "twitter": "https://twitter.com/yourhandle",
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/company/yourcompany",
    "instagram": "https://instagram.com/yourhandle",
    "tiktok": "https://tiktok.com/@yourhandle"
  },
  "pricing": {
    "plans": [
      {
        "id": "starter",
        "name": "Starter",
        "price": "$9",
        "period": "/month",
        "description": "Perfect for individuals",
        "checkoutUrl": "https://yourstore.lemonsqueezy.com/buy/{variant-id}?redirect=https://myawesomesaas.com/checkout/success",
        "features": ["Feature 1", "Feature 2", "Feature 3"]
      }
    ]
  },
  "features": {
    "auth": true,
    "waitlist": {
      "enabled": true,
      "showPosition": true,
      "confirmationEmail": true
    }
  }
}
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # Better-auth endpoints
│   ├── globals.css        # Global styles + Tailwind
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── providers/        # Context providers
│   └── tracking/         # Analytics components
├── lib/                  # Library code
│   ├── api/             # API client (Axios)
│   ├── better-auth/     # Auth configuration
│   ├── db/              # Prisma client & schema
│   ├── emails/          # Email templates
│   ├── hooks/           # Custom React hooks
│   ├── resend/          # Email client
│   ├── stores/          # Zustand stores
│   ├── tracking/        # PostHog client
│   └── utils.ts         # Utility functions
└── utils/               # Utility functions
    └── environments.ts  # Environment helpers
```

## 🎯 Usage Examples

### Authentication

```typescript
import { signIn, signOut, useSession } from "@/lib/better-auth/auth-client";

// Sign in with magic link
await signIn.magicLink({
  email: "user@example.com",
  callbackURL: "/",
});

// Get session
const { data: session } = useSession();

// Sign out
await signOut();
```

### API Requests with React Query

```typescript
import useApi from "@/lib/hooks/useApi";

function MyComponent() {
  const { useGet, usePost, usePut } = useApi();

  // GET request
  const { data, isLoading, error } = useGet("/users", { page: 1 });

  // POST request
  const createUser = usePost("/users", {
    onSuccess: () => {
      console.log("User created!");
    },
  });

  // PUT request
  const updateUser = usePut("/users");

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={() => createUser.mutate({ name: "John" })}>
        Create User
      </button>
    </div>
  );
}
```

### State Management with Zustand

```typescript
import { useErrorStore } from "@/lib/stores/errorStore";

function MyComponent() {
  const { isError, statusCode, errorMessage, setError, clearError } =
    useErrorStore();

  // Use error state
  if (isError) {
    console.log(`Error ${statusCode}: ${errorMessage}`);
  }
}
```

### Sending Emails

```typescript
import { resendClient } from "@/lib/resend/resendClient";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/lib/emails/WelcomeEmail";

const emailHtml = await render(WelcomeEmail({ name: "John" }));

await resendClient.emails.send({
  from: "onboarding@resend.dev",
  to: "user@example.com",
  subject: "Welcome!",
  html: emailHtml,
});
```

### Using shadcn/ui Components

```typescript
import { Button } from "@/components/ui/button";

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
```

### PostHog Analytics

**Client-side:**

```typescript
import { usePostHog } from "posthog-js/react";

const posthog = usePostHog();
posthog.capture("event_name", { property: "value" });
```

**Server-side:**

```typescript
import { postHogClient } from "@/lib/tracking/postHogClient";

postHogClient.capture({
  distinctId: "user-id",
  event: "server_event",
  properties: { key: "value" },
});
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run email:dev` - Start React Email dev server

## 🗄️ Database

### Prisma Schema

- **Schema Location:** `src/lib/db/schema.prisma`
- **Migrations Folder:** `src/lib/db/migrations/` (empty by default - you'll create your own)

The schema includes:

- User authentication models (User, Session, Account, Verification)
- Waitlist model for collecting early signups

### Database Migrations

**First Time Setup:**

When you first clone this template, the migrations folder is empty. You need to apply the database schema. You have two options:

**1. Create Initial Migration (Recommended)**

```bash
npm run db:migrate
```

Enter a name like `initial_setup` when prompted. This will:

- Create a migration file in `src/lib/db/migrations/`
- Apply all tables from `schema.prisma` to your database
- Generate Prisma Client

**2. Push Schema Directly (Quick Alternative)**

```bash
npm run db:push
```

This applies the schema without creating migration files. Useful for quick setup, but migration files won't be tracked in git.

**After Initial Setup:**

For all future schema changes, use migrations:

```bash
# 1. Modify src/lib/db/schema.prisma
# 2. Create and apply migration
npm run db:migrate
```

This ensures your database changes are version-controlled and can be applied consistently across environments.

### Supabase Local Development

**Start Supabase:**

```bash
supabase start
```

This starts:

- PostgreSQL database (port 54325)
- Supabase Studio (port 54328)
- API server (port 54333)
- Email testing (Inbucket on port 54331)

**Check Status:**

```bash
supabase status
```

**Stop Supabase:**

```bash
supabase stop
```

**Reset Database (⚠️ Deletes all data):**

```bash
supabase db reset
```

**Access Supabase Studio:**

Open http://127.0.0.1:54328 in your browser to:

- View database tables
- Run SQL queries
- Manage data
- View API documentation

**View Test Emails:**

Open http://127.0.0.1:54331 to see emails sent during development (magic links, waitlist confirmations, etc.)

### Production Database

For production, you can use:

- **Supabase Cloud** - Managed PostgreSQL with Supabase features
- **Your own PostgreSQL** - Self-hosted or managed (AWS RDS, Railway, etc.)

Update `DATABASE_URL` and `DIRECT_URL` in your production environment variables.

## 🎨 Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Examples:

- `npx shadcn@latest add card`
- `npx shadcn@latest add input`
- `npx shadcn@latest add dialog`
- `npx shadcn@latest add form`

## 🔧 Configuration Files

- `config.json` - Project configuration (SEO, branding, contact, features)
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration (optional in v4)
- `postcss.config.mjs` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `supabase/config.toml` - Supabase local configuration

## 📚 Key Libraries Documentation

- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Better-auth](https://www.better-auth.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React Email](https://react.email)
- [PostHog](https://posthog.com/docs)

## 🚀 Deployment

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:

- Vercel: Project Settings → Environment Variables
- Railway: Variables tab
- Other platforms: Check their documentation

### Database

For production, use Supabase Cloud or your own PostgreSQL instance. Update `DATABASE_URL` and `DIRECT_URL` in your production environment.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
