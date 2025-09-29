import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// 使用 PostgreSQL 配置
const createDialect = () => {
  return new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    }),
  });
};

export const db = new Kysely<DB>({
  dialect: createDialect(),
});
