/**
 * Optimize Cloudinary URL for web delivery
 * Adds auto format, quality optimization, and appropriate dimensions
 */
export const optimizeCloudinaryUrl = (url: string | null, width: number = 1200): string | null => {
  if (!url) return null;

  if (url.includes("res.cloudinary.com")) {
    if (url.includes("f_auto")) {
      return url;
    }

    // f_auto: auto format (WebP/AVIF), q_auto: auto quality compression
    // c_fill: fill container, ar_1: aspect ratio 1:1 for cards
    return url.replace("/upload/", `/upload/f_auto,q_auto,c_fill,w_${width},dpr_auto/`);
  }

  return url;
};

// Specific optimization for hero images
export const optimizeHeroImage = (url: string | null): string | null => {
  return optimizeCloudinaryUrl(url, 1200);
};

// Specific optimization for article card thumbnails
export const optimizeCardImage = (url: string | null): string | null => {
  return optimizeCloudinaryUrl(url, 600);
};
