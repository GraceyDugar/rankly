# Rankly — AI visibility tracker

Rankly checks whether AI search recommends your business when customers ask questions like *"best CRM for freelancers"*, which competitors it names instead, and what to fix. It's built for AEO / GEO (AI SEO).

## Features

- **Free AI visibility check:** ask Google Gemini a customer question and see whether your brand is recommended, at what position, and which competitors appear
- **Resilient AI calls:** automatic fallback across Gemini models when one is overloaded or out of quota, with request timeouts
- **Abuse protection:** per-IP rate limiting on the free check
- **SEO-ready landing page:** metadata, Open Graph tags, and JSON-LD structured data (SoftwareApplication + FAQPage)

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Gemini API

## Run locally

```bash
npm install
cp .env.example .env.local   # then add your GEMINI_API_KEY
npm run dev
```

## Roadmap

- Weekly automated reports by email
- Payments and subscriptions
- ChatGPT and Perplexity tracking
