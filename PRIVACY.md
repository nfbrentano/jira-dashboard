# Privacy Policy - Agile Ops & Delivery Dashboard for Jira

**Last Updated:** September 14, 2026  
**Online Version:** [https://nfbrentano.github.io/jira-dashboard/privacy.html](https://nfbrentano.github.io/jira-dashboard/privacy.html)

This Privacy Policy explains how **Agile Ops & Delivery Dashboard** ("the App", "we", "our") collects, uses, and protects information when installed and used within your Atlassian Jira Cloud instance.

---

## 1. Architecture & Data Handling (Atlassian Forge)

The App is built exclusively using **Atlassian Forge**, Atlassian's serverless cloud app development platform.

- **No External Servers:** The App executes entirely within Atlassian Cloud and inside your browser session using Atlassian's secure Custom UI sandbox (`@forge/bridge`).
- **No Third-Party Data Transmission:** We do **not** transmit, store, or replicate any of your Jira issues, project metadata, personal data, or analytics to external servers, third-party databases, or data brokers.
- **Client-Side Processing:** All computations (such as Lead Time, Cycle Time, Throughput, and WIP Limit evaluations) occur ephemerally in memory within the user's browser or Atlassian's secure runtime.

---

## 2. Information Accessed

The App requests only the minimal necessary permissions (`scopes`) required to deliver its functionality:

- `read:jira-work`: Required to read Jira issue details (status, issue type, created/resolved dates, resolution, priority, labels, and components) to generate delivery metrics, flow charts, backlog aging, and quality reports.
- `read:jira-user`: Required to display assignee names or avatars associated with issues on quality/WIP charts.

---

## 3. Data Storage & Retention

- **Configuration Settings:** User preferences (such as selected projects, date range filters, or custom WIP thresholds) are stored locally within the browser (`localStorage`) or within Atlassian's encrypted Forge Storage API.
- **Customer Data Retention:** Because no customer Jira data is collected or copied to external systems, there is no external data retention or exposure risk.

---

## 4. Third-Party Services

The App does **not** integrate third-party analytics trackers, advertising SDKs, or external monitoring beacons.

---

## 5. Security & Compliance

The App adheres to the security requirements mandated by the Atlassian Marketplace Partner Program, including:
- Utilizing Atlassian OAuth and native authorization protocols.
- Enforcing Atlassian's Content Security Policy (CSP).
- Respecting Jira role-based access control (users can only see data they already have permission to view in Jira).

---

## 6. Changes to this Policy

We may update this Privacy Policy from time to time. Any updates will be reflected with a revised "Last Updated" date.

---

## 7. Contact Us

If you have questions, inquiries, or security-related concerns, please contact our support team at:
- **Email:** support@agileopsdashboard.com *(or your dedicated support email)*
- **Documentation & Issues:** https://github.com/nfbrentano/jira-dashboard
