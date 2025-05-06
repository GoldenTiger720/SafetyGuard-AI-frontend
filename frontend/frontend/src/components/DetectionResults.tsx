import React from 'react';
import {
  FireIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ClockIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/solid';

// Define interface for detection events
interface IDetectionEvent {
  id: string;
  videoId: string;
  timestamp: number;
  eventType: 'fall' | 'fire' | 'smoke' | 'violence' | 'inactivity';
  confidence: number;
  reviewed: boolean;
  status?: 'correct' | 'false_positive' | 'missed';
  comment?: string;
}

// Define interface for videos
interface IVideo {
  id: string;
  filename: string;
  uploadDate: string;
  duration: number;
  analyzed: boolean;
  processing?: boolean;
  events?: IDetectionEvent[];
}

interface DetectionResultsProps {
  video: IVideo;
}

const DetectionResults: React.FC<DetectionResultsProps> = ({ video }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'fall':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case 'fire':
        return <FireIcon className="h-6 w-6 text-orange-500" />;
      case 'smoke':
        return <FireIcon className="h-6 w-6 text-gray-500" />;
      case 'violence':
        return <HandRaisedIcon className="h-6 w-6 text-purple-500" />;
      case 'inactivity':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <QuestionMarkCircleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'fall': return 'Fall Detected';
      case 'fire': return 'Fire Detected';
      case 'smoke': return 'Smoke Detected';
      case 'violence': return 'Violence Detected';
      case 'inactivity': return 'Extended Inactivity';
      default: return eventType;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReviewStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'correct':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'false_positive':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'missed':
        return <NoSymbolIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getReviewStatusLabel = (status?: string) => {
    if (!status) return '';
    
    switch (status) {
      case 'correct': return 'Confirmed';
      case 'false_positive': return 'False Positive';
      case 'missed': return 'Missed Event';
      default: return status;
    }
  };

  const getEventCardClass = (event: IDetectionEvent) => {
    let borderColor = 'border-gray-200';
    
    if (event.reviewed) {
      switch (event.status) {
        case 'correct':
          borderColor = 'border-green-500';
          break;
        case 'false_positive':
          borderColor = 'border-red-500';
          break;
        case 'missed':
          borderColor = 'border-yellow-500';
          break;
      }
    }
    
    return borderColor;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Detection Results</h3>
      
      {(!video.events || video.events.length === 0) ? (
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <p className="text-gray-500">No events detected in this video.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {video.events.map((event) => (
            <div 
              key={event.id} 
              className={`bg-white p-4 border-l-4 ${getEventCardClass(event)} rounded-md shadow-sm`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {getEventIcon(event.eventType)}
                  <div className="ml-3">
                    <h4 className="text-base font-medium text-gray-900">
                      {getEventTypeLabel(event.eventType)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Time: {formatTime(event.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${getConfidenceColor(event.confidence)}`}>
                    {(event.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </div>
              
              {event.reviewed && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center">
                    {getReviewStatusIcon(event.status)}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {getReviewStatusLabel(event.status)}
                    </span>
                  </div>
                  
                  {event.comment && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 italic">
                        "{event.comment}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetectionResults;