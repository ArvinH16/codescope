🚀 CodeScope

AI-Powered GitHub Insights, Contributor Profiles & Codebase Q&A

CodeScope is a full-stack Next.js application that connects to GitHub, analyzes repositories, tracks contributor activity, and uses AI to answer questions about the codebase.

It gives teams a live dashboard of commits, ownership, analytics, and an AI chat system to ask things like:
	•	“What changed in the API folder yesterday?”
	•	“Who worked on the Stripe integration the most?”
	•	“Explain this commit in plain English.”
	•	“Who should I talk to about authentication bugs?”

⸻

✅ Core Features

🔗 GitHub Integration
	•	Login via GitHub OAuth
	•	Connect a GitHub repo or entire organization
	•	Automatically sync commits, contributors, and file changes
	•	Webhook support — updates in real-time when collaborators push code

👤 Contributor Profiles

Each developer gets their own profile with:
	•	Total commits, additions/deletions
	•	Most-touched files / modules
	•	Ownership heatmap of the repo
	•	Recent commits and activity timeline

📊 Repo Analytics Dashboard
	•	Commits per day/week/month
	•	Top contributors by code volume
	•	Most changed directories & files
	•	High-risk files (high churn + low ownership)

💬 AI Chat for Your Codebase

Ask questions like:

"What changed in /routes/api last week?"
"Who primarily contributed to the payments service?"
"Show me the summary of PR #52"
"Explain this commit like I'm 5."

The chatbot uses:
✔ GPT-4o / GPT-5
✔ Commit history + metadata
✔ File ownership data
✔ Contributor context

⸻

🛠 Tech Stack

Layer	Technology
Frontend	Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui
Backend	Node.js via Next.js API Routes
Database	Supabase (PostgreSQL + Auth + Realtime)
Auth	GitHub OAuth with NextAuth.js or Supabase Auth
AI	OpenAI GPT-4o / GPT-5
Hosting	Vercel (frontend + API), Supabase (database)


⸻

🧩 Project Structure

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


⸻

🗄 Supabase Database Schema (Simplified)

users(id, github_id, name, avatar_url)

repos(id, owner, name, default_branch)

contributors(id, github_username, name, avatar_url, email)

commits(sha, repo_id, contributor_id, message, timestamp, additions, deletions)

files(id, repo_id, path, latest_sha)

commit_files(id, commit_sha, file_id, additions, deletions, status)

ai_summaries(commit_sha, summary, tags[], model)

ownership(file_id, contributor_id, ownership_score)


⸻

✅ Development Roadmap

Phase 1 – Setup
	•	Initialize Next.js project & Supabase
	•	Configure GitHub OAuth login
	•	Basic dashboard layout

Phase 2 – Repo Sync
	•	Connect GitHub repo/org
	•	Store commits, files, contributors in Supabase
	•	Display activity graph + list of commits

Phase 3 – Contributor Profiles
	•	Build dynamic developer pages
	•	Ownership & contributions analytics

Phase 4 – AI Commit Summaries
	•	On new commit → send diff to GPT
	•	Save {summary, files, tags} in DB
	•	Show on commit page

Phase 5 – AI Chat Interface
	•	Build /chat page with repo-aware AI assistant
	•	Query GitHub + Supabase + GPT
	•	Answer questions about codebase & contributors

⸻

🧠 Example AI Prompt (Commit Summary)

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


⸻

🚀 Getting Started (Soon)

# Clone repository
git clone https://github.com/your-username/codescope.git
cd codescope

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run dev
npm run dev


⸻

💡 Vision

CodeScope makes repositories self-explanatory. No more digging through Git logs or guessing who owns what file — AI, analytics, and collaboration all in one dashboard.