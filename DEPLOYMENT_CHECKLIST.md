# Deployment checklist

Use this checklist before showing the chatbot to a real restaurant.

## Restaurant details

- [ ] Replace placeholder address in `src/data/restaurant.js`
- [ ] Replace placeholder phone number
- [ ] Add real menu items
- [ ] Add real opening hours
- [ ] Add real allergy disclaimer
- [ ] Add real privacy policy if storing customer information

## Email

- [ ] Create a Resend account
- [ ] Add `RESEND_API_KEY` to Vercel
- [ ] Add `OWNER_EMAIL`
- [ ] Add `FROM_EMAIL`
- [ ] Send a test reservation
- [ ] Check spam folder
- [ ] Confirm reply-to works for customer email contacts

## Vercel

- [ ] Push project to GitHub
- [ ] Import project into Vercel
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test on mobile
- [ ] Test invalid date
- [ ] Test invalid time
- [ ] Test go back
- [ ] Test change date
- [ ] Test change time
- [ ] Test confirm booking

## Sales demo

- [ ] Record a short screen demo
- [ ] Prepare before/after explanation
- [ ] Show restaurant owner where emails arrive
- [ ] Explain monthly maintenance
- [ ] Offer WhatsApp or Google Sheets add-on
