import {
  cleanText,
  containsBackIntent,
  containsNo,
  containsRestartIntent,
  isValidContact,
  isValidDateInput,
  isValidGuestCount,
  isValidName,
  isValidTimeInput
} from "./validation";

export const STEPS = {
  START: "start",
  NAME: "name",
  CONTACT: "contact",
  GUESTS: "guests",
  DATE: "date",
  TIME: "time",
  NOTES: "notes",
  CONFIRM: "confirm",
  SENT: "sent"
};

export const quickReplies = {
  start: ["Reserve a table", "View menu", "Opening hours", "Location"],
  guests: ["2", "3", "4", "5", "Go back"],
  time: ["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "Go back"],
  notes: ["No", "Go back"],
  confirm: ["Confirm booking", "Change date", "Change time", "Change guests", "Change contact", "Restart"]
};

export function initialBooking() {
  return {
    name: "",
    contact: "",
    guests: "",
    date: "",
    time: "",
    notes: ""
  };
}

export function initialState() {
  return {
    step: STEPS.START,
    booking: initialBooking(),
    completed: false
  };
}

export function getPromptForStep(step, restaurant) {
  switch (step) {
    case STEPS.NAME:
      return {
        text: `Great — I can help request a table at ${restaurant.name}.\n\nWhat name should the reservation be under?`,
        replies: ["Go back"]
      };
    case STEPS.CONTACT:
      return {
        text: "What phone number or email should we use for confirmation?",
        replies: ["Go back"]
      };
    case STEPS.GUESTS:
      return {
        text: `How many guests will be dining? Please enter a number from ${restaurant.minGuests} to ${restaurant.maxGuests}.`,
        replies: quickReplies.guests
      };
    case STEPS.DATE:
      return {
        text: "What date would you like?\n\nUse a real date like 2026-07-12, 12 July, or Friday 12 July.",
        replies: ["Go back"]
      };
    case STEPS.TIME:
      return {
        text: "What time would you prefer? Use a time like 7:30 PM or 19:30.",
        replies: quickReplies.time
      };
    case STEPS.NOTES:
      return {
        text: "Any special requests? For example: birthday, window seat, allergies, or type 'no'.",
        replies: quickReplies.notes
      };
    default:
      return {
        text: `Welcome to ${restaurant.name}! I can help with reservations, menu questions, opening hours, and customer enquiries.\n\nWhat would you like to do?`,
        replies: quickReplies.start
      };
  }
}

export function getBackStep(step) {
  switch (step) {
    case STEPS.CONTACT:
      return STEPS.NAME;
    case STEPS.GUESTS:
      return STEPS.CONTACT;
    case STEPS.DATE:
      return STEPS.GUESTS;
    case STEPS.TIME:
      return STEPS.DATE;
    case STEPS.NOTES:
      return STEPS.TIME;
    case STEPS.CONFIRM:
      return STEPS.NOTES;
    default:
      return STEPS.START;
  }
}

export function getEditStep(text) {
  const value = cleanText(text);
  if (/name/i.test(value)) return STEPS.NAME;
  if (/contact|phone|email/i.test(value)) return STEPS.CONTACT;
  if (/guest|people|person/i.test(value)) return STEPS.GUESTS;
  if (/date|day/i.test(value)) return STEPS.DATE;
  if (/time|hour/i.test(value)) return STEPS.TIME;
  if (/note|request|allergy|seat|birthday/i.test(value)) return STEPS.NOTES;
  return null;
}

export function buildConfirmationText(booking) {
  return (
    "Please confirm the reservation:\n\n" +
    `Name: ${booking.name}\n` +
    `Contact: ${booking.contact}\n` +
    `Guests: ${booking.guests}\n` +
    `Date: ${booking.date}\n` +
    `Time: ${booking.time}\n` +
    `Notes: ${booking.notes || "No special requests"}\n\n` +
    "Should I send this to the restaurant?"
  );
}

export function handleBotTurn(state, rawText, restaurant) {
  const text = cleanText(rawText);
  let next = structuredClone(state);

  if (containsRestartIntent(text)) {
    return {
      state: initialState(),
      messages: [
        {
          role: "bot",
          text: `No problem — let's start over.\n\nWelcome to ${restaurant.name}! What would you like to do?`,
          replies: quickReplies.start
        }
      ],
      submit: false
    };
  }

  if (containsBackIntent(text)) {
    const editStep = getEditStep(text);
    const destination = editStep || getBackStep(state.step);
    next.step = destination;
    const prompt = getPromptForStep(destination, restaurant);
    return {
      state: next,
      messages: [{ role: "bot", text: `Sure — let's update that.\n\n${prompt.text}`, replies: prompt.replies }],
      submit: false
    };
  }

  if (state.step === STEPS.START) {
    if (/menu/i.test(text) || text === "View menu") {
      const menuText = restaurant.menuHighlights
        .map((section) => `${section.category}: ${section.items.join(", ")}`)
        .join("\n");
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: `Here are some menu highlights:\n\n${menuText}\n\nWould you like to reserve a table?`,
            replies: ["Reserve a table", "No thanks"]
          }
        ],
        submit: false
      };
    }

    if (/hour|open|closing/i.test(text) || text === "Opening hours") {
      const hours = restaurant.hours.map((h) => `${h.day}: ${h.open}–${h.close}`).join("\n");
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: `${restaurant.name} opening hours:\n\n${hours}\n\nWould you like to reserve a table?`,
            replies: ["Reserve a table", "No thanks"]
          }
        ],
        submit: false
      };
    }

    if (/location|address|where/i.test(text) || text === "Location") {
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: `${restaurant.address}\n\nWould you like to reserve a table?`,
            replies: ["Reserve a table", "No thanks"]
          }
        ],
        submit: false
      };
    }

    if (containsNo(text)) {
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: "No problem. You can ask about the menu, opening hours, location, or start a reservation anytime.",
            replies: quickReplies.start
          }
        ],
        submit: false
      };
    }

    next.step = STEPS.NAME;
    const prompt = getPromptForStep(STEPS.NAME, restaurant);
    return {
      state: next,
      messages: [{ role: "bot", text: prompt.text, replies: prompt.replies }],
      submit: false
    };
  }

  if (state.step === STEPS.NAME) {
    if (containsNo(text)) {
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: "I need a name to create the reservation. Type the reservation name when you're ready, or type restart.",
            replies: ["Restart"]
          }
        ],
        submit: false
      };
    }

    if (!isValidName(text)) {
      return {
        state: next,
        messages: [{ role: "bot", text: "Please enter a real name using letters, for example: Arben Aliu.", replies: ["Go back"] }],
        submit: false
      };
    }

    next.booking.name = text;
    next.step = STEPS.CONTACT;
    return {
      state: next,
      messages: [{ role: "bot", text: `Thanks, ${text}. What phone number or email should we use for confirmation?`, replies: ["Go back"] }],
      submit: false
    };
  }

  if (state.step === STEPS.CONTACT) {
    if (!isValidContact(text)) {
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: "Please enter a valid phone number or email address, or type go back to change the name.",
            replies: ["Go back"]
          }
        ],
        submit: false
      };
    }

    next.booking.contact = text;
    next.step = STEPS.GUESTS;
    return {
      state: next,
      messages: [{ role: "bot", text: "How many guests will be dining?", replies: quickReplies.guests }],
      submit: false
    };
  }

  if (state.step === STEPS.GUESTS) {
    if (!isValidGuestCount(text, restaurant.minGuests, restaurant.maxGuests)) {
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: `Please enter a valid guest number from ${restaurant.minGuests} to ${restaurant.maxGuests}, or type go back.`,
            replies: quickReplies.guests
          }
        ],
        submit: false
      };
    }

    next.booking.guests = text;
    next.step = STEPS.DATE;
    return {
      state: next,
      messages: [
        {
          role: "bot",
          text: "What date would you like?\n\nUse a real date like 2026-07-12, 12 July, or Friday 12 July.",
          replies: ["Go back"]
        }
      ],
      submit: false
    };
  }

  if (state.step === STEPS.DATE) {
    if (!isValidDateInput(text)) {
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: "That doesn't look like a real date. Try 2026-07-12, 12 July, or Friday 12 July. You can also type go back.",
            replies: ["Go back"]
          }
        ],
        submit: false
      };
    }

    next.booking.date = text;
    next.step = STEPS.TIME;
    return {
      state: next,
      messages: [
        {
          role: "bot",
          text: "What time would you prefer? Use a time like 7:30 PM or 19:30.",
          replies: quickReplies.time
        }
      ],
      submit: false
    };
  }

  if (state.step === STEPS.TIME) {
    if (!isValidTimeInput(text)) {
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: "Please enter a valid time, for example: 7:30 PM or 19:30. You can also type go back or different date.",
            replies: quickReplies.time
          }
        ],
        submit: false
      };
    }

    next.booking.time = text;
    next.step = STEPS.NOTES;
    return {
      state: next,
      messages: [
        {
          role: "bot",
          text: "Any special requests? For example: birthday, window seat, allergies, or type no.",
          replies: quickReplies.notes
        }
      ],
      submit: false
    };
  }

  if (state.step === STEPS.NOTES) {
    next.booking.notes = containsNo(text) ? "No special requests" : text;
    next.step = STEPS.CONFIRM;
    return {
      state: next,
      messages: [
        {
          role: "bot",
          text: buildConfirmationText(next.booking),
          replies: quickReplies.confirm
        }
      ],
      submit: false
    };
  }

  if (state.step === STEPS.CONFIRM) {
    if (/yes|confirm|send|looks good|book/i.test(text)) {
      next.step = STEPS.SENT;
      next.completed = true;
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: "Perfect. Your reservation request is complete. I’m sending it to the restaurant now.",
            replies: []
          }
        ],
        submit: true
      };
    }

    if (containsNo(text)) {
      return {
        state: next,
        messages: [
          {
            role: "bot",
            text: "No problem. What would you like to change?",
            replies: ["Change name", "Change contact", "Change guests", "Change date", "Change time", "Change notes"]
          }
        ],
        submit: false
      };
    }

    return {
      state: next,
      messages: [
        {
          role: "bot",
          text: "Please confirm the booking or choose what you want to change.",
          replies: quickReplies.confirm
        }
      ],
      submit: false
    };
  }

  return {
    state: next,
    messages: [{ role: "bot", text: "Thanks. The reservation request has already been handled.", replies: ["Restart"] }],
    submit: false
  };
}
