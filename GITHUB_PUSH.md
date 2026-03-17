# Push this project to your personal GitHub

Your repo is already initialized with an initial commit. Follow these steps to put it on GitHub.

## 1. Create a new repository on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** e.g. `family-expense-logger` (or any name you like)
3. **Description:** optional, e.g. "Family expense tracking app"
4. Choose **Private** or **Public**
5. **Do not** check "Add a README", "Add .gitignore", or "Choose a license" (you already have these)
6. Click **Create repository**

## 2. Add the remote and push

GitHub will show you commands. Use these (replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and the repo name you chose):

```bash
cd c:\Users\aharshad\Perforce\Expense

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

**Example:** If your username is `johndoe` and repo name is `family-expense-logger`:

```bash
git remote add origin https://github.com/johndoe/family-expense-logger.git
git push -u origin main
```

## 3. If GitHub asks for authentication

- **HTTPS:** You may be prompted for username and password. Use your GitHub username and a **Personal Access Token** (not your GitHub password). Create one at: GitHub → Settings → Developer settings → Personal access tokens.
- **SSH:** If you use SSH keys, use the SSH URL instead: `git@github.com:YOUR_USERNAME/REPO_NAME.git`

---

Your `.env` file is in `.gitignore`, so it will **not** be pushed. Add your env vars in Vercel (or any host) when you deploy.
