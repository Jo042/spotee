import { testDatabaseUrl } from './test-database';

const url = testDatabaseUrl();
process.env.DATABASE_URL = url;
process.env.DIRECT_URL = url;
