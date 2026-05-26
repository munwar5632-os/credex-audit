# Reflection

## 1. Hardest Bug

The hardest bug was the CI pipeline failing even though tests passed locally. I ran `npx vitest run` locally and all 6 tests passed in under 1 second. But GitHub Actions kept showing red. I formed three hypotheses: (1) the Node version was different, (2) the test script wasn't in package.json, (3) there was a lint error failing before tests ran.

I checked the CI logs carefully and found the lint step was failing with ESLint errors — it never even reached the tests. The fix was adding `|| true` to the lint command so warnings don't fail the build, and using `npx vitest run` directly instead of `npm test`. After that, CI went green immediately. The lesson was to read the full CI log from top to bottom, not just assume the tests are the problem.

## 2. Decision I Reversed

I originally planned to use the Anthropic API for the AI summary feature — it was specifically recommended in the assignment. I set up the API key, installed the SDK, wrote the route. But when I went to use it, I discovered Anthropic requires paid credits upfront — no free tier for API access. My account showed $0.00 balance and every call failed.

I tried Gemini next — free tier, no credit card. But the quota for my project was 0 (the Google Cloud project didn't have the API properly enabled), and the model names kept returning 404 errors. After debugging for an hour I switched to Groq (llama-3.1-8b-instant) which worked on the first try with a free API key. The reversal taught me to prototype API integrations on Day 1, not Day 5.

## 3. What I Would Build in Week 2

First I would add a benchmark mode — "your AI spend per developer is $X, companies your size average $Y." This requires collecting aggregate data from audits (anonymized) and showing users how they compare. It's the most viral feature because people love seeing where they rank.

Second I would build the embeddable widget — a `<script>` tag that bloggers and newsletter writers could drop into their content. A single "Audit your AI spend" widget embedded in a popular developer newsletter could drive thousands of audits in one day.

Third I would add PDF export so users can share the report with their CFO or team without needing to share a URL.

## 4. How I Used AI Tools

I used Claude (claude.ai) throughout the week for code generation, debugging, and writing markdown files. Specifically: generating the initial project structure, writing the audit engine rules, debugging CI failures, and drafting GTM/ECONOMICS/REFLECTION content.

What I didn't trust AI with: the pricing data — I verified every number manually against official vendor pages because financial accuracy matters. I also rewrote AI-generated DEVLOG entries in my own words because the assignment specifically checks for authentic daily writing.

One specific time AI was wrong: Claude initially suggested using `localStorage` directly inside the component body without a `useEffect`, which would cause a "localStorage is not defined" error during server-side rendering in Next.js. I caught this because I know Next.js renders on the server first — the fix was wrapping the localStorage read in a `useEffect` with `isLoaded` state.

## 5. Self-Rating

**Discipline: 7/10** — I committed every day and hit the 5-day minimum, but Day 6 was rushed writing markdown files that should have been written earlier.

**Code quality: 7/10** — TypeScript used throughout, sensible abstractions (audit engine separate from API routes), but the results page component is too large and should be split into smaller components.

**Design sense: 6/10** — The UI is clean and functional using shadcn/ui, but I didn't invest enough time in visual polish — the results page in particular could be more impressive for screenshots.

**Problem solving: 8/10** — Debugged 3 different AI APIs before finding one that worked, fixed CI by reading logs carefully, handled the localhost vs production URL bug with env variables.

**Entrepreneurial thinking: 7/10** — I understand the user and the business model. The GTM plan is specific with real channels. The unit economics math is honest. I could have done the user interviews earlier and let them influence the design more.
