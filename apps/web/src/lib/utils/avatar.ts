export function getAvatarInitials(
  fullName: string | null,
  email: string
): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      // Get first letter of first word and last word
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // If only one word, get first 2 letters
    return fullName.substring(0, 2).toUpperCase();
  }

  // Fallback to email
  if (email && email.length > 0) {
    return email[0].toUpperCase();
  }

  // Ultimate fallback
  return 'U';
}
