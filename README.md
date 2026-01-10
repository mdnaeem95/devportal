# DevPortal

The professional backend for freelance developers who work with direct clients.

## Tech Stack

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **API:** tRPC
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Auth:** Clerk
- **Payments:** Stripe Connect
- **Email:** Resend
- **File Storage:** Cloudflare R2
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL database (recommend [Neon](https://neon.tech))
- Clerk account
- Stripe account (optional for dev)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devportal.git
   cd devportal
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`

5. Push database schema:
   ```bash
   pnpm db:push
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
devportal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── (public)/          # Public pages (client portal)
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   └── shared/           # Shared components
├── server/               # Server-side code
│   ├── db/              # Database schema and connection
│   └── routers/         # tRPC routers
├── lib/                  # Utilities and providers
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code
- `pnpm db:generate` - Generate database migrations
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Drizzle Studio

## License

MIT
