import type { Template } from '../types/Questionnaire';

export const fetchTemplate = async (departmentId: string): Promise<Template> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/templates/${departmentId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch template');
  }
  return response.json();
};
