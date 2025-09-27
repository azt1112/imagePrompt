export default defineNitroConfig({
  srcDir: "routes",
  experimental: {
    wasm: true
  },
  preset: "vercel-edge"
});