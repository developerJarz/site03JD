/**
 * Creates (or promotes) an administrator account.
 *
 *   npm run create-admin -- --email you@jarzdigital.com --name "Your Name"
 *   npm run create-admin -- --email you@jarzdigital.com --role EDITOR
 *
 * The password is prompted for (hidden) unless --password is provided.
 */
import "./_env";
import { createInterface } from "node:readline";
import mongoose from "mongoose";
import { hashPassword } from "../src/lib/auth/password";
import { User } from "../src/models/User";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  if (hidden) {
    // Mask typed characters.
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
      process.stdout.write(s.includes(question) ? s : "*");
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    }),
  );
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (see .env.example).");

  const email = (arg("email") ?? (await ask("Email: "))).toLowerCase();
  const name = arg("name") ?? (await ask("Full name: "));
  const role = (arg("role") ?? "ADMIN").toUpperCase();
  if (!["ADMIN", "EDITOR"].includes(role)) throw new Error("Role must be ADMIN or EDITOR");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address");

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB ?? "jarzdigital" });
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = role as "ADMIN" | "EDITOR";
    existing.status = "active";
    await existing.save();
    console.log(`✓ ${email} is now ${role}.`);
  } else {
    const password = arg("password") ?? (await ask("Password (min 10 chars, letters + numbers): ", true));
    if (password.length < 10 || !/[a-z]/i.test(password) || !/\d/.test(password)) {
      throw new Error("Password must be at least 10 characters and include a letter and a number.");
    }
    await User.create({ name: name || "Administrator", email, passwordHash: await hashPassword(password), role: role as "ADMIN" | "EDITOR" });
    console.log(`✓ Created ${role} account for ${email}.`);
  }
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(`✗ ${err instanceof Error ? err.message : err}`);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
