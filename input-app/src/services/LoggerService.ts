export interface LogData {
  timestamp: string;
  department_id: string;
  payload_size: number;
  payload_over: boolean;
  errors: string[];
}

export const sendLog = async (logData: LogData): Promise<void> => {
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });
};
