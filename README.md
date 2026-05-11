# Wax — Setup Guide

## What you need
- A free [Vercel](https://vercel.com) account
- A free [Notion](https://notion.so) account
- Your Anthropic API key (from console.anthropic.com)

---

## Step 1 — Set up Notion

1. Go to [notion.so](https://notion.so) and create a new **full-page database**
2. Name it `Wax Tasks`
3. Add these properties (delete any defaults Notion added):

| Property name | Type |
|---|---|
| Name | Title (default) |
| Class | Select |
| Status | Select |
| Priority | Select |
| Due Date | Date |
| Notes | Text |

4. For **Class**, add options: `Chem`, `Math`, `Marketing`, `English`, `APUSH`
5. For **Status**, add options: `Not Started`, `In Progress`, `Done`
6. For **Priority**, add options: `Low`, `Medium`, `High`

### Get your Database ID
- Open the database in Notion
- Look at the URL: `notion.so/YOUR-WORKSPACE/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=...`
- The long string of letters/numbers before the `?` is your **Database ID**

### Create a Notion Integration
1. Go to [notion.so/my-integrations](https://notion.so/my-integrations)
2. Click **New integration**, name it `Wax`
3. Copy the **Internal Integration Token** — this is your `NOTION_TOKEN`
4. Go back to your database in Notion → click `...` (top right) → **Add connections** → select `Wax`

---

## Step 2 — Deploy to Vercel

1. Put the `wax` folder on GitHub (create a new repo, push the code)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. During setup, add these **Environment Variables**:

```
NOTION_TOKEN         = your Notion integration token
NOTION_DATABASE_ID   = your database ID
ANTHROPIC_API_KEY    = your Claude API key
```

4. Click **Deploy** — Vercel gives you a free URL like `wax-yourname.vercel.app`

---

## Step 3 — Run locally (optional)

```bash
cd wax
npm install
cp .env.local.example .env.local
# Fill in your keys in .env.local
npm run dev
# Open http://localhost:3000
```

---

## iOS App
The native iOS app (SwiftUI) connects to the same Notion database using the same credentials. Setup instructions will be included with the Xcode project.
