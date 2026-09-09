export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
      statusCategory: {
        key: string;
        name: string;
      };
    };
    assignee: {
      displayName: string;
      accountId: string;
      avatarUrls: {
        '48x48': string;
      };
    } | null;
    priority: {
      name: string;
      iconUrl: string;
    };
    issuetype: {
      name: string;
      iconUrl: string;
    };
    created: string;
    updated: string;
    customfield_10016?: number; // Story Points (example custom field id, might need to be dynamic)
    fixVersions?: Array<{
      name: string;
    }>;
  };
  changelog?: {
    histories: Array<{
      created: string;
      items: Array<{
        field: string;
        fieldtype: string;
        fromString: string;
        toString: string;
      }>;
    }>;
  };
}
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    '48x48': string;
  };
}

export interface JiraSearchResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}
