/**
 * Seed script — creates (or upgrades) an admin account.
 *
 * Usage:
 *   npm run setup
 *   npm run setup -- --email=you@example.com --password=ChangeMe123 --role="Super Admin"
 *
 * Reads (in order of priority): CLI args, env vars, defaults.
 *   --email     | ADMIN_EMAIL    | EMAIL
 *   --username  | ADMIN_USERNAME | "admin"
 *   --name      | ADMIN_NAME     | "Administrator"
 *   --password  | ADMIN_PASSWORD | "admin@123"   (CHANGE on first login!)
 *   --role      | ADMIN_ROLE     | "Super Admin"
 *
 * Idempotent: if a user with the given email already exists, the script updates
 * their role / isVerified flag (and password, only if one was explicitly passed)
 * instead of crashing on the unique-email constraint.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../database/schema/user.schema");

const ALLOWED_ROLES = ["User", "Implementor", "Admin", "Super Admin"];

const parseArgs = (argv) => {
  const out = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.+)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
};

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("✗ MONGO_URI is not set. Add it to backend/.env");
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));
  const email = args.email || process.env.ADMIN_EMAIL || process.env.EMAIL;
  const username = args.username || process.env.ADMIN_USERNAME || "admin";
  const name = args.name || process.env.ADMIN_NAME || "Administrator";
  const password = args.password || process.env.ADMIN_PASSWORD || "admin@123";
  const role = args.role || process.env.ADMIN_ROLE || "Super Admin";
  const passwordWasExplicit = Boolean(args.password || process.env.ADMIN_PASSWORD);

  if (!email) {
    console.error("✗ Missing email. Pass --email=<...> or set ADMIN_EMAIL / EMAIL in backend/.env");
    process.exit(1);
  }
  if (!ALLOWED_ROLES.includes(role)) {
    console.error(`✗ Invalid role "${role}". Must be one of: ${ALLOWED_ROLES.join(", ")}`);
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✓ Connected to MongoDB");

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = role;
      existing.isVerified = true;
      if (passwordWasExplicit) {
        existing.password = bcrypt.hashSync(password, 10);
      }
      await existing.save();
      console.log(`✓ Updated existing user "${existing.username}" — role now "${role}".`);
      if (passwordWasExplicit) console.log("  password rotated.");
    } else {
      const doc = new User({
        name,
        username,
        email,
        password: bcrypt.hashSync(password, 10),
        role,
        isVerified: true,
      });
      await doc.save();
      console.log("✓ Created admin account:");
      console.log(`    role:     ${role}`);
      console.log(`    email:    ${email}`);
      console.log(`    username: ${username}`);
      console.log(`    password: ${passwordWasExplicit ? "(as supplied)" : `${password}  ← default, change after first login`}`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("✗ Seed failed:", err.message || err);
  process.exit(1);
});
