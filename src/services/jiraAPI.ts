import axios from 'axios';
import { useConfigStore } from '../store/configStore';

export const getJiraApi = () => {
  const { jiraDomain, email, apiToken, corsProxy } = useConfigStore.getState();

  const baseURL = `https://${jiraDomain}`;
  const auth = btoa(`${email}:${apiToken}`);

  const api = axios.create({
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Intercept requests to prepend the CORS proxy
  api.interceptors.request.use((config) => {
    if (config.url && config.url.startsWith('/')) {
      const targetUrl = `${baseURL}${config.url}`;
      if (corsProxy) {
        let proxyUrl = corsProxy.trim();
        // Don't prepend https:// if it's a relative path starting with /
        if (!proxyUrl.startsWith('http://') && !proxyUrl.startsWith('https://') && !proxyUrl.startsWith('/')) {
          proxyUrl = `https://${proxyUrl}`;
        }
        if (!proxyUrl.endsWith('/') && !proxyUrl.endsWith('=')) {
          proxyUrl += '/';
        }
        if (proxyUrl.endsWith('=')) {
          config.url = `${proxyUrl}${encodeURIComponent(targetUrl)}`;
        } else {
          config.url = `${proxyUrl}${targetUrl}`;
        }
      } else {
        config.url = targetUrl;
      }
    }
    return config;
  });

  return api;
};

export const testConnection = async () => {
  const api = getJiraApi();
  const response = await api.get('/rest/api/3/myself');
  return response.data;
};

export const fetchProjects = async () => {
  const api = getJiraApi();
  const response = await api.get('/rest/api/3/project');
  return response.data;
};

export const fetchIssues = async (jql: string, startAt = 0, maxResults = 100) => {
  const api = getJiraApi();
  const response = await api.post('/rest/api/3/search', {
    jql,
    startAt,
    maxResults,
    fields: [
      'summary',
      'status',
      'assignee',
      'priority',
      'issuetype',
      'created',
      'updated',
      'customfield_10016', // SP
      'fixVersions'
    ],
  });
  return response.data;
};
