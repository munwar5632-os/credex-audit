# Architecture

## System Diagram

```mermaid
graph TD
    A[User visits /] --> B[SpendForm - Client Component]
    B --> C[localStorage - persist form state]
    B --> D[sessionStorage - pass data to results]
    D --> E[/results - Client Component]
    E --> F[POST /api/audit]
    F --> G[audit-engine.ts - hardcoded rules]
    G --> F
    F --> E
    E --> H[POST /api/summary]
    H --> I[Groq API - llama-3.1-8b-instant]
    I --> H
    H --> E
    E --> J[POST /api/capture]
    J --> K[Supabase - leads table]
    K --> J
    J --> E
    E --> L[POST /api/send-email]
    L --> M[Resend - transactional email]
    E --> N[/share/id - Server Component]
    N --> K
```

## Data Flow

1. User fills SpendForm → saved to localStorage on every change
2. On submit → copied to sessionStorage → navigate to /results
3. Results page reads sessionStorage → POST to /api/audit
4. /api/audit runs audit-engine.ts → returns AuditSummary JSON
5. Results page simultaneously fetches /api/summary → Groq generates 100-word paragraph
6. User enters email → POST /api/capture → Supabase saves lead → returns share_id UUID
7. POST /api/send-email → Resend sends email with /share/{share_id} URL
8. Share page is Server Component → fetches Supabase directly → strips email/company from public view

## Stack Choices

**Next.js 16 + TypeScript** — API routes eliminate need for a separate Express backend. Server Components make the share page faster and better for SEO. TypeScript catches bugs at compile time — critical for financial math.

**Supabase** — free tier, instant setup, auto-generated UUIDs for share_id, simple JS SDK. PostgreSQL underneath so it scales. Alternative was Firebase but Supabase has better TypeScript support.

**Resend** — 3,000 free emails/month, works immediately without DNS verification on free tier.

**Groq API (llama-3.1-8b-instant)** — free tier, fast, reliable. Used only for the personalized summary paragraph. The audit math uses hardcoded rules — knowing when not to use AI is important for financial accuracy.

**Tailwind v4 + shadcn/ui** — fastest way to build a professional accessible UI. shadcn components are accessible by default which helps Lighthouse scores.

**Vitest** — faster than Jest for TypeScript projects, zero config with Next.js.

## Scaling to 10k Audits/Day

- **Supabase** → upgrade to Pro ($25/month), add indexes on share_id and created_at
- **API routes** → add Redis rate limiting (Upstash free tier) to prevent abuse
- **Groq API** → add request queuing to handle burst traffic, or upgrade to paid tier
- **Edge functions** → move /api/audit to Vercel Edge for lower latency globally
- **Share pages** → add ISR (Incremental Static Regeneration) with 60s revalidation to cache popular share pages
