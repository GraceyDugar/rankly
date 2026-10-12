// Cloudflare adapter config. No extra cache storage: the homepage is static
// and the admin/API routes render on each request.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
