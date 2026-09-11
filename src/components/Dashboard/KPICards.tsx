import React from 'react';
import { useIssuesQuery } from '../../hooks/useIssuesQuery';
import { Layers, Activity, Bug, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const KPICards: React.FC = () => {
  const { data, isLoading, error } = useIssuesQuery();

  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-surface/80 backdrop-blur-md border border-border rounded-xl p-4 h-24"></div>
      ))}
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-rose-50 text-rose-600 rounded-lg">Error loading data.</div>;
  }

  const issues = data?.issues || [];
  
  // Example KPIs
  const totalItems = issues.length;
  const inProgress = issues.filter(i => i.fields?.status?.statusCategory?.key === 'indeterminate').length;
  const done = issues.filter(i => i.fields?.status?.statusCategory?.key === 'done').length;
  
  const withoutRelease = issues.filter(i => !i.fields?.fixVersions || i.fields.fixVersions.length === 0).length;
  
  // Custom status logic (may need adjustment depending on Jira workflow)
  const readyForQA = issues.filter(i => i.fields?.status?.name?.toLowerCase().includes('qa') || i.fields?.status?.name?.toLowerCase().includes('test')).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card title="Total Items" value={totalItems} icon={Layers} color="blue" />
      <Card title="WIP" value={inProgress} icon={Activity} color={inProgress > 10 ? 'rose' : 'amber'} />
      <Card title="Done" value={done} icon={CheckCircle2} color="emerald" />
      <Card title="QA Queue" value={readyForQA} icon={Bug} color="purple" />
      <Card title="No Release" value={withoutRelease} icon={AlertTriangle} color="rose" />
      <Card title="Stuck > 10d" value={0 /* TODO: Aging calculation */} icon={Clock} color="amber" />
    </div>
  );
};

const Card = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    emerald: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
    amber: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
    rose: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  };

  return (
    <div className="bg-surface/80 backdrop-blur-md border border-border rounded-xl p-4 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-text-muted">{title}</span>
        <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold text-text-main">{value}</span>
      </div>
    </div>
  );
}
