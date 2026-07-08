# Bosphorus Lounge AI Receptionist

A production-ready restaurant chatbot web app for **Bosphorus Lounge**.

It handles:

- Reservation collection
- Smart “go back” and “change answer” flow
- Name, contact, guest count, date, and time validation
- Confirmation before sending
- Automatic email notification to the restaurant
- Mobile-first restaurant landing page
- Vercel-ready deployment
- Resend email API integration

---

## 1. What this project contains

```txt
bosphorus-lounge-production/
├── api/
│   └── reservation.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   ├── data/
│   │   └── restaurant.js
│   └── utils/
│       ├── chatbot.js
│       ├── format.js
│       └── validation.js
├── index.html
├── package.json
├── vercel.json
├── .env.example
└── README.md
```

---

## 2. Run locally

Install Node.js first.

```bash
npm install
npm run dev
```

Open the local URL that Vite shows.

---

## 3. Deploy to Vercel

1. Create a GitHub account.
2. Create a new GitHub repository.
3. Upload all files in this folder.
4. Go to Vercel.
5. Click **Add New Project**.
6. Import your GitHub repository.
7. Add environment variables in Vercel:

```txt
RESEND_API_KEY=your_key
OWNER_EMAIL=bananabigbrain70@gmail.com
FROM_EMAIL=Bosphorus Lounge <onboarding@resend.dev>
ALLOWED_ORIGIN=https://your-vercel-url.vercel.app
```

8. Click **Deploy**.

---

## 4. Email sending setup

This project uses **Resend** because it works well on Vercel serverless functions.

For testing, Resend supports `onboarding@resend.dev` as the sender.  
For production, verify your own domain inside Resend and use an address like:

```txt
Bosphorus Lounge <bookings@yourdomain.com>
```

---

## 5. Important production notes

This app validates customer inputs on the frontend and backend.

The API route also protects against:

- Wrong HTTP method
- Oversized fields
- Missing required fields
- Invalid email/phone
- Invalid guest count
- Invalid date
- Invalid time
- Basic CORS issues

For a real restaurant, add:

- Real menu
- Real opening hours
- Real address
- Privacy policy
- Consent text for storing customer data
- Optional Google Sheets logging
- Optional WhatsApp notifications
- Optional calendar/table availability integration

---

## 6. Selling this to restaurants

You can pitch this as:

> “A 24/7 AI receptionist that answers customer questions, captures reservations, validates booking details, and sends confirmed leads straight to the restaurant email.”

Suggested pricing:

- Setup: €500–€2,000
- Monthly support: €100–€300
- Add-ons: WhatsApp, Google Sheets, calendar sync, menu management

---

## 7. Customization

Restaurant details are in:

```txt
src/data/restaurant.js
```

Update:

- Name
- Phone
- Email
- Address
- Opening hours
- Menu categories
- FAQ answers
