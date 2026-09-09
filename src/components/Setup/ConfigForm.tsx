import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import { testConnection } from '../../services/jiraAPI';
import { Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const ConfigForm: React.FC = () => {
  const { jiraDomain, email, apiToken, corsProxy, setConfig } = useConfigStore();
  
  const [localDomain, setLocalDomain] = useState(jiraDomain);
  const [localEmail, setLocalEmail] = useState(email);
  const [localToken, setLocalToken] = useState(apiToken);
  const [localProxy, setLocalProxy] = useState(corsProxy);
  
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleTest = async () => {
    setStatus('testing');
    setErrorMsg('');
    
    try {
      // Create local API instance for testing since store is not updated yet
      const baseURL = `https://${localDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
      const auth = btoa(`${localEmail}:${localToken}`);
      
      let testUrl = `${baseURL}/rest/api/3/myself`;
      if (localProxy) {
        let proxyUrl = localProxy.trim();
        if (!proxyUrl.startsWith('http://') && !proxyUrl.startsWith('https://') && !proxyUrl.startsWith('/')) {
          proxyUrl = `https://${proxyUrl}`;
        }
        if (!proxyUrl.endsWith('/') && !proxyUrl.endsWith('=')) {
          proxyUrl += '/';
        }
        // Some proxies (like cors-anywhere) expect the URL as a query param, others as a path.
        // We'll use the original encodeURIComponent if it ends with =, otherwise don't encode the protocol/slashes.
        if (proxyUrl.endsWith('=')) {
          testUrl = `${proxyUrl}${encodeURIComponent(testUrl)}`;
        } else {
          testUrl = `${proxyUrl}${testUrl}`;
        }
      }

      const response = await fetch(testUrl, {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.accountId) {
        setStatus('success');
        // Only save to store if successful
        setConfig({
          jiraDomain: baseURL.replace('https://', ''),
          email: localEmail,
          apiToken: localToken,
          corsProxy: localProxy
        });
      } else {
        setStatus('error');
        setErrorMsg('Invalid response from Jira.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Connection failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-2xl border border-border w-full max-w-md p-6 space-y-6">
        
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">Jira Setup</h2>
            <p className="text-sm text-text-muted">Configure API access</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Jira Domain</label>
            <input 
              type="text" 
              placeholder="e.g. your-company.atlassian.net"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={localDomain}
              onChange={(e) => setLocalDomain(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Atlassian Email</label>
            <input 
              type="email" 
              placeholder="you@company.com"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">API Token</label>
            <input 
              type="password" 
              placeholder="Paste your token here"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={localToken}
              onChange={(e) => setLocalToken(e.target.value)}
            />
            <a 
              href="https://id.atlassian.com/manage-profile/security/api-tokens" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
            >
              Get your API token here
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">CORS Proxy URL</label>
            <input 
              type="text" 
              placeholder="https://cors-anywhere.herokuapp.com/?url="
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={localProxy}
              onChange={(e) => setLocalProxy(e.target.value)}
            />
            <p className="text-xs text-text-muted mt-1">Required to bypass browser CORS policies.</p>
          </div>
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-sm">
            <CheckCircle size={18} />
            <span>Connection successful! You can now use the dashboard.</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg text-sm">
            <XCircle size={18} className="shrink-0 mt-0.5" />
            <span className="break-all">{errorMsg}</span>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <button 
            onClick={handleTest}
            disabled={status === 'testing' || !localDomain || !localEmail || !localToken}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'testing' && <Loader2 size={16} className="animate-spin" />}
            Test & Save Connection
          </button>
        </div>

      </div>
    </div>
  );
};
