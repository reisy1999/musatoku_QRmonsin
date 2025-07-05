// API base configuration for the input-app frontend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const KEY_ENDPOINT = import.meta.env.VITE_KEY_ENDPOINT || '/api/public-key';
export const TEMPLATE_ENDPOINT = import.meta.env.VITE_TEMPLATE_ENDPOINT || '/api/templates';
export const LOG_ENDPOINT = import.meta.env.VITE_LOGS_ENDPOINT || '/api/logs';
