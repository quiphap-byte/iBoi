
import React from 'react';
import { useI18n } from '../hooks/useI18n';

const LoadingSpinner: React.FC = () => {
    const { t } = useI18n();
    const loadingMessages = t('loadingMessages') as string[];
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, [loadingMessages]);


  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <svg
        className="animate-spin h-12 w-12 text-purple-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="text-lg text-purple-300 font-medium transition-opacity duration-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
