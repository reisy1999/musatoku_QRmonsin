import type { Template } from '../types/Questionnaire';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { API_BASE_URL, TEMPLATE_ENDPOINT } from '../api/apiConfig';

// 本番環境では Azure Functions 経由でテンプレートを取得する

export const fetchTemplate = async (departmentId: string): Promise<Template> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${TEMPLATE_ENDPOINT}/${departmentId}`,
    );
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`TemplateLoader: Failed to fetch template. Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    const res = (await response.json()) as { template: Template };
    return res.template;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      console.warn('TemplateLoader: template request timed out');
      throw new Error('Fetch template request timed out');
    } else if (e instanceof Error) {
      console.error(`TemplateLoader: An error occurred while fetching template: ${e.message}`);
      throw e;
    } else {
      console.error('TemplateLoader: An unknown error occurred while fetching template', e);
      throw new Error('An unknown error occurred');
    }
  }
};
