const usernamePattern = /^[a-z0-9_]{3,32}$/;

export function normalizeUsername(value: FormDataEntryValue | string | null) {
  const username = String(value ?? "").trim().toLowerCase();
  if (!usernamePattern.test(username)) {
    throw new Error("Use 3-32 letters, numbers, or underscores for the username.");
  }
  return username;
}
