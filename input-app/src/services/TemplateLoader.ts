import type { Template } from '../types/Questionnaire';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export const fetchTemplate = async (departmentId: string): Promise<Template> => {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_API_BASE_URL}/templates/${departmentId}`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }
    const res = (await response.json()) as { template: Template };
    return res.template;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      console.warn('TemplateLoader: template request timed out');
      throw new Error('Fetch template request timed out');
    }
    throw e;
  }
};
