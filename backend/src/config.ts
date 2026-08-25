import {z} from "zod";
const schema=z.object({PORT:z.coerce.number().default(4000),FRONTEND_URL:z.string().default("http://localhost:3000"),DATABASE_URL:z.string().optional()});
export const config=schema.parse(process.env);
