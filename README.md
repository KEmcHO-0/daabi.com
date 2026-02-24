# দাবি.com - SUST Student Demand/Complaint Submission System

<div align="center">

![দাবি.com Logo](https://img.shields.io/badge/দাবি.com-SUST%20Student%20Platform-667eea?style=for-the-badge)

**শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের ছাত্রদের দাবি ও অভিযোগ জমা দেওয়ার প্ল্যাটফর্ম**

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square)](https://mongodb.com)
[![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=flat-square)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black&style=flat-square)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org)

</div>

---

## ✨ Features

### 🔐 Authentication System
- ছাত্র ও কমিটি সদস্য লগইন
- ইমেইল ভেরিফিকেশন
- পাসওয়ার্ড রিসেট
- Role-based Access Control

### 📝 দাবি সাবমিশন
- বিভিন্ন ক্যাটাগরি (Academic, Accommodation, Transport, etc.)
- প্রায়োরিটি সেট করা (Low, Medium, High, Urgent)
- ফাইল/ছবি আপলোড (Max 10MB, 5 files)
- বেনামী সাবমিশন অপশন
- ড্রাফট সংরক্ষণ

### 📊 ড্যাশবোর্ড
**ছাত্র ড্যাশবোর্ড:**
- নিজের দাবিগুলো দেখা
- স্ট্যাটাস ট্র্যাকিং
- নোটিফিকেশন

**কমিটি ড্যাশবোর্ড:**
- সকল দাবির তালিকা
- ফিল্টার ও সার্চ
- স্ট্যাটাস আপডেট
- Analytics ও চার্ট

### 🔍 অতিরিক্ত Features
- সার্চ ও ফিল্টার
- কমেন্ট সিস্টেম
- সমর্থন/ভোটিং সিস্টেম
- ইমেইল নোটিফিকেশন
- সমাধান হওয়া দাবি পাবলিক ভিউ

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your values
# Then start the server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/daabi_com
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@daabi.com
FROM_NAME=দাবি.com
```

---

## 📁 Project Structure

```
daabi.com/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── demandController.js
│   │   ├── commentController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Demand.js
│   │   ├── Comment.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── demands.js
│   │   ├── comments.js
│   │   └── notifications.js
│   ├── utils/
│   │   └── sendEmail.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Navbar.js
│   │   │       └── Footer.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── DemandList.js
│   │   │   ├── DemandDetail.js
│   │   │   ├── CreateDemand.js
│   │   │   ├── CommitteeDashboard.js
│   │   │   └── Profile.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── constants.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| PUT | `/api/auth/reset-password/:token` | Reset password |
| PUT | `/api/auth/update-password` | Update password |
| PUT | `/api/auth/update-profile` | Update profile |

### Demands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demands` | Get all demands |
| GET | `/api/demands/:id` | Get single demand |
| POST | `/api/demands` | Create demand |
| PUT | `/api/demands/:id` | Update demand |
| DELETE | `/api/demands/:id` | Delete demand |
| PUT | `/api/demands/:id/status` | Update demand status |
| POST | `/api/demands/:id/support` | Support/unsupport demand |
| GET | `/api/demands/stats` | Get statistics |
| GET | `/api/demands/my-demands` | Get user's demands |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/demand/:demandId` | Get demand comments |
| POST | `/api/comments/demand/:demandId` | Add comment |
| PUT | `/api/comments/:id` | Update comment |
| DELETE | `/api/comments/:id` | Delete comment |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

---

## 🎨 Screenshots

### হোম পেজ
![Home Page](https://via.placeholder.com/800x400?text=Home+Page)

### দাবি সাবমিশন
![Create Demand](https://via.placeholder.com/800x400?text=Create+Demand)

### ড্যাশবোর্ড
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard)

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Student** | Create, view, edit own demands; Support others' demands; Comment |
| **Committee** | View all demands; Update status; Respond to demands; View analytics |
| **Admin** | All permissions; Manage users; Delete any demand |

---

## 🛡️ Security Features

- JWT based authentication
- Password hashing with bcrypt
- Email verification
- Role-based access control
- File upload validation
- XSS protection
- CORS enabled

---

## 📧 Email Notifications

Users receive email notifications for:
- ✅ Email verification
- 🔑 Password reset
- 📢 Demand status updates
- 💬 New comments on their demands
- 👍 Support received

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়
- SUST Student Community

---

<div align="center">

**Made with ❤️ for SUST Students**

</div>
