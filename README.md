# SportsBuddy – Find Local Sports Events & Teammates

SportsBuddy is a web application that helps users discover local sports events, find teammates with similar interests, and manage sports activities within their city. It includes both User and Admin functionalities with event management, attendee matching, and system-wide notifications.

---
## Live Demo
Live on: https://find-sport-buddy.netlify.app/ 
Repository: https://github.com/Krishnakhokhariya/sports-buddy.git

---
## Features

## User Features

- Register, Login & Reset Password (email link)
- Manage Profile (name, city, area, sports interests, skill level)
- View all events created by all users
- Dashboard Tabs:
  - Created – events created by the user  
  - Pending – join requests sent by the user  
  - Joined – events where the user is accepted
- View event details
- Send join request / leave event
- Notifications:
  - New events  
  - Request acceptance/rejection  
  - Event updates
- Edit or delete own events

## Event Features

- Create / Edit / Delete events  
- Detailed event info (sport, date/time, city, area, skill, description)
- Attendee request categories:
  - Star Match – same sport + same city
  - Sports Match – same sport
  - City Match – same city
  - Not Matched
- Event creators can Accept / Reject / Remove attendees


## Admin Features

- Admin dashboard:
  - Total users, sports, cities, areas  
  - Recent 5 events  
  - Event date graph  
  - Logs
- Full CRUD:
  - Sports  
  - Cities  
  - Areas  
  - Events
- Manage all event requests and logs
- Admin is manually added 
(email: sportbuddy_admin@gmil.com,
password: SportBuddyAdmin@123)

---
## Tech Stack

### Frontend
- **React + Vite** — Fast development environment & component-based UI  
- **Tailwind CSS** — Utility-first styling for responsive design  

### Authentication
- **Firebase Authentication** — Email login & password reset  

### Database
- **Firestore** — Stores Events, Users, Join Requests  

### Notifications
- **Firebase Cloud Messaging (FCM)** — Sends local event notifications  

### State Management
- **React Context API** — Global state across components  
- **Custom Hooks** — Popup handling, confirmation dialogs, reusable logic  

> **Note:** Firebase Storage is *not* used in this project.


---
## App Flow

### User Flow

1. Register → login → dashboard  
2. Dashboard includes:
   - Created Events  
   - Pending Requests  
   - Joined Events  
3. Header options:
   - Notifications  
   - Add Event  
   - Events List
   - profile  
4. Event Detail Page:
   - If not creator → Join Request  
   - If joined → Leave Event  
   - If creator → Edit/Delete/View Attendees  
5. Attendee Requests Page → 4 categorized tabs  
6. User can update profile & logout


### Admin Flow

1. Admin added manually through script  
2. Login → Admin Dashboard  
3. Dashboard:
   - System stats  
   - Logs  
   - Recent events  
   - Event graph  
4. Admin can manage:
   - Cities  
   - Areas  
   - Sports  
   - All events  
   - Logs  

---
## Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/sports-buddy.git
cd sports-buddy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env` File

VITE_FIREBASE_API_KEY=AIzaSyCvQ4E-U_6AMAME0-vyO0i1UXZR7R2rYuc
VITE_FIREBASE_AUTH_DOMAIN=sport-buddy-1c0b0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sport-buddy-1c0b0
VITE_FIREBASE_STORAGE_BUCKET=sport-buddy-1c0b0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=996123761993
VITE_FIREBASE_APP_ID=1:996123761993:web:44247f36182e790381ce98


### 4. Run Dev Server

npm run dev

### 5. Build for Production

npm run build

## Folder Structure
```text
src/
 ┣ assets/
 ┣ components/
 ┃ ┣ admin/
 ┃ ┣ forms/
 ┃ ┗ Popup.jsx
 ┣ contexts/
 ┣ hooks/
 ┣ pages/
 ┣ utils/
 ┣ firebase.js
 ┗ App.jsx
```
---

## Future Improvements

- Chat between creator and accepted attendees  
- Email integration for event confirmations  
- Event reminders  
- Profile picture support  
- Better attendee recommendation system  

----
## Contact
Krishna Khokhariya  
Email: krishnakhokhariya26@gmail.com  
