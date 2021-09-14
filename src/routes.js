const host = 'https://faced.track.uz/api/v1';

export const routes = {
  authRequestTask: () => [host, 'authentication/simple-inplace-authentication-request-task'].join('/'),
  authRequestStatus: () => [host, 'authentication/simple-inplace-authentication-request-status'].join('/'),
  accessToken: () => [host, 'oauth2/access-token'].join('/'),
};
