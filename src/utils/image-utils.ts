/**
 * Utility functions for handling image URLs and fallbacks
 */

// Default placeholder image - use a reliable service
export const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/EFEFEF/999999?text=No+Image";

/**
 * Format and validate an image URL
 * @param url The image URL to format
 * @returns A properly formatted URL or default placeholder
 */
export function formatImageUrl(url: string): string {
  if (!url || url.trim() === '') return PLACEHOLDER_IMAGE;
  
  try {
    // Check if it's already a valid URL
    new URL(url);
    return url;
  } catch (e) {
    // If not a valid URL, try to fix it
    if (url.startsWith('www.')) {
      return `https://${url}`;
    } else if (!url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  }
}

/**
 * Get a valid image URL with fallback to placeholder
 * @param url The original image URL
 * @returns A valid image URL or placeholder
 */
export function getValidImageUrl(url?: string): string {
  if (!url || url.trim() === '') return PLACEHOLDER_IMAGE;
  
  try {
    return formatImageUrl(url);
  } catch (e) {
    return PLACEHOLDER_IMAGE;
  }
}

/**
 * Create a function to handle image loading errors
 * @param defaultImage The fallback image URL 
 * @returns An event handler for onError
 */
export function handleImageError(defaultImage: string = PLACEHOLDER_IMAGE) {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = defaultImage;
  };
}
