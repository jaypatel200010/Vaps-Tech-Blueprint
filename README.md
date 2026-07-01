# Vaps Tech Integration Blueprint by nexaflowtech

This repository holds a high-fidelity, interactive presentation and technical blueprint showing how **Vaps Tech**'s platforms (Multi-Channel E-Commerce, Recruitment Job Board, Social Media DM Chat, and Video Streaming Subscriptions) will migrate and integrate into **Frappe ERPNext** by **nexaflowtech**, leaving their primary Educational ERP running separately in parallel.

---

## 🌟 Integration Pillars & Architectural Designs

### 1. Multi-Channel E-Commerce
Consolidates sales orders, inventory changes, and invoices across **Shopify**, **Flipkart**, and **Amazon**.
- **Source of Truth:** ERPNext acts as the single stock database.
- **Auto-Sync:** Shopify/Amazon webhook payloads write to ERPNext `Sales Order`, which triggers inventory reservation and schedules automatic `Sales Invoice` creation.
- **Stock Guard:** Real-time stock deductions trigger immediate balance updates back to the e-commerce APIs, avoiding overselling.

### 2. Built-In ERPNext Job Portal
Leverages ERPNext's native recruitment and job board modules.
- **Publishing:** HR posts a `Job Opening` inside ERPNext. Toggling `Publish on Website` displays the listing directly on the native web portal (`/jobs`).
- **Application Flow:** Candidates submit forms and upload resumes directly. The system registers the candidate under the core `Job Applicant` Doctype, automatically triggering evaluation workflow rules.

### 3. Social Media Direct Messaging (DM) & Chat
Enables direct user-to-user social network chats inside the application.
- **Handshake Protocol:** Pushes real-time messages between active user profiles over WebSockets (using Frappe's built-in **Socket.io** library on port 9000).
- **Data Schema:** Registers communications under a custom `Direct Message` database table. These relate to a `DM Room` that connects two `Social Profile` documents, enforcing safe, private, 1-to-1 message pathways.

### 4. Streaming Subscriptions Auth Flow
Validates streaming authorization credentials against ERPNext subscription billing modules.
- **Authorization Hook:** Media streaming servers (like Cloudflare Stream or Vimeo OTT) query ERPNext's validation API (`/api/method/streaming.validate_subscription`) upon player load.
- **Plan Enforcement:** If user subscription status maps to `Active` and has no unpaid invoices, ERPNext returns an approval payload. Expired/Past-Due states trigger a billing payment prompt.

---

## 🚀 How to Preview and Use This Blueprint

### Method A: Preview Locally
Simply double-click the `index.html` file or launch a simple local development server in this directory:
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Method B: Deploy to GitHub Pages (Recommended)
You can deploy this as a static website to share the interactive diagrams and schema models directly with Vaps Tech:
1. Create a new public repository on GitHub.
2. Initialize and push this codebase to the repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial ERPNext integration blueprint"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub, go to your repository **Settings** -> **Pages**.
4. Under **Build and deployment**, set the Source to **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then click **Save**.
6. GitHub will generate a public URL (e.g., `https://your_username.github.io/your_repo_name/`) which you can share directly with Vaps Tech.
