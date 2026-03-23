export const optimizeCloudinaryUrl = (url: string | null): string | null => {
  if (!url) return null;

  if (url.includes("res.cloudinary.com")) {
    if (url.includes("f_auto")) {
      return url;
    }

    return url.replace("/upload/", "/upload/f_auto,q_auto,c_fill,w_1200/");
  }

  return url;
};
