// Store a one-way hash of the IP, never the IP itself.
export async function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || "rankly";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function clientIp(request: Request) {
  // Cloudflare sets cf-connecting-ip, which visitors can't spoof.
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "local"
  );
}
