import axios, { AxiosError, AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

class InnergyClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.innergyBaseUrl,
      headers: {
        Authorization: `Bearer ${env.innergyApiKey}`
      },
      timeout: 30000
    });
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    let attempt = 0;
    const maxRetries = 5;

    while (true) {
      try {
        const response = await this.client.get<T>(path, { params });
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        if (status === 401) {
          throw new Error('Invalid API key or missing permission.');
        }

        if (status === 429 && attempt < maxRetries) {
          const delayMs = 2 ** attempt * 1000;
          logger.warn('Rate limited by INNERGY, retrying', { path, attempt, delayMs });
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          attempt += 1;
          continue;
        }

        logger.error('INNERGY API request failed', {
          path,
          status,
          data: axiosError.response?.data,
          message: axiosError.message
        });
        throw error;
      }
    }
  }
}

export const inneryClient = new InnergyClient();
