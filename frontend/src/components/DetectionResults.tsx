import React from 'react';
import { 
  Stack,
  Text,
  DetailsList,
  SelectionMode,
  IColumn,
  DetailsListLayoutMode,
  makeStyles,
  PrimaryButton,
  DefaultButton
} from '@fluentui/react';

const useStyles = makeStyles((theme) => {
  return {
    container: {
      marginBottom: '24px',
    },
    title: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '12px',
    },
    detailsContainer: {
      marginTop: '16px',
    },
    eventsList: {
      marginTop: '16px',
      marginBottom: '16px',
    },
    eventCard: {
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: theme.palette.neutralLighter,
      borderRadius: '4px',
      borderLeft: `4px solid ${theme.palette.themePrimary}`,
    },
    eventHeader: {
      marginBottom: '8px',
    },
    eventType: {
      fontWeight: 600,
      color: theme.palette.themePrimary,
    },
    timestamp: {
      color: theme.palette.neutralSecondary,
    },
    confidence: {
      marginTop: '8px',
    },
    highConfidence: {
      color: theme.palette.green,
    },
    mediumConfidence: {
      color: theme.palette.orange,
    },
    lowConfidence: {
      color: theme.palette.red,
    },
    buttonsContainer: {
      marginTop: '12px',
    }
  };
});

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

export const DetectionResults: React.FC<DetectionResultsProps> = ({ video }) => {
  const styles = useStyles();
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 0.8) return styles.highConfidence;
    if (confidence >= 0.6) return styles.mediumConfidence;
    return styles.lowConfidence;
  };

  return (
    <Stack className={styles.container}>
      <Text className={styles.title}>Detection Results</Text>
      
      {(!video.events || video.events.length === 0) ? (
        <Text>No events detected in this video.</Text>
      ) : (
        <div className={styles.eventsList}>
          {video.events.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <Stack>
                <Stack horizontal horizontalAlign="space-between" className={styles.eventHeader}>
                  <Text className={styles.eventType}>
                    {getEventTypeLabel(event.eventType)}
                  </Text>
                  <Text className={styles.timestamp}>
                    Time: {formatTime(event.timestamp)}
                  </Text>
                </Stack>
                
                <Text className={`${styles.confidence} ${getConfidenceClass(event.confidence)}`}>
                  Confidence: {(event.confidence * 100).toFixed(1)}%
                </Text>
                
                {event.reviewed && (
                  <Text>
                    Review Status: {event.status === 'correct' ? 'Confirmed ✓' : 
                                   event.status === 'false_positive' ? 'False Positive ✗' : 
                                   'Missed Event !'}
                  </Text>
                )}
                
                {event.comment && (
                  <Text>Comment: {event.comment}</Text>
                )}
              </Stack>
            </div>
          ))}
        </div>
      )}
    </Stack>
  );
};

export default DetectionResults;