import { Kysely, PostgresDialect, SqliteDialect } from "kysely";
import { Pool } from "pg";
import Database from "better-sqlite3";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// 根据环境变量选择数据库方言
const createDialect = () => {
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    // SQLite 配置
    return new SqliteDialect({
      database: new Database(process.env.DATABASE_URL.replace('file:', '')),
    });
  } else {
    // PostgreSQL 配置
    return new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      }),
    });
  }
};

export const db = new Kysely<DB>({
  dialect: createDialect(),
});
