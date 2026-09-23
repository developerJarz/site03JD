/**
 * Local MongoDB for development — no installation required.
 *
 *   npm run db:dev
 *
 * Starts a real mongod (downloaded once by mongodb-memory-server) on
 * 127.0.0.1:27017 with data persisted in ./.data/mongo, so content survives
 * restarts. Use a real MongoDB / Atlas cluster in production.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server-core";

const dbPath = path.resolve(".data/mongo");
mkdirSync(dbPath, { recursive: true });
const port = Number(process.env.DEV_DB_PORT ?? 27017);

async function main() {
const server = await MongoMemoryServer.create({
  instance: { port, ip: "127.0.0.1", dbPath, storageEngine: "wiredTiger" },
});

console.log(`\n  MongoDB ready → mongodb://127.0.0.1:${port}`);
console.log(`  Data directory → ${dbPath}`);
console.log(`  Set MONGODB_URI=mongodb://127.0.0.1:${port} in .env.local, then run: npm run db:seed\n`);

const stop = async () => {
  await server.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => undefined, 1 << 30);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
