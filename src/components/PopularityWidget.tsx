import React from 'react';
import { PopularityComparison } from '../types';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from './IconComponents';
import { translations } from '../i18n';

interface PopularityWidgetProps {
  data: PopularityComparison;
  t: typeof translations.en;
}

const PopularityWidget: React.FC<PopularityWidgetProps> = ({ data, t }) => {
  const { last24HoursIndex, previous24HoursIndex, trend } = data;

  const calculatePercentageChange = () => {
    if (previous24HoursIndex === 0) {
      return last24HoursIndex > 0 ? 100 : 0;
    }
    const change = ((last24HoursIndex - previous24HoursIndex) / previous24HoursIndex) * 100;
    return Math.round(change * 10) / 10; // round to 1 decimal place
  };

  const percentageChange = calculatePercentageChange();

  const getTrendStyles = () => {
    switch (trend) {
      case 'increasing':
        return {
          icon: <ArrowUpIcon className="w-8 h-8" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          ringColor: 'ring-green-500/30'
        };
      case 'decreasing':
        return {
          icon: <ArrowDownIcon className="w-8 h-8" />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          ringColor: 'ring-red-500/30'
        };
      default:
        return {
          icon: <MinusIcon className="w-8 h-8" />,
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/10',
          ringColor: 'ring-slate-500/30'
        };
    }
  };

  const { icon, color, bgColor, ringColor } = getTrendStyles();

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 text-center">{t.topicInterestChange}</h3>
      <div className="flex justify-around items-center">
        {/* Previous 24h */}
        <div className="text-center w-1/3">
          <p className="text-sm text-slate-400">{t.previous24h}</p>
          <p className="text-4xl font-bold text-slate-300 mt-1">{previous24HoursIndex}</p>
        </div>

        {/* Change Indicator */}
        <div className="flex flex-col items-center w-1/3">
          <div className={`flex items-center justify-center w-20 h-20 rounded-full ${bgColor} ring-4 ${ringColor} ${color}`}>
            {icon}
          </div>
          <p className={`text-2xl font-bold mt-2 ${color}`}>
            {percentageChange > 0 && '+'}{percentageChange}%
          </p>
        </div>

        {/* Last 24h */}
        <div className="text-center w-1/3">
          <p className="text-sm text-slate-400">{t.last24h}</p>
          <p className="text-4xl font-bold text-white mt-1">{last24HoursIndex}</p>
        </div>
      </div>
    </div>
  );
};

export default PopularityWidget;
