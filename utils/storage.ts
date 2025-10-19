// utils/storage.ts
export function urlToStoragePath(publicUrl: string): string | null {
  // Supabase public URL contains /object/public/<bucket>/<path>
  const marker = '/object/public/';
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  const after = publicUrl.substring(i + marker.length); // "<bucket>/<path>"
  const slash = after.indexOf('/');
  if (slash === -1) return null;
  return after.substring(slash + 1); // "<path>"
}
