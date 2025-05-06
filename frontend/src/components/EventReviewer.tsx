import React, { useState } from 'react';
import { 
  Stack, 
  Text, 
  PrimaryButton, 
  DefaultButton, 
  TextField, 
  ChoiceGroup, 
  IChoiceGroupOption,
  makeStyles,
  Dialog,
  DialogType,
  DialogFooter,
  IDialogContentProps
} from '@fluentui/react';

const useStyles = makeStyles((theme) => {
  return {
    container: {
      marginTop: '24px',
    },
    title: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '12px',
    },
    eventCard: {
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: theme.palette.neutralLighter,
      borderRadius: '4px',
      border: `1px solid ${theme.palette.neutralLight}`,
    },
    reviewForm: {
      padding: '16px',
      marginTop: '16px',
      backgroundColor: theme.palette.white,
      borderRadius: '4px',
      border: `1px solid ${theme.palette.neutralLight}`,
    },
    formTitle: {
      fontSize: '16px',
      fontWeight: 600,
      marginBottom: '12px',
    },
    choiceGroup: {
      marginBottom: '16px',
    },
    buttonRow: {
      marginTop: '16px',
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
    reviewed: {
      backgroundColor: theme.palette.neutralLighterAlt,
    },
    correct: {
      borderLeft: `4px solid ${theme.palette.green}`,
    },
    falsePositive: {
      borderLeft: `4px solid ${theme.palette.red}`,
    },
    missed: {
      borderLeft: `4px solid ${theme.palette.yellow}`,
    },
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

interface EventReviewerProps {
  video: IVideo;
  onReview: (videoId: string, eventId: string, status: 'correct' | 'false_positive' | 'missed', comment?: string) => void;
}

export const EventReviewer: React.FC<EventReviewerProps> = ({ video, onReview }) => {
  const styles = useStyles();
  const [selectedEvent, setSelectedEvent] = useState<IDetectionEvent | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'correct' | 'false_positive' | 'missed'>('correct');
  const [comment, setComment] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const statusOptions: IChoiceGroupOption[] = [
    { key: 'correct', text: 'Correct Detection' },
    { key: 'false_positive', text: 'False Positive' },
    { key: 'missed', text: 'Missed Event' },
  ];
  
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
  
  const getEventCardClass = (event: IDetectionEvent) => {
    let className = styles.eventCard;
    
    if (event.reviewed) {
      className += ` ${styles.reviewed}`;
      
      if (event.status === 'correct') {
        className += ` ${styles.correct}`;
      } else if (event.status === 'false_positive') {
        className += ` ${styles.falsePositive}`;
      } else if (event.status === 'missed') {
        className += ` ${styles.missed}`;
      }
    }
    
    return className;
  };
  
  const handleReviewClick = (event: IDetectionEvent) => {
    setSelectedEvent(event);
    
    // Pre-fill form if already reviewed
    if (event.reviewed && event.status) {
      setReviewStatus(event.status);
      setComment(event.comment || '');
    } else {
      // Default values for new review
      setReviewStatus('correct');
      setComment('');
    }
    
    setIsDialogOpen(true);
  };
  
  const handleSubmitReview = () => {
    if (selectedEvent) {
      onReview(selectedEvent.videoId, selectedEvent.id, reviewStatus, comment);
      setIsDialogOpen(false);
    }
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  
  const dialogContentProps: IDialogContentProps = {
    type: DialogType.normal,
    title: 'Review Detection Event',
    closeButtonAriaLabel: 'Close',
    subText: selectedEvent ? `Reviewing ${getEventTypeLabel(selectedEvent.eventType)} at ${formatTime(selectedEvent.timestamp)}` : '',
  };

  return (
    <Stack className={styles.container}>
      <Text className={styles.title}>Review Detection Events</Text>
      
      {(!video.events || video.events.length === 0) ? (
        <Text>No events to review in this video.</Text>
      ) : (
        <>
          <Text>Select an event to review its accuracy and provide feedback:</Text>
          
          {video.events.map((event) => (
            <div key={event.id} className={getEventCardClass(event)}>
              <Stack>
                <Stack horizontal horizontalAlign="space-between">
                  <Text>
                    {getEventTypeLabel(event.eventType)} 
                    {event.reviewed && ` (${event.status === 'correct' ? 'Confirmed ✓' : 
                                         event.status === 'false_positive' ? 'False Positive ✗' : 
                                         'Missed Event !'})` }
                  </Text>
                  <Text className={styles.timestamp}>
                    Time: {formatTime(event.timestamp)}
                  </Text>
                </Stack>
                
                <Text className={`${styles.confidence} ${getConfidenceClass(event.confidence)}`}>
                  Confidence: {(event.confidence * 100).toFixed(1)}%
                </Text>
                
                {event.comment && (
                  <Text>Comment: {event.comment}</Text>
                )}
                
                <Stack horizontal horizontalAlign="end" className={styles.buttonRow}>
                  <DefaultButton
                    text={event.reviewed ? "Update Review" : "Review Event"}
                    onClick={() => handleReviewClick(event)}
                  />
                </Stack>
              </Stack>
            </div>
          ))}
          
          <Dialog
            hidden={!isDialogOpen}
            onDismiss={closeDialog}
            dialogContentProps={dialogContentProps}
            minWidth={500}
          >
            <ChoiceGroup
              className={styles.choiceGroup}
              options={statusOptions}
              selectedKey={reviewStatus}
              onChange={(_, option) => setReviewStatus(option?.key as 'correct' | 'false_positive' | 'missed')}
              label="Classification status:"
              required
            />
            
            <TextField
              label="Comments (optional):"
              multiline
              rows={3}
              value={comment}
              onChange={(_, newValue) => setComment(newValue || '')}
              placeholder="Add any additional information about this detection event..."
            />
            
            <DialogFooter>
              <PrimaryButton onClick={handleSubmitReview} text="Submit Review" />
              <DefaultButton onClick={closeDialog} text="Cancel" />
            </DialogFooter>
          </Dialog>
        </>
      )}
    </Stack>
  );
};

export default EventReviewer;