import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: 'blue' | 'amber' | 'green' | 'purple' | 'teal';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change && change.startsWith('+');

  const colorConfig = {
    blue: {
      gradient: 'from-blue-500/80 to-blue-500/50',
      text: 'text-blue-300',
    },
    amber: {
      gradient: 'from-amber-500/80 to-amber-500/50',
      text: 'text-amber-300',
    },
    green: {
      gradient: 'from-green-500/80 to-green-500/50',
      text: 'text-green-300',
    },
    purple: {
      gradient: 'from-purple-500/80 to-purple-500/50',
      text: 'text-purple-300',
    },
    teal: {
      gradient: 'from-primary/80 to-primary/50',
      text: 'text-primary',
    }
  };
  
  const selectedColor = colorConfig[color] || colorConfig.teal;

  return (
    <div className="bg-surface p-5 rounded-xl border border-border-default transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-primary-glow">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                 <div className={`p-3 rounded-lg bg-gradient-to-br ${selectedColor.gradient} shadow-md`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-text-secondary">{title}</p>
                    <p className="text-xl font-bold text-text-primary">{value}</p>
                </div>
            </div>
            {change && (
              <span className={`text-sm font-semibold px-2 py-1 rounded-md ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {change}
              </span>
            )}
        </div>
    </div>
  );
};

export default KpiCard;