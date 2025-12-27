export function getAvatarInitials(
  fullName: string | null,
  email: string
): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      // Lấy chữ cái đầu của từ đầu và từ cuối
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // Nếu chỉ có một từ, lấy 2 chữ cái đầu
    return fullName.substring(0, 2).toUpperCase();
  }

  // Fallback về email
  if (email && email.length > 0) {
    return email[0].toUpperCase();
  }

  // Ultimate fallback
  return 'U';
}
