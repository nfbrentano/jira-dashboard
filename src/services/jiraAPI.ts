import axios from 'axios';
import { useConfigStore, type ConfigState } from '../store/configStore';

export const getJiraApi = (customConfig?: Partial<ConfigState>) => {
  const store = useConfigStore.getState();
  const rawDomain = customConfig?.jiraDomain ?? store.jiraDomain ?? '';
  const domain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const email = customConfig?.email ?? store.email ?? '';
  const apiToken = customConfig?.apiToken ?? store.apiToken ?? '';
  const corsProxy = customConfig?.corsProxy ?? store.corsProxy ?? '/jira-proxy/';

  const targetBase = `https://${domain}`;
  const auth = btoa(`${email}:${apiToken}`);

  let baseURL = '';
  if (corsProxy) {
    let proxy = corsProxy.trim();
    if (proxy === '/jira-proxy' || proxy === '/jira-proxy/') {
      baseURL = `/jira-proxy/${targetBase}`;
    } else if (proxy.endsWith('=')) {
      baseURL = `${proxy}${encodeURIComponent(targetBase)}`;
    } else {
      if (!proxy.endsWith('/')) proxy += '/';
      baseURL = `${proxy}${targetBase}`;
    }
  } else {
    baseURL = `/jira-proxy/${targetBase}`;
  }

  return axios.create({
    baseURL,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

export const testConnection = async (customConfig?: Partial<ConfigState>) => {
  const api = getJiraApi(customConfig);
  const response = await api.get('/rest/api/3/myself');
  return response.data;
};

export const fetchProjects = async () => {
  const api = getJiraApi();
  const response = await api.get('/rest/api/3/project');
  return response.data;
};

export const fetchIssues = async (jql: string, maxResults = 100) => {
  const api = getJiraApi();
  console.log('[Jira API] Executing search/jql with JQL:', jql);
  // NOTE: Atlassian removed /rest/api/3/search with HTTP 410 Gone (CHANGE-2046).
  // The official replacement is /rest/api/3/search/jql
  const response = await api.get('/rest/api/3/search/jql', {
    params: {
      jql,
      maxResults,
      expand: 'changelog',
      fields: [
        'summary',
        'status',
        'assignee',
        'priority',
        'issuetype',
        'created',
        'updated',
        'customfield_10016', // Story Points
        'fixVersions',
      ].join(','),
    },
  });
  console.log('[Jira API] Search results:', {
    total: response.data?.total,
    issuesCount: response.data?.issues?.length,
    issues: response.data?.issues,
  });
  return response.data;
};
