/**
 * Prisma Configuration (Prisma 7+)
 * ===========================================
 * Konfigurasi database URL untuk Prisma
 */

import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  schema: path.join(__dirname, "prisma", "schema.prisma"),
} satisfies PrismaConfig;
