// services/tokenService.ts
let _accessToken: string | undefined;

export const tokenService = {
  get: () => _accessToken,
  set: (token?: string) => {
    _accessToken = token;
  },
  clear: () => {
    _accessToken = undefined;
  },
};