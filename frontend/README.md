# 🚀 QuantNest - AI-Powered Financial Portfolio

**QuantNest** ek advanced MERN stack application hai jo users ko unke stocks aur expenses track karne mein madad karta hai. Isme **Llama 3 (via Groq API)** ka use kiya gaya hai jo aapke portfolio ko analyze karke personalized financial insights deta hai.

## ✨ Key Features

* **Secure Authentication**: JWT-based login, password hashing, aur Nodemailer ke saath email verification aur password reset functionality.
* **AI Insights**: Groq API (Llama 3.3 model) ka use karke real-time portfolio analysis aur financial advice.
* **Interactive Dashboard**: Recharts ka use karke visual data representation (Line, Donut, aur Bar charts).
* **Expense Tracker**: Category-wise expense management.
* **Risk Analysis**: Portfolio concentration ke basis par risk level calculation.
* **Export Data**: Pure portfolio aur expenses ko CSV format mein download karne ki suvidha.

## 🛠️ Tech Stack

* **Frontend**: React.js, Vite, Recharts, CSS Modules.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB Atlas.
* **AI Model**: Llama 3.3 (Groq SDK).

## 🚀 Installation & Setup

1.  **Repo Clone Karein:**
    ```bash
    git clone [https://github.com/Anand-Kumar-Yadav/quantnest-app.git](https://github.com/Anand-Kumar-Yadav/quantnest-app.git)
    ```

2.  **Dependencies Install Karein:**
    ```bash
    # Backend ke liye
    cd backend && npm install
    # Frontend ke liye
    cd frontend && npm install
    ```

3.  **Environment Variables (.env):**
    Backend folder mein `.env` file banayein aur ye keys add karein:
    * `MONGO_URI`
    * `JWT_SECRET`
    * `GROQ_API_KEY`
    * `EMAIL_USER` / `EMAIL_PASS`

4.  **Run Application:**
    ```bash
    # Backend terminal
    npm run dev (ya node server.js)
    # Frontend terminal
    npm run dev
    ```

## 🌐 Deployment Links
* **Frontend**: (Vercel Link Coming Soon)
* **Backend**: (Render Link Coming Soon)