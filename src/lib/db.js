// lib/db.js
import { neon } from '@neondatabase/serverless';

// This sql object is now your query function
const sql = neon(process.env.DATABASE_URL);

export default sql;
