export const PHOTO_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;

export type PhotoContentType = (typeof PHOTO_CONTENT_TYPES)[number];
