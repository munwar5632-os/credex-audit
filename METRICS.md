# Metrics

## North Star Metric

**Consultation requests booked per week.**

Not "audits completed" (vanity) and not "DAU" (people use this once a quarter). Consultation requests measure direct business value to Credex and only fire when the audit found real savings (>$500/month threshold).

## 3 Input Metrics

**1. Audit completion rate** (target: >25%)
Visitors who start and submit the form. Low completion = form too long or confusing.

**2. Email capture rate** (target: >20% of completions)
Users who enter email after seeing results. Low capture = results page not showing enough value.

**3. High-savings audit rate** (target: >30% of completions)
Audits finding >$500/month savings. Low rate = pricing data wrong or audit rules too conservative.

## What to Instrument First

1. Form submission event — tools selected, team size, use case (no PII)
2. Results page load — total savings shown, high/low savings flag
3. Email capture event — fired on email submit
4. Share URL click — how many share links are actually opened
5. Consultation CTA click — for >$500 savings cases

Use Vercel Analytics (free, already integrated) for page views. Add simple fetch to /api/track for custom events.

## Pivot Trigger

After 500 audit completions:

- Email capture rate < 10% → results page redesign needed
- Consultation requests = 0 → CTA copy needs rework or savings threshold is wrong
- Average savings shown < $50 → audit engine rules too conservative, pricing data needs update

Tool pivots from lead-gen to pure awareness if consultation conversion stays below 5% after 1,000 captures.
