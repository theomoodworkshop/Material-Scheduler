import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (!process.env.MOCK_INNERGY && (!process.env.INNERGY_BASE_URL || !process.env.INNERGY_API_KEY)) {
  throw new Error('INNERGY_BASE_URL and INNERGY_API_KEY are required when MOCK_INNERGY is false.');
}

export const env = {
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  innergyBaseUrl: process.env.INNERGY_BASE_URL || '',
  innergyApiKey: process.env.INNERGY_API_KEY || '',
  mockInnergy: process.env.MOCK_INNERGY === 'true',
  dueSoonWindowDays: Number(process.env.DUE_SOON_WINDOW_DAYS || 14),
  defaultLeadTimeDays: Number(process.env.DEFAULT_LEAD_TIME_DAYS || 14),
  syncCacheMinutes: Number(process.env.SYNC_CACHE_MINUTES || 15)
};
