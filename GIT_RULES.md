# 📋 Git Rules & Workflow

This document outlines the Git workflow and best practices for contributing to CodeScope.

## 🌿 Branch Naming Convention

All branches should follow this naming structure:

### Branch Prefixes

- **`feature/`** - New features or enhancements
  - Example: `feature/ai-chat-interface`
  - Example: `feature/contributor-analytics`

- **`bugfix/`** - Bug fixes for non-production issues
  - Example: `bugfix/dashboard-loading-spinner`
  - Example: `bugfix/oauth-redirect-error`

- **`hotfix/`** - Urgent fixes for production issues
  - Example: `hotfix/security-patch`
  - Example: `hotfix/api-crash`

- **`refactor/`** - Code refactoring without changing functionality
  - Example: `refactor/database-queries`
  - Example: `refactor/components-structure`

- **`docs/`** - Documentation updates
  - Example: `docs/api-endpoints`
  - Example: `docs/setup-guide`

- **`chore/`** - Maintenance tasks, dependencies, config updates
  - Example: `chore/update-dependencies`
  - Example: `chore/ci-pipeline`

### Branch Naming Rules
- Use lowercase letters
- Separate words with hyphens (`-`)
- Keep names short but descriptive
- Include issue number if applicable: `feature/123-ai-summaries`

---

## 🚫 Never Code Directly on Main

**IMPORTANT:** The `main` branch is protected and should only contain stable, production-ready code.

### ❌ Don't Do This:
```bash
# BAD - Don't work directly on main
git checkout main
# ... make changes ...
git commit -m "added feature"
git push
```

### ✅ Do This Instead:
```bash
# GOOD - Create a feature branch
git checkout main
git fetch origin
git pull origin main
git checkout -b feature/your-feature-name
# ... make changes ...
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name
# ... then create a Pull Request
```

---

## 🔄 Standard Workflow

### 1. Start with Updated Main
Always start from the latest `main` branch:

```bash
git checkout main
git fetch origin
git pull origin main
```

### 2. Create Your Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
Work on your feature, making commits as you go:

```bash
git add .
git commit -m "Descriptive commit message"
```

### 4. Keep Your Branch Updated
Regularly sync with `main` to avoid conflicts:

```bash
git fetch origin
git merge origin/main
# or use rebase for cleaner history:
# git rebase origin/main
```

### 5. Push Your Branch
```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
- Go to GitHub and create a Pull Request from your branch to `main`
- Add a clear description of what your PR does
- Link any related issues
- Request reviews from team members
- Address any feedback

### 7. After PR is Merged
Clean up your local branches:

```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

---

## ✍️ Commit Message Guidelines

Write clear, descriptive commit messages:

### Format
```
<type>: <short summary>

<optional detailed description>
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting (no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Examples
```bash
feat: add AI chat interface with GPT-4 integration

fix: resolve OAuth redirect loop on login

docs: update setup instructions in README

refactor: optimize database queries for contributor stats
```

---

## 🔀 Pull Request Best Practices

### Before Creating a PR
- ✅ Ensure your code builds without errors
- ✅ Test your changes locally
- ✅ Update relevant documentation
- ✅ Keep PRs focused (one feature/fix per PR)
- ✅ Sync with latest `main` branch

### PR Description Should Include
- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How to test the changes
- **Screenshots**: If UI changes are involved

### Example PR Template
```markdown
## Description
Brief description of what this PR accomplishes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring

## Testing
Steps to test the changes

## Screenshots (if applicable)
Add screenshots for UI changes
```

---

## 🚨 Common Mistakes to Avoid

1. **❌ Working directly on `main`**
   - Always create a feature branch

2. **❌ Not pulling latest changes before starting**
   - Always `git pull origin main` first

3. **❌ Committing unrelated changes together**
   - Keep commits focused and atomic

4. **❌ Force pushing to shared branches**
   - Avoid `git push --force` unless absolutely necessary

5. **❌ Large, monolithic commits**
   - Break work into smaller, logical commits

6. **❌ Vague commit messages**
   - Write clear, descriptive messages

---

## 🆘 Common Git Commands

### Check current branch and status
```bash
git status
git branch
```

### Switch branches
```bash
git checkout branch-name
```

### Update your branch with latest main
```bash
git fetch origin
git merge origin/main
```

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Discard local changes
```bash
git checkout -- filename
# or discard all changes:
git reset --hard
```

### View commit history
```bash
git log --oneline
```

---

## ❓ Questions?

If you're unsure about any Git workflow or run into issues:
1. Check this document first
2. Ask in the team chat
3. Create an issue if you think the workflow needs clarification

**Remember:** When in doubt, create a branch! 🌿

