# OACSAS WFP Budget & Supplies Management System
## Complete Step-by-Step Setup Guide for Supabase, GitHub, and Netlify

This guide walks you through connecting your **Supabase** cloud database, pushing this codebase to **GitHub**, and deploying it live on **Netlify** so your entire team can access the system securely.

---

### PART 1: SUPABASE SETUP (Cloud PostgreSQL Database)

#### Step 1.1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"** (sign in with GitHub or your email).
2. Click **"New Project"**.
3. Fill in the project details:
   - **Name**: `oacsas-budget-supplies` (or your preferred name)
   - **Database Password**: Create a strong password (save this in a secure place).
   - **Region**: Select a region close to your office (e.g., `Southeast Asia (Singapore)`).
   - **Pricing Plan**: Free tier (sufficient for office records).
4. Click **"Create new project"** and wait about 1-2 minutes for the database to provision.

#### Step 1.2: Run the SQL Schema Migration
1. In your Supabase Project Dashboard, look at the left sidebar and click on **SQL Editor** (icon with `>_`).
2. Click **"New Query"** (or use an empty query tab).
3. Open the file `supabase_schema.sql` (or copy it from the **"Supabase & Deploy"** tab inside the app).
4. Paste the entire SQL script into the query editor.
5. Click **"Run"** (green button at the bottom right).
6. You should see `Success. No rows returned`. All 9 tables, indexes, and Row-Level Security policies are now created:
   - `wfp_budget_items`
   - `wfp_sub_categories`
   - `wfp_expenses`
   - `price_list`
   - `inventory_items`
   - `restock_records`
   - `issuance_records`
   - `procurement_requests`
   - `audit_logs`

#### Step 1.3: Retrieve your API Keys
1. In your Supabase left sidebar, click the **Project Settings** (gear icon) at the bottom left.
2. Under "Configuration", click **API**.
3. Under **Project URL**, copy the URL (e.g., `https://abcdefghijklm.supabase.co`).
4. Under **Project API keys**, copy the `anon` / `public` key.
   > **Note:** Keep these two values handy for Part 3 (Netlify Environment Variables).

---

### PART 2: GITHUB SETUP (Code Repository)

#### Step 2.1: Create a New Repository on GitHub
1. Log in to your GitHub account at [https://github.com](https://github.com).
2. In the top right corner, click the **"+"** button and select **"New repository"**.
3. Fill in the repository settings:
   - **Repository name**: `oacsas-budget-supplies-system`
   - **Visibility**: Choose **Private** (recommended for official office records) or **Public**.
   - Do **NOT** check "Initialize this repository with a README" (since this project already has files).
4. Click **"Create repository"**.
5. Copy the repository URL (e.g., `https://github.com/your-username/oacsas-budget-supplies-system.git`).

#### Step 2.2: Push the Project from Your Computer to GitHub
Open your terminal (Command Prompt, PowerShell, or Git Bash) in this project folder and run:

```bash
# 1. Initialize git if not already initialized
git init

# 2. Add all files to staging
git add .

# 3. Commit your changes
git commit -m "Initial commit of OACSAS WFP Budget & Supplies System"

# 4. Rename main branch
git branch -M main

# 5. Link to your GitHub remote repository (replace with your copied URL)
git remote add origin https://github.com/your-username/oacsas-budget-supplies-system.git

# 6. Push code to GitHub
git push -u origin main
```

Your code is now stored on GitHub!

---

### PART 3: NETLIFY SETUP (Free Continuous Cloud Hosting)

Netlify provides free global hosting with automatic SSL (HTTPS) and continuous deployment: whenever you push updates to GitHub, Netlify automatically builds and updates the live site.

#### Step 3.1: Connect Netlify to GitHub
1. Go to [https://netlify.com](https://netlify.com) and click **"Log in"** (sign in using your **GitHub** account).
2. In your Netlify team dashboard, click **"Add new site"** $\rightarrow$ **"Import an existing project"**.
3. Choose **GitHub** as your Git provider and authorize Netlify.
4. Search for and select your repository: `oacsas-budget-supplies-system`.

#### Step 3.2: Configure Build Settings
Netlify will automatically detect the Vite React configuration:
- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
*(These are already pre-configured in `netlify.toml` in the repository)*

#### Step 3.3: Set Environment Variables (Supabase Connection)
Before clicking deploy, expand the **"Environment variables"** section:
1. Click **"Add a variable"**:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL (e.g., `https://your-project.supabase.co`)
2. Click **"Add another variable"**:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase `anon` / `public` API key
3. Click **"Deploy site"**!

#### Step 3.4: SPA Routing Fallback Verification
The repository already includes `netlify.toml` and `public/_redirects`:
```
/*    /index.html   200
```
This ensures that when team members reload any tab or bookmark direct URLs, Netlify correctly serves the React Single Page Application without any 404 errors.

#### Step 3.5: Custom Domain / Site Name (Optional)
1. In Netlify under **Site overview**, click **"Site configuration"** $\rightarrow$ **"Change site name"**.
2. Rename it to a clean team-friendly URL (e.g. `oacsas-wfp-system.netlify.app`).
3. Share this secure HTTPS link with your team!

---

### PART 4: TEAM ACCESS & ROLE-BASED LOGIN

Once live on Netlify, your team members can open the URL and use the system immediately:

| Role | Pre-configured Email | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Assistant Commissioner / Admin** | `admin@oacsas.gov.ph` | `Admin@2026!` | Full administrative authority, approve procurement requests, delete records, manage WFP budget, system audit trail |
| **Budget Officer** | `budget@oacsas.gov.ph` | `Budget@2026!` | WFP allocations, expense ledger entries, budget utilization analytics, financial audit reports |
| **Supply Custodian** | `supply@oacsas.gov.ph` | `Supply@2026!` | Physical inventory count, master price list, restocking receiving, supply issuances, auto-PR generation |
| **Administrative Staff** | `staff@oacsas.gov.ph` | `Staff@2026!` | View supply availability, submit requisitions, generate official Appendix 63 RIS slips |

*(Users can also switch roles with 1-click in the top right user menu for demonstration and testing purposes).*
