import { PrismaClient } from '../../../prisma/generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({ connectionString: config.database_url as string });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
