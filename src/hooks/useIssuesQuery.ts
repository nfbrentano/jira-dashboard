import { useQuery } from '@tanstack/react-query';
import { fetchIssues, fetchProjects } from '../services/jiraAPI';
import { useFilterStore } from '../store/filterStore';
import { useConfigStore } from '../store/configStore';
import { buildDateRangeJql } from '../utils/dateRange';
import type { JiraSearchResponse, JiraProject } from '../types/jira';

export const useProjects = () => {
  const isConfigured = useConfigStore((state) => state.isConfigured());

  return useQuery<JiraProject[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: isConfigured,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useIssuesQuery = () => {
  const isConfigured = useConfigStore((state) => state.isConfigured());
  const { projectKey, sprint, types, epics, assignees, priorities, dateRange } = useFilterStore();

  return useQuery<JiraSearchResponse>({
    queryKey: ['issues', projectKey, sprint, types, epics, assignees, priorities, dateRange],
    queryFn: async () => {
      // Build JQL based on filters
      let jql = `project = "${projectKey}"`;

      if (sprint === 'active') {
        jql += ` AND sprint in openSprints()`;
      } else if (sprint === 'future') {
        jql += ` AND sprint in futureSprints()`;
      }

      if (types.length > 0) {
        jql += ` AND issuetype in (${types.map(t => `"${t}"`).join(',')})`;
      }

      if (epics.length > 0) {
        jql += ` AND "Epic Link" in (${epics.map(e => `"${e}"`).join(',')})`;
      }

      if (priorities.length > 0) {
        jql += ` AND priority in (${priorities.map(p => `"${p}"`).join(',')})`;
      }

      if (assignees.length > 0) {
        jql += ` AND assignee in (${assignees.map(a => `"${a}"`).join(',')})`;
      }

      // Date range filtering: created OR resolved
      const dateJql = buildDateRangeJql(dateRange);
      if (dateJql) {
        jql += ` AND ${dateJql}`;
      }

      jql += ` ORDER BY created DESC`;

      return fetchIssues(jql);
    },
    enabled: isConfigured && !!projectKey,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};
