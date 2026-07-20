# 🧠 INFINITY MINDS Therapy Center – Management System

A full-stack management dashboard for **INFINITY MINDS Therapy Center**, built with:
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL via XAMPP

---

## 📂 Project Structure

```
IMA Therapy_Senter/
├── backend/           # Node.js Express API server
│   ├── server.js      # Main server with all API endpoints
│   └── ima_therapy_center.sql  # MySQL database schema & seed data
├── dashboard/         # React + TypeScript frontend
│   └── src/
│       ├── pages/     # All page components
│       ├── context/   # SimulatorContext (state management)
│       └── components/
└── mobile/            # React Native mobile app (Expo)
```

---

## 🗄️ Database Setup (XAMPP MySQL)

### Step 1 – Start XAMPP
1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL**

### Step 2 – Import the Database
1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **"New"** on the left sidebar
3. Create a new database named: `ima_therapy_center`
4. Click the database name → go to the **"Import"** tab
5. Click **"Choose File"** and select:
   ```
   backend/ima_therapy_center.sql
   ```
6. Click **"Go"** to import

### Step 3 – Configure Database Credentials
Open `backend/server.js` and verify the MySQL connection settings match your XAMPP setup:

```js
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Default XAMPP MySQL user
  password: '',        // Default XAMPP MySQL password (empty)
  database: 'ima_therapy_center'
});
```

> If you have set a custom MySQL password in XAMPP, update the `password` field accordingly.

---

## 🚀 Running the Application

### Backend API Server
```bash
cd backend
npm install
node server.js
```
The API will run at: **http://localhost:3001**

### Frontend Dashboard
```bash
cd dashboard
npm install
npm run dev
```
The dashboard will run at: **http://localhost:5173**

---

## 🔐 Default Login Credentials

| Role        | Username       | Password        |
|-------------|----------------|-----------------|
| Super Admin | `superadmin`   | `superpassword` |
| Admin       | `admin`        | `adminpassword` |
| Principal   | `principal`    | `principalpassword` |
| Trainer     | `trainer`      | `trainerpassword` |
| Parent      | `parent`       | `parentpassword` |

---

## 📱 Mobile App (React Native / Expo)

```bash
cd mobile
npm install
npx expo start
```

---

## ✨ Features

- **Role-based Access Control** – Super Admin, Admin, Principal, Trainer, Parent
- **Student Management** – Register, view, edit, activate/deactivate students
- **Document Upload & View** – Upload and open student documents (PDF, images)
- **Attendance Tracking** – Mark and view student attendance
- **Behavior Reviews** – Log and review student behavior reports
- **Scheduler** – Manage therapy session schedules
- **User Management** – Manage system users with status control
- **Reports** – Generate and view therapy reports

---

## 🛠️ Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React 19, TypeScript, Vite |
| Styling   | Vanilla CSS              |
| Backend   | Node.js, Express.js      |
| Database  | MySQL (XAMPP)            |
| Mobile    | React Native (Expo)      |
