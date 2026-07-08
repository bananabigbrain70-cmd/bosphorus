export function formatBookingText(booking) {
  return [
    `Name: ${booking.name}`,
    `Contact: ${booking.contact}`,
    `Guests: ${booking.guests}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    `Notes: ${booking.notes || "No special requests"}`
  ].join("\n");
}

export function buildReservationEmailHtml(booking, restaurantName = "Bosphorus Lounge") {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
      <h2 style="color:#3b2415">New Reservation Request</h2>
      <p>A new booking request was submitted through the ${restaurantName} AI receptionist.</p>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Name</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(booking.name)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Contact</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(booking.contact)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Guests</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(booking.guests)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Date</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(booking.date)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Time</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(booking.time)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd"><strong>Notes</strong></td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(booking.notes || "No special requests")}</td></tr>
      </table>
      <p style="margin-top:18px">Please contact the customer to confirm availability.</p>
    </div>
  `;
}

export function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (match) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[match];
  });
}

export function createId(prefix = "msg") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
