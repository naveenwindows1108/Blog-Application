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

/**
 * Specific optimization for hero images (16:9 aspect ratio)
 * Enforces 1200x675 dimensions at Cloudinary level
 */
export const optimizeHeroImage = (url: string | null): string | null => {
  if (!url) return null;

  if (url.includes("res.cloudinary.com")) {
    if (url.includes("f_auto")) {
      return url;
    }
    // w_1200,h_675,c_fill: enforces 16:9 aspect ratio, smart crops to subject
    return url.replace("/upload/", "/upload/w_1200,h_675,c_fill,g_auto,f_auto,q_auto,dpr_auto/");
  }

  return url;
};

/**
 * Specific optimization for article card thumbnails (3:2 aspect ratio)
 * Enforces 600x400 dimensions at Cloudinary level
 * This is the KEY fix for uniform card heights
 */
export const optimizeCardImage = (url: string | null): string | null => {
  if (!url) return null;

  if (url.includes("res.cloudinary.com")) {
    if (url.includes("f_auto")) {
      return url;
    }
    // w_600,h_400,c_fill: enforces 3:2 aspect ratio, smart crops to subject
    return url.replace("/upload/", "/upload/w_600,h_400,c_fill,g_auto,f_auto,q_auto,dpr_auto/");
  }

  return url;
};
