import React from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from './IconComponents';
import { translations } from '../i18n';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
  t: typeof translations.en;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, t }) => {
  return (
    <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-5 rounded-lg relative flex flex-col items-center justify-center text-center my-8">
      <AlertTriangleIcon className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-bold text-red-200">{t.errorOccurred}</h3>
      <p className="mt-2 mb-6 text-sm max-w-md">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 text-sm font-medium rounded-md transition-colors"
      >
        <RefreshCwIcon className="w-4 h-4 mr-2" />
        {t.tryAgain}
      </button>
    </div>
  );
};

export default ErrorDisplay;
