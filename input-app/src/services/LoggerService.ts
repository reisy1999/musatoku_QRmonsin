export interface LogData {
  timestamp: string;
  department_id: number;
  payload_size: number;
  payload_over: boolean;
  errors: string[];
}

export const sendLog = async (logData: LogData): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
      signal: controller.signal,
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
      console.error('LoggerService: log request timed out');
    } else {
      console.error('LoggerService: failed to send log', e);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};
