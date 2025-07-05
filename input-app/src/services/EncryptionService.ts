import JSEncrypt from 'jsencrypt';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { API_BASE_URL, KEY_ENDPOINT } from '../api/apiConfig';

export const fetchPublicKey = async (): Promise<string> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${KEY_ENDPOINT}`,
    );
    if (!response.ok) {
      throw new Error('Failed to fetch public key');
    }
    const res = (await response.json()) as { public_key: string };
    return res.public_key;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      console.warn('EncryptionService: public key request timed out');
      throw new Error('Fetch public key request timed out');
    }
    throw e;
  }
};

export const encryptData = (data: string, publicKey: string): string => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encrypted = encrypt.encrypt(data);
  if (encrypted === false) {
    throw new Error('Encryption failed');
  }
  return encrypted;
};
