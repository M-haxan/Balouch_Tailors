# Authentication System - Quick Start Guide

## 🎉 What's New

Your Balouch Tailors website now has a complete JWT-based authentication system with:
- ✅ Admin login & registration
- ✅ Protected admin dashboard
- ✅ Secure token management
- ✅ Session persistence
- ✅ Full responsive design

---

## 📖 Getting Started

### Step 1: Start Your Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 2: Access the Authentication Pages

#### First Time Setup (Initial Admin Registration)
```
URL: http://localhost:5173/register
```
- Create your first admin account
- Use any name, email, and strong password (minimum 8 characters)
- After registration, you'll be redirected to the dashboard
- ⚠️ Note: Only one admin account can be created. Second registration attempts will be blocked by the backend.

#### Subsequent Logins (Admin Login)
```
URL: http://localhost:5173/login
```
- Use your registered email and password
- Access the admin dashboard

### Step 3: Admin Dashboard
```
URL: http://localhost:5173/admin/dashboard (Protected Route)
```
- View your admin profile
- See quick action tiles for future features
- Click "Dashboard" in the header dropdown or "Visit Us" button

---

## 🔐 Authentication Flow

### From the Header
1. **Not Logged In**: Click "Admin Login" button in header
2. **Logged In**: Click the dropdown with your name to see:
   - Dashboard link
   - Logout button

### URLs at a Glance
| Page | URL | Status |
|------|-----|--------|
| Homepage | `/` | Public |
| Services | `/services` | Public |
| Catalogue | `/catalogue` | Public |
| Pricing | `/pricing` | Public |
| Contact | `/contact` | Public |
| Admin Register | `/register` | Public (one-time) |
| Admin Login | `/login` | Public |
| Dashboard | `/admin/dashboard` | Protected ✅ |

---

## 💾 Token Management

### How Tokens Work
- JWT tokens are automatically **stored in localStorage** when you log in
- Tokens are **automatically attached** to all API requests with `Authorization: Bearer <token>` header
- Tokens **persist across browser reloads** - you stay logged in
- Tokens are **cleared on logout** for security

### Manual Token Inspection (Developer Console)
```javascript
// View stored token
const token = localStorage.getItem('token');
console.log(token);

// View stored user info
const user = JSON.parse(localStorage.getItem('user'));
console.log(user);

// Clear manually (for testing)
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

## 🎨 Design Notes

All authentication pages maintain the existing design:
- ✅ White background with black text
- ✅ Tailwind CSS consistent with site
- ✅ Fully responsive on mobile & desktop
- ✅ Smooth transitions and hover states
- ✅ Clear error messaging

---

## 🧪 Testing the System

### Test 1: Basic Login Flow
1. Go to `/login`
2. Enter your credentials
3. Click "Sign In"
4. You should be redirected to `/admin/dashboard`
5. Header should show your name in dropdown

### Test 2: Protected Route
1. Log out (click Logout in header)
2. Try to visit `/admin/dashboard`
3. You should be redirected to `/login`

### Test 3: Session Persistence
1. Log in to `/login`
2. Refresh the page
3. You should still be logged in
4. Dashboard should load without re-authentication

### Test 4: Logout
1. Click the dropdown with your name
2. Click "Logout"
3. You should be redirected to home page
4. Header should show "Admin Login" button again

---

## 🛠️ Making API Calls from Admin Dashboard

To extend the dashboard with real admin features, use this pattern:

```javascript
import authService from '../services/authService';

async function fetchAdminData() {
  try {
    const headers = authService.getAuthHeaders();
    const response = await fetch(
      'https://bt-backend-dimd.onrender.com/api/admin/some-endpoint',
      { headers }
    );
    
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 📝 Environment Variables (Optional)

If you want to use different backend URLs in development/production, you can:

1. Create a `.env.local` file in the root:
```
VITE_API_BASE_URL=https://your-backend-url/api
```

2. Update `src/services/authService.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     "https://bt-backend-dimd.onrender.com/api";
```

3. Update Vite config to expose the variable

---

## ⚠️ Important Notes

### Security
- 🔒 Tokens are stored in localStorage (accessible to JS)
- 🔒 For production, consider using HttpOnly cookies instead
- 🔒 Always use HTTPS in production
- 🔒 Never commit `.env` files with real credentials

### Backend Compatibility
- The authentication assumes your backend is running at `https://bt-backend-dimd.onrender.com`
- Backend must have CORS enabled for `http://localhost:5173` (dev) and your production domain
- Backend must implement the `/api/auth/login` and `/api/auth/register` endpoints

### One-Time Registration
- ⚠️ Initial admin registration only works ONCE
- If you need to reset, ask backend to delete the admin user
- Subsequent registration attempts will return 403 Forbidden

---

## 🐛 Troubleshooting

### Issue: Login page shows error "Registration failed"
**Solution**: 
- Check backend URL is correct in `authService.js`
- Ensure backend server is running
- Check browser console for detailed error

### Issue: Can't see my name in header after login
**Solution**:
- Check localStorage in DevTools
- Refresh the page
- Clear localStorage and log in again

### Issue: Already registered but can't log back in
**Solution**:
- Use the same email and password you registered with
- Go to `/login` page, not `/register`
- Check credentials are correct

### Issue: Getting redirected to login from protected route
**Solution**:
- Log out and log back in
- Clear localStorage: `localStorage.clear()`
- Check token hasn't expired on backend

---

## 📚 File Reference

### Core Authentication Files
- `src/context/AuthContext.jsx` - State management
- `src/services/authService.js` - API calls
- `src/components/Login.jsx` - Login page
- `src/components/Register.jsx` - Registration page
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/components/AdminDashboard.jsx` - Admin panel
- `src/components/Header.jsx` - Updated header with auth

### Documentation
- `AUTHENTICATION.md` - Full technical documentation
- `QUICK_START.md` - This file

---

## 🚀 Next Steps

1. **Test the authentication system** thoroughly
2. **Add more admin features** to the dashboard
3. **Create admin API endpoints** on backend for managing:
   - Services/products
   - Customer orders
   - Analytics/reports
   - Settings
4. **Implement token refresh** for long sessions
5. **Add password reset** functionality
6. **Move to production** when ready

---

## 💬 Questions?

Check `AUTHENTICATION.md` for detailed API documentation and architecture overview.

For backend-related issues, ensure your server is running at:
```
https://bt-backend-dimd.onrender.com
```

---

**Happy coding! 🎉**
