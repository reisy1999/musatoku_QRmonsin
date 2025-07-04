import JSEncrypt from 'jsencrypt';

export const fetchPublicKey = async (): Promise<string> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_KEY_ENDPOINT}`);
  if (!response.ok) {
    throw new Error('Failed to fetch public key');
  }
  const res = (await response.json()) as { public_key: string };
  return res.public_key;
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
