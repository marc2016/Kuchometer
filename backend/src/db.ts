import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://kuchometer:kuchometer@localhost:5432/kuchometer",
});

export default pool;
