/**
 * Avatar generation utilities
 *
 * Generates deterministic avatar URLs using DiceBear API (free, no auth required).
 * Each userId gets a consistent avatar across sessions.
 */

/**
 * Available avatar styles from DiceBear
 * - avataaars: Cartoon characters (recommended for moms)
 * - bottts: Robot avatars
 * - initials: Simple initials on colored background
 * - lorelei: Female-focused cartoon style (perfect for maternal app)
 * - thumbs: Thumbs up characters
 */
export type AvatarStyle =
  | "avataaars"
  | "bottts"
  | "initials"
  | "lorelei"
  | "thumbs";

/**
 * Generates a deterministic avatar URL for a user
 *
 * @param seed - Unique identifier (userId or name) for consistent avatar generation
 * @param style - Avatar style (default: "lorelei" - female-focused, perfect for maternal app)
 * @returns Avatar URL from DiceBear API
 *
 * @example
 * ```typescript
 * const avatarUrl = generateAvatar("user-123");
 * // => https://api.dicebear.com/7.x/lorelei/svg?seed=user-123
 *
 * const avatarUrl = generateAvatar("Maria Silva", "initials");
 * // => https://api.dicebear.com/7.x/initials/svg?seed=Maria%20Silva
 * ```
 */
export function generateAvatar(seed: string, style: AvatarStyle = "lorelei"): string {
  // Encode seed to handle special characters and spaces
  const encodedSeed = encodeURIComponent(seed);

  // DiceBear API v7 - completely free, no authentication, no rate limits for reasonable use
  const baseUrl = "https://api.dicebear.com/7.x";

  // Build avatar URL with optional parameters for better quality
  const params = new URLSearchParams({
    seed: seed,
    // Make avatars more consistent and recognizable
    backgroundColor: "ffd5dc,fadadd", // Soft pink tones (maternal theme)
    backgroundType: "gradientLinear",
  });

  return `${baseUrl}/${style}/svg?${params.toString()}`;
}

/**
 * Generates avatar URL from user's name (for initials style)
 * Extracts first letter of first name and last name
 *
 * @param name - User's full name
 * @returns Avatar URL with initials
 *
 * @example
 * ```typescript
 * const avatarUrl = generateAvatarFromName("Maria Silva");
 * // => https://api.dicebear.com/7.x/initials/svg?seed=MS
 * ```
 */
export function generateAvatarFromName(name: string): string {
  // Extract initials (first letter of first and last name)
  const parts = name.trim().split(/\s+/);
  let initials = "";

  if (parts.length >= 2) {
    // First and last name
    initials = parts[0][0] + parts[parts.length - 1][0];
  } else if (parts.length === 1) {
    // Only one name - use first two letters
    initials = parts[0].substring(0, 2);
  }

  return generateAvatar(initials.toUpperCase(), "initials");
}

/**
 * Validates if a URL is a valid avatar URL
 * Checks if URL is from DiceBear or another trusted avatar provider
 */
export function isValidAvatarUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "api.dicebear.com" ||
      parsed.hostname === "ui-avatars.com" ||
      parsed.hostname === "gravatar.com"
    );
  } catch {
    return false;
  }
}
