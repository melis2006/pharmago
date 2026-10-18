// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias, React/TanStack dedupe, error logger
//     plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Deploy target: Vercel. Nitro writes the Vercel Build Output API format to .vercel/output
  // (static assets + one server function that renders every route). Without this the wrapper
  // falls back to Cloudflare Workers. A preset set here beats Nitro's own NITRO_PRESET check, so
  // we read the variable ourselves: e.g. NITRO_PRESET=node-server builds a plain Node server.
  nitro: { preset: process.env["NITRO_PRESET"] || "vercel" },
});
