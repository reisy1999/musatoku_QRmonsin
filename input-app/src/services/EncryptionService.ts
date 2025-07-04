import JSEncrypt from 'jsencrypt';

export const fetchPublicKey = async (): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_KEY_ENDPOINT}`,
      { signal: controller.signal },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch public key');
    }
    const res = (await response.json()) as { public_key: string };
    return res.public_key;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Fetch public key request timed out');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
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
