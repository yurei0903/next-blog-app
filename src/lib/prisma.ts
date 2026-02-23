import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; // ◀ 追加: pgパッケージからPoolをインポート

// Prisma本体と、データベース接続(Pool)の両方を保存する箱を用意
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// 1. Pool（接続）がすでに存在すればそれを使い、無ければ作る
const pool =
  globalForPrisma.pool ||
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool; // 開発中はPoolを保存して使い回す
}

// 2. 使い回したPoolを使ってAdapterを作る
const adapter = new PrismaPg(pool);

// 3. PrismaClientを作る（すでに存在すればそれを使う）
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma; // 開発中はPrisma本体も保存して使い回す
}
