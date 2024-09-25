import axios from 'axios';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { fetchAuthSession as fetchCredentials } from '@aws-amplify/core';
import AwsConfig from './Config';

Amplify.configure(AwsConfig);

const getAuthTokens = async () => {
  try {
    const { tokens } = await fetchAuthSession();
    const JWT = tokens.idToken.toString();

    const { credentials } = await fetchCredentials();
    const identityToken = {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    };

    const cache = await caches.open('tripjourney');

    return { JWT, identityToken, cache };
  } catch (error) {
    console.error('Error fetching auth tokens:', error);
    throw error;
  }
};

const getClient = async (clientIdOverride, useCache) => {
  try {
    const { JWT, identityToken, cache } = await getAuthTokens();

    const options = {
      baseURL: `https://${process.env.REACT_APP_API_DOMAIN_SUFFIX}.tripjourney.co/`,
      timeout: 900000,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        "Authorization": JWT,
        "key": identityToken.accessKeyId,
        "secret": identityToken.secretAccessKey,
        "session": identityToken.sessionToken
      }
    };

    const client = axios.create(options);

    if (useCache) {
      const requestHandler = async (request) => {
        if (request.method.toLowerCase() === 'get') {
          const response = await cache.match(request.baseURL + request.url)
          if (response) {
            request.headers.cached = true;
            request.data = await response.json();
            return Promise.reject(request);
          }
        }
        return request;
      };

      client.interceptors.request.use(
        requestConfig => requestHandler(requestConfig),
        (requestError) => {
          console.log('Request error: ', requestError);
          return Promise.reject(requestError);
        },
      );

      client.interceptors.response.use(
        (response) => {
          if (response.config?.method.toLowerCase() === 'get' && [200,201,202,203,204,205].includes(response.status)) {
            const now = Date.now();
            response.headers.timeCached = new Date(now).toLocaleString();
            cache.put(response.config.baseURL + response.config.url, new Response(JSON.stringify(response.data), response));
          }
          return response;
        },
        (error) => {
          if (error.headers?.cached === true) {
            return Promise.resolve(error);
          }
          return Promise.reject(error);
        }
      );
    } else {
      client.interceptors.request.use(
        requestConfig => requestConfig,
        (requestError) => {
          console.log('Request error: ', requestError);
          return Promise.reject(requestError);
        },
      );

      client.interceptors.response.use(
        async (response) => {
          const isCached = await cache.match(response.request?.responseURL);
          if (!!isCached && response.config?.method.toLowerCase() === 'get' && [200,201,202,203,204,205].includes(response.status)) {
            const now = Date.now();
            response.headers.timeCached = new Date(now).toLocaleString();
            cache.put(response.config.baseURL + response.config.url, new Response(JSON.stringify(response.data), response));
          }
          return response;
        },
        (error) => {
          if (error?.response?.status >= 400) {
            console.log('Response error: ', error);
            console.log('response when error: ', error?.response?.data?.body);
          }
          return Promise.reject(error.response?.data);
        },
      );
    }

    return client;
  } catch (error) {
    console.error('Error creating API client:', error);
    throw error;
  }
};

const API = {
  async get(url, { conf = {}, clientId = null, useCache = false, queryParams = {} } = {}) {
    const cli = await getClient(clientId, useCache);
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return cli.get(fullUrl, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  async delete(url, { conf = {}, clientId = null, useCache = false } = {}) {
    const cli = await getClient(clientId, useCache);
    return cli.delete(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  async head(url, { conf = {}, clientId = null, useCache = false } = {}) {
    const cli = await getClient(clientId, useCache);
    return cli.head(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  async options(url, { conf = {}, clientId = null, useCache = false } = {}) {
    const cli = await getClient(clientId, useCache);
    return cli.options(url, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  async post(url, { data = {}, conf = {}, clientId = null, useCache = false } = {}) {
    const cli = await getClient(clientId, useCache);
    return cli.post(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  async put(url, { data = {}, conf = {}, clientId = null, useCache = false } = {}) {
    const cli = await getClient(clientId, useCache);
    return cli.put(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },

  async patch(url, { data = {}, conf = {}, clientId = null, useCache = false } = {}) {
    const cli = await getClient(clientId, useCache);
    return cli.patch(url, data, conf)
      .then(response => Promise.resolve(response))
      .catch(error => Promise.reject(error));
  },
};

export default API;