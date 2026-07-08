export const restaurant = {
  name: "Bosphorus Lounge",
  tagline: "Turkish-inspired dining, lounge atmosphere, and warm hospitality.",
  ownerEmail: "bananabigbrain70@gmail.com",
  phone: "+389 70 000 000",
  address: "Add the real Bosphorus Lounge address here",
  city: "Ohrid",
  country: "North Macedonia",
  hours: [
    { day: "Monday", open: "12:00", close: "23:00" },
    { day: "Tuesday", open: "12:00", close: "23:00" },
    { day: "Wednesday", open: "12:00", close: "23:00" },
    { day: "Thursday", open: "12:00", close: "23:00" },
    { day: "Friday", open: "12:00", close: "00:00" },
    { day: "Saturday", open: "12:00", close: "00:00" },
    { day: "Sunday", open: "12:00", close: "23:00" }
  ],
  menuHighlights: [
    {
      category: "Starters",
      items: ["Meze platter", "Hummus", "Ezme salad", "Fresh bread"]
    },
    {
      category: "Grill",
      items: ["Chicken shish", "Adana kebab", "Mixed grill", "Lamb skewers"]
    },
    {
      category: "Seafood",
      items: ["Grilled fish", "Calamari", "Prawn plate"]
    },
    {
      category: "Drinks",
      items: ["Turkish tea", "Coffee", "Mocktails", "Fresh lemonade"]
    },
    {
      category: "Desserts",
      items: ["Baklava", "Kunefe", "Ice cream"]
    }
  ],
  faq: {
    reservations: "Yes, I can help you request a table. I will collect your details and send them to the restaurant.",
    hours: "Bosphorus Lounge is open daily. Demo hours are Monday to Thursday 12 PM to 11 PM, Friday and Saturday 12 PM to midnight, and Sunday 12 PM to 11 PM.",
    location: "The exact address can be added here. For now, this is a production template for Bosphorus Lounge.",
    halal: "The menu can include halal-friendly options. Please mention any dietary needs in your reservation notes.",
    birthday: "Yes, birthday requests can be added to the reservation notes.",
    allergies: "Please mention allergies before confirming your reservation. Staff should confirm allergy details directly."
  },
  maxGuests: 30,
  minGuests: 1
};
