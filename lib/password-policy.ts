// Shared by the browser (live checklist) and the server (enforcement), so the
// rules a visitor sees are exactly the rules the API applies.

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_BYTES = 72; // bcrypt ignores anything beyond 72 bytes.

const COMMON = [
  "password", "passw0rd", "qwerty", "123456", "654321", "111111", "abc123", "letmein", "welcome",
  "admin", "iloveyou", "monkey", "dragon", "football", "sunshine", "princess", "master", "nairobi",
  "kenya", "microdepth", "mdt", "changeme", "default", "secret", "qwertyuiop", "asdfgh", "zxcvbn",
];

export type PasswordCheck = { id: string; label: string; met: boolean };

export function passwordChecks(password: string, context: { email?: string; name?: string } = {}): PasswordCheck[] {
  const value = password || "";
  const lower = value.toLowerCase();
  const personal = [
    (context.email || "").split("@")[0],
    ...(context.name || "").split(/\s+/),
  ].map(part => part.trim().toLowerCase()).filter(part => part.length >= 3);
  const bytes = new TextEncoder().encode(value).length;
  return [
    { id: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: value.length >= PASSWORD_MIN_LENGTH && bytes <= PASSWORD_MAX_BYTES },
    { id: "upper", label: "An uppercase letter (A–Z)", met: /[A-Z]/.test(value) },
    { id: "lower", label: "A lowercase letter (a–z)", met: /[a-z]/.test(value) },
    { id: "number", label: "A number (0–9)", met: /\d/.test(value) },
    { id: "symbol", label: "A symbol (e.g. ! @ # $ %)", met: /[^A-Za-z0-9\s]/.test(value) },
    {
      id: "unique",
      label: "Not a common word or your name/email",
      met: value.length > 0 && !COMMON.some(word => lower.includes(word)) && !personal.some(part => lower.includes(part)) && !/(.)\1{3,}/.test(value),
    },
  ];
}

export function isStrongPassword(password: unknown, context: { email?: string; name?: string } = {}): password is string {
  return typeof password === "string" && passwordChecks(password, context).every(check => check.met);
}

export const passwordPolicyMessage =
  `Choose a stronger password: at least ${PASSWORD_MIN_LENGTH} characters with uppercase and lowercase letters, a number and a symbol, and avoid common words or your name/email.`;
