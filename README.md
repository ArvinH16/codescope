<div align="center">

# 🚀 CodeScope

### AI-Powered GitHub Insights, Contributor Profiles & Codebase Q&A

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai)](https://openai.com/)

<p align="center">
  <strong>Make repositories self-explanatory with AI-powered insights and analytics</strong>
</p>

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Roadmap](#-roadmap) • [Vision](#-vision)

</div>

---

## 📖 About

**CodeScope** is a full-stack Next.js application that connects to GitHub, analyzes repositories, tracks contributor activity, and uses AI to answer questions about your codebase.

It gives teams a **live dashboard** of commits, ownership, analytics, and an **AI chat system** to ask things like:

> 💬 *"What changed in the API folder yesterday?"*  
> 💬 *"Who worked on the Stripe integration the most?"*  
> 💬 *"Explain this commit in plain English."*  
> 💬 *"Who should I talk to about authentication bugs?"*

No more digging through Git logs or guessing who owns what file — AI, analytics, and collaboration all in one dashboard.

---

## ✨ Features

### 🔗 **GitHub Integration**
- Login via GitHub OAuth
- Connect a GitHub repo or entire organization
- Automatically sync commits, contributors, and file changes
- Webhook support — updates in real-time when collaborators push code

### 👤 **Contributor Profiles**

Each developer gets their own profile with:
- Total commits, additions/deletions
- Most-touched files / modules
- Ownership heatmap of the repo
- Recent commits and activity timeline

### 📊 **Repo Analytics Dashboard**
- Commits per day/week/month
- Top contributors by code volume
- Most changed directories & files
- High-risk files (high churn + low ownership)

### 💬 **AI Chat for Your Codebase**

Ask questions like:
- *"What changed in /routes/api last week?"*
- *"Who primarily contributed to the payments service?"*
- *"Show me the summary of PR #52"*
- *"Explain this commit like I'm 5."*

**The chatbot uses:**
- ✅ GPT-4o / GPT-5
- ✅ Commit history + metadata
- ✅ File ownership data
- ✅ Contributor context

---

## 🛠 Tech Stack

<table>
  <tr>
    <td><strong>Layer</strong></td>
    <td><strong>Technology</strong></td>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui</td>
  </tr>
  <tr>
    <td>Backend</td>
    <td>Node.js via Next.js API Routes</td>
  </tr>
  <tr>
    <td>Database</td>
    <td>Supabase (PostgreSQL + Auth + Realtime)</td>
  </tr>
  <tr>
    <td>Auth</td>
    <td>GitHub OAuth with NextAuth.js or Supabase Auth</td>
  </tr>
  <tr>
    <td>AI</td>
    <td>OpenAI GPT-4o / GPT-5</td>
  </tr>
  <tr>
    <td>Hosting</td>
    <td>Vercel (frontend + API), Supabase (database)</td>
  </tr>
</table>

---

## 🧩 Project Structure

```
/app
  /dashboard        → main analytics UI
  /chat             → AI assistant interface
  /api
    /auth           → GitHub OAuth
    /github         → repo sync, webhooks
    /commits        → fetch commit summaries
    /chat           → AI Q&A endpoint

/lib
  supabase.ts       → Supabase client
  github.ts         → GitHub REST + GraphQL helpers
  ai.ts             → GPT summarization + chat logic
  db.ts             → Supabase query functions

/supabase
  schema.sql        → database tables & relations
```

---

## 🗄 Database Schema

```sql
users(id, github_id, name, avatar_url)

repos(id, owner, name, default_branch)

contributors(id, github_username, name, avatar_url, email)

commits(sha, repo_id, contributor_id, message, timestamp, additions, deletions)

files(id, repo_id, path, latest_sha)

commit_files(id, commit_sha, file_id, additions, deletions, status)

ai_summaries(commit_sha, summary, tags[], model)

ownership(file_id, contributor_id, ownership_score)
```

---

## 🚀 Getting Started

> **Note:** Setup instructions coming soon as the project develops!

```bash
# Clone repository
git clone https://github.com/your-username/codescope.git
cd codescope

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

---

## 🗺 Roadmap

### Phase 1 – Setup ✅
- Initialize Next.js project & Supabase
- Configure GitHub OAuth login
- Basic dashboard layout

### Phase 2 – Repo Sync 🚧
- Connect GitHub repo/org
- Store commits, files, contributors in Supabase
- Display activity graph + list of commits

### Phase 3 – Contributor Profiles 📋
- Build dynamic developer pages
- Ownership & contributions analytics

### Phase 4 – AI Commit Summaries 🤖
- On new commit → send diff to GPT
- Save `{summary, files, tags}` in DB
- Show on commit page

### Phase 5 – AI Chat Interface 💬
- Build `/chat` page with repo-aware AI assistant
- Query GitHub + Supabase + GPT
- Answer questions about codebase & contributors

---

## 🧠 How AI Works

### Example: Commit Summary Prompt

```
You are analyzing a GitHub commit.
Commit message: "{commit_message}"
Diff:
{diff_content}

Summarize:
1. What changed
2. Why it changed
3. Key files involved

Output JSON under 120 words:
{
  "summary": "...",
  "files": [...],
  "owners": [...],
  "tags": ["api", "auth", ...]
}
```

The AI analyzes commit diffs, file changes, and contributor patterns to provide intelligent insights about your codebase.

---

## 💡 Vision

**CodeScope makes repositories self-explanatory.**

No more digging through Git logs or guessing who owns what file — AI, analytics, and collaboration all in one dashboard.

### Why CodeScope?

- 🔍 **Instant Insights**: Understand what happened in your repo without manual investigation
- 🤝 **Better Collaboration**: Know who to ask about specific parts of the codebase
- 📈 **Data-Driven Decisions**: Track contribution patterns and code ownership
- 🤖 **AI-Powered**: Let GPT explain complex changes in simple language
- ⚡ **Real-Time Updates**: Stay synced with GitHub via webhooks

---

## 📋 Contributing

We welcome contributions! Please check out our [Git Rules](./GIT_RULES.md) for workflow and branch naming conventions.

### Quick Guide:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for developers who want to understand their code better**

[⬆ Back to Top](#-codescope)

</div>
