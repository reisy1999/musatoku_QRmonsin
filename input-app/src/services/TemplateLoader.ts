import type { Template } from '../types/Questionnaire';

export const fetchTemplate = async (departmentId: string): Promise<Template> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/templates/${departmentId}`,
      { signal: controller.signal },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }
    const res = (await response.json()) as { template: Template };
    return res.template;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Fetch template request timed out');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
};
