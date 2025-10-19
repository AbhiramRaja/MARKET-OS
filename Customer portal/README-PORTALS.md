# 🚀 MarketOS - Dual Portal Setup

## Overview
MarketOS now has **TWO separate applications**:

1. **Customer Portal** - For shoppers (Main `src/` folder)
2. **Driver Portal** - For delivery drivers (`marketos-driver/` folder)

## 📂 Folder Structure

```
AWS-HACKATHON/
│
├── src/                          ← 🛍️ CUSTOMER PORTAL (Main App)
├── public/                       
├── package.json                  
├── .env                          ← PORT=3000
│
└── marketos-driver/              ← 🚚 DRIVER PORTAL (Separate App)
    ├── src/
    │   ├── pages/
    │   │   ├── DriversPage.jsx   ← Main driver dashboard
    │   │   └── Login.jsx
    │   ├── components/
    │   │   └── RouteMap.jsx      ← Route navigation with maps
    │   └── App.jsx
    ├── public/
    ├── package.json
    └── .env                      ← PORT=3001
```

**Key Points:**
- Main `src/` folder = Customer Portal (runs from root)
- `marketos-driver/` = Driver Portal (runs from subfolder)
- Both are completely independent
- No code duplication

## 🎯 Current Setup (What's Running)

**The customer portal is currently running on port 3000**
- URL: http://localhost:3000
- ✅ Driver Dashboard link removed from header
- ✅ Clean customer-only experience

## 🚚 How to Run Driver Portal

### Option 1: Run Driver Portal in a New Terminal (Both Running Simultaneously)

**Keep the current terminal running**, then open a **NEW terminal** and run:

```bash
cd /Users/abhi/Documents/AWS-HACKATHON/marketos-driver
npm start
```

The driver portal will automatically start on port **3001**.

**Access URLs:**
- Customer Portal: http://localhost:3000
- Driver Portal: http://localhost:3001

### Option 2: Stop Customer Portal and Run Driver Portal Only

1. **Stop the customer portal** (press Ctrl+C in the terminal where it's running)

2. **Start driver portal:**
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/marketos-driver
npm start
```

It will run on port 3001 (or automatically find an available port).

## ⚙️ Port Configuration

Both portals have `.env` files:

**Customer Portal** (`.env`):
```
PORT=3000
BROWSER=none
```

**Driver Portal** (`marketos-driver/.env`):
```
PORT=3001
BROWSER=none
```

## 🔧 Troubleshooting

### Problem: Port Already in Use
If you get "Something is already running on port 3001", you have two options:

1. **Stop the other process:**
```bash
lsof -ti:3001 | xargs kill -9
```

2. **Change the port** in `marketos-driver/.env`:
```
PORT=3002
```

### Problem: Both Portals on Same Port
Make sure you're running them from different folders:
- Customer: Run from `/Users/abhi/Documents/AWS-HACKATHON`
- Driver: Run from `/Users/abhi/Documents/AWS-HACKATHON/marketos-driver`

## ✨ Features by Portal

### Customer Portal (Port 3000)
- 🛍️ Product browsing and search
- 🛒 Shopping cart
- 💳 Checkout
- 📦 Order tracking
- 👤 User profile
- 📱 Visual search

### Driver Portal (Port 3001)
- 🚚 Delivery dashboard
- 📍 Available deliveries
- 🗺️ **Route maps with fastest route calculation**
- 📊 Earnings tracking
- ✅ Delivery status management
- 📞 Customer contact integration

## 🚀 Quick Commands

**Start Customer Portal (from root):**
```bash
cd /Users/abhi/Documents/AWS-HACKATHON
npm start
```

**Start Driver Portal (from subfolder):**
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/marketos-driver
npm start
```

**Or use the script:**
```bash
./start-driver-portal.sh
```

**Run Both Simultaneously:**
```bash
# Terminal 1 (Customer Portal - from root)
npm start

# Terminal 2 (Driver Portal - from subfolder)  
cd marketos-driver && npm start
```

## 📝 Notes

- Both portals share the same AWS Amplify backend
- Authentication is shared between both portals
- They are completely independent React applications
- No code dependencies between them
- Can be deployed separately

## 🎉 What's Been Fixed

✅ **Driver Dashboard link removed** from customer portal header
✅ **DriversPage.jsx deleted** from main src folder  
✅ **RouteMap.jsx deleted** from main src folder
✅ **Driver route removed** from customer App.jsx
✅ **Separate driver portal** created in `marketos-driver/`
✅ **Different ports configured** (3000 vs 3001)
✅ **Both portals fully independent**

Now refresh your browser and the Driver Dashboard button will be gone from the customer portal! 🎉
