# Prompts

## AI Audit Summary

**Used in:** `app/api/summary/route.ts`
**Model:** Groq — llama-3.1-8b-instant (free tier)

**Full prompt:**
**Why written this way:**

- "financial advisor" framing keeps tone professional, not salesy
- Explicit 80-100 word count prevents rambling
- "Be specific about tools" forces personalization — without this the model gives generic advice
- "second person" makes it feel personal to the user
- "No bullet points" ensures prose format that reads naturally in the UI

**What I tried that didn't work:**

- Anthropic API — requires paid credits, no free tier
- Gemini 2.0 Flash — quota was 0 for my project
- Gemini 1.5 Flash — model not found error on v1beta endpoint
- No word limit — returned 300+ word essays, too long for the UI
- Passing only totalMonthlySavings instead of full audit JSON — gave generic responses

**Fallback behaviour:**
If Groq API fails for any reason, the route catches the error and returns a generic message. The results page always shows something — it never breaks due to AI failure.

**Why AI for summary but not audit math:**
The audit engine uses hardcoded rules deliberately. Financial recommendations need to be deterministic — $20/seat × 5 seats = $100 must be exact. AI is appropriate only for the summary paragraph where natural language variation is acceptable.
