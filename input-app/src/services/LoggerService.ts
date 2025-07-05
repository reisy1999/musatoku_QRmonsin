export interface LogData {
  timestamp: string;
  department_id: number;
  payload_size: number;
  payload_over: boolean;
  errors: string[];
}

import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { API_BASE_URL, LOG_ENDPOINT } from '../api/apiConfig';

export const sendLog = async (logData: LogData): Promise<void> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${LOG_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    if (response.status === 204) {
      return;
    }

    try {
      const data = (await response.json()) as { status?: string };
      if (data.status === 'ok') {
        return;
      }
    } catch {
      // ignore JSON parse errors
    }

    console.error('LoggerService: unexpected response when sending log');
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      console.warn('LoggerService: log request timed out');
    } else {
      console.error('LoggerService: failed to send log', e);
    }
  }
};
