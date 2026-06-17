/**
 * Run with: npx ts-node scripts/migrate.ts
 * Or add to your Vercel build command:
 *   "build": "npx ts-node scripts/migrate.ts && next build"
 *
 * This uses drizzle-kit push which is safe for Vercel Postgres —
 * it introspects the current DB state and only applies missing tables/columns.
 */
import { execSync } from "child_process";

console.log("→ Running database migrations...");

try {
  execSync("npx drizzle-kit push --config=drizzle.config.ts", {
    stdio: "inherit",
  });
  console.log("✓ Migrations complete");
} catch (err) {
  console.error("✗ Migration failed:", err);
  process.exit(1);
}
