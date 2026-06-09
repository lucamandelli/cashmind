import crypto from "node:crypto";
import { auth } from "../src/auth.js";
import { db } from "../src/db.js";
import env from "../src/env.js";

async function main() {
  const email = env.SEED_USER_EMAIL;
  const password = env.SEED_USER_PASSWORD;

  if (!email || !password) {
    console.error("SEED_USER_EMAIL and SEED_USER_PASSWORD must be set in .env");
    process.exit(1);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Seed user already exists: ${email}`);
    return;
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name: env.SEED_USER_NAME },
    });
    console.log(`Seeded user via signUpEmail: ${email}`);
  } catch {
    // disableSignUp blocks the sign-up handler — create rows directly,
    // hashing with Better Auth's own hasher so sign-in matches.
    const ctx = await auth.$context;
    const hashed = await ctx.password.hash(password);
    const userId = crypto.randomUUID();
    await db.user.create({
      data: { id: userId, email, name: env.SEED_USER_NAME, emailVerified: true },
    });
    await db.authAccount.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        accountId: userId,
        providerId: "credential",
        password: hashed,
      },
    });
    console.log(`Seeded user via direct insert: ${email}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
