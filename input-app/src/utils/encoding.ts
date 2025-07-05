import Encoding from 'encoding-japanese';

export const toShiftJIS = (text: string): Uint8Array => {
  const sjisBytes = Encoding.convert(text, {
    to: 'SJIS',
    from: 'UNICODE',
    type: 'array',
  });
  return new Uint8Array(sjisBytes);
};

export const fromShiftJIS = (bytes: Uint8Array): string => {
  const unicodeString = Encoding.convert(bytes, {
    to: 'UNICODE',
    from: 'SJIS',
    type: 'string',
  });
  return unicodeString;
};

export const uint8ToBase64 = (uint8Array: Uint8Array): string => {
  let binary = '';
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};
