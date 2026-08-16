import { site } from "@/config/site";

function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * A FLOATING iCalendar timestamp — no trailing Z, no TZID.
 *
 * The visit is agreed as "9am" or "1pm", meaning wall-clock time in the UK.
 * Stamping that as UTC is wrong for the seven months the country spends in
 * British Summer Time: a 9am visit written as 0900Z opens in the decorator's
 * diary at 10am, and he turns up an hour after the customer expected him.
 *
 * RFC 5545 §3.3.5 form 1: a date-time with no suffix is interpreted in the
 * local timezone of whoever opens it. For an appointment where both parties are
 * in the same country, that is exactly the intended meaning — and it needs no
 * VTIMEZONE block, which is the other, far heavier, correct answer.
 */
function floatingStamp(isoDate: string, hour: number, minute: number): string {
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${isoDate.replace(/-/g, "")}T${hh}${mm}00`;
}

/**
 * Folds long lines at 75 OCTETS, as RFC 5545 §3.1 requires.
 *
 * OCTETS, NOT CHARACTERS, and the difference is not academic here. This used to
 * measure and slice with String.length, which counts UTF-16 code units: the em
 * dash in "SUMMARY:Site visit — …" is one code unit and three UTF-8 bytes, so
 * an ordinary booking — a full name and a street address — emitted a 77-octet
 * line while the code believed it had cut at 75. The file is serialised as
 * UTF-8 before it is base64'd onto the email, so octets are what a calendar
 * client actually counts.
 *
 * Cutting on a code POINT boundary matters for the same reason in the other
 * direction: slicing by code unit can split a surrogate pair down the middle
 * and put half an emoji at the end of one line and half at the start of the
 * next, which is no longer valid UTF-8 in either. Iterating the string with
 * for..of walks code points, so a character is either wholly in this chunk or
 * wholly in the next.
 */
function fold(line: string): string {
  const size = (text: string) => new TextEncoder().encode(text).length;
  if (size(line) <= 75) return line;

  const parts: string[] = [];
  let chunk = "";
  // The first line may use 75 octets; every continuation spends one on its
  // leading space.
  let budget = 75;

  for (const char of line) {
    if (size(chunk) + size(char) > budget) {
      parts.push(parts.length === 0 ? chunk : ` ${chunk}`);
      chunk = "";
      budget = 74;
    }
    chunk += char;
  }
  if (chunk) parts.push(parts.length === 0 ? chunk : ` ${chunk}`);

  return parts.join("\r\n");
}

function escape(value: string): string {
  /* CRLF first, then a bare CR, then LF — in that order, so a Windows newline
     becomes one \n rather than two. A raw CR was previously emitted into the
     file untouched, and CR is a line terminator in iCalendar: an address
     containing one could open a property, or a whole VALARM block, inside the
     .ics the customer is asked to open in their calendar. The trailing sweep
     removes anything else in the control range. */
  return value
    .replace(/[\\;,]/g, (match) => `\\${match}`)
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/[\p{Cc}]/gu, "");
}

/**
 * Calendar invitation for a requested site visit, attached to the decorator's
 * notification email so the job goes straight into their diary.
 *
 * Morning visits are pencilled in at 9am, afternoons at 1pm, and "either" at
 * 9am — the decorator confirms the real time when they ring, which is what the
 * booking copy promises.
 */
export function buildVisitIcs({
  date,
  preference,
  name,
  address,
  phone,
  email,
  notes,
}: {
  date: string;
  preference: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  notes?: string;
}): string {
  const startHour = preference === "Afternoon" ? 13 : 9;
  const dtStart = floatingStamp(date, startHour, 0);
  const dtEnd = floatingStamp(date, startHour, 45);
  const now = new Date();
  const uid = `visit-${date}-${startHour}-${phone.replace(/\D/g, "").slice(-6)}@thepaintmen`;

  const description = [
    `Site visit request via the website.`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Preference: ${preference}`,
    notes ? `Notes: ${notes}` : null,
    ``,
    `Ring to confirm the time before the visit.`,
  ]
    .filter(Boolean)
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//Site visit//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    fold(`SUMMARY:${escape(`Site visit — ${name}, ${address}`)}`),
    fold(`LOCATION:${escape(address)}`),
    fold(`DESCRIPTION:${escape(description)}`),
    "STATUS:TENTATIVE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}
