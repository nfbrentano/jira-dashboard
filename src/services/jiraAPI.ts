import axios from 'axios';
import { useConfigStore, isForgeEnvironment, type ConfigState } from '../store/configStore';

export { isForgeEnvironment };

const callForgeJira = async (restPath: string) => {
  const { requestJira } = await import('@forge/bridge');
  return requestJira(restPath);
};

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
  if (isForgeEnvironment()) {
    const response = await callForgeJira('/rest/api/3/myself');
    if (!response.ok) {
      throw new Error(`Erro ao conectar ao Jira via Forge: ${response.statusText} (${response.status})`);
    }
    return await response.json();
  }

  const api = getJiraApi(customConfig);
  const response = await api.get('/rest/api/3/myself');
  return response.data;
};

export const fetchProjects = async () => {
  if (isForgeEnvironment()) {
    const response = await callForgeJira('/rest/api/3/project');
    if (!response.ok) {
      throw new Error(`Erro ao buscar projetos via Forge: ${response.statusText} (${response.status})`);
    }
    return await response.json();
  }

  const api = getJiraApi();
  const response = await api.get('/rest/api/3/project');
  return response.data;
};

export const fetchIssues = async (jql: string, maxResults = 100) => {
  console.log('[Jira API] Executing search/jql with JQL:', jql);
  const fields = [
    'summary',
    'status',
    'assignee',
    'priority',
    'issuetype',
    'created',
    'updated',
    'resolutiondate',
    'customfield_10016', // Story Points
    'fixVersions',
  ].join(',');

  if (isForgeEnvironment()) {
    const params = new URLSearchParams({
      jql,
      maxResults: String(maxResults),
      expand: 'changelog',
      fields,
    });
    const response = await callForgeJira(`/rest/api/3/search/jql?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar issues via Forge: ${response.statusText} (${response.status})`);
    }
    const data = await response.json();
    console.log('[Jira API Forge] Search results:', {
      total: data?.total,
      issuesCount: data?.issues?.length,
      issues: data?.issues,
    });
    return data;
  }

  const api = getJiraApi();
  // NOTE: Atlassian removed /rest/api/3/search with HTTP 410 Gone (CHANGE-2046).
  // The official replacement is /rest/api/3/search/jql
  const response = await api.get('/rest/api/3/search/jql', {
    params: {
      jql,
      maxResults,
      expand: 'changelog',
      fields,
    },
  });
  console.log('[Jira API Axios] Search results:', {
    total: response.data?.total,
    issuesCount: response.data?.issues?.length,
    issues: response.data?.issues,
  });
  return response.data;
};
