import { deflate } from 'pako';

export const compress = (data: Uint8Array): Uint8Array => {
  return deflate(data);
};
