import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  Text, 
  DefaultButton, 
  DetailsList, 
  SelectionMode, 
  IColumn, 
  DetailsListLayoutMode,
  Spinner,
  SpinnerSize,
  makeStyles,
  ComboBox,
  IComboBoxOption,
  TextField,
  ProgressIndicator
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

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

// Mock API functions (temporary until you create the real API)
const getVideos = async () => {
  // Mocking API response with sample data
  return [
    {
      id: '1',
      filename: 'sample-video.mp4',
      uploadDate: '2025-05-01',
      duration: 120,
      analyzed: true,
      events: [
        {
          id: 'event1',
          videoId: '1',
          timestamp: 45,
          eventType: 'fall',
          confidence: 0.92,
          reviewed: false
        }
      ]
    }
  ];
};

const analyzeVideo = async (videoId: string) => {
  // Mock function that would normally send analysis request to backend
  console.log(`Analyzing video with ID: ${videoId}`);
  
  // Return mock analyzed video
  return {
    id: videoId,
    filename: 'sample-video.mp4',
    uploadDate: '2025-05-01',
    duration: 120,
    analyzed: true,
    events: [
      {
        id: 'event1',
        videoId: videoId,
        timestamp: 45,
        eventType: 'fall',
        confidence: 0.92,
        reviewed: false
      }
    ]
  };
};

// Create styles using makeStyles
const useStyles = makeStyles((theme) => {
  return {
    root: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '20px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 600,
      color: theme.palette.themePrimary,
    },
    section: {
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: theme.palette.white,
      borderRadius: '4px',
      boxShadow: theme.effects.elevation4,
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '12px',
    },
    videosList: {
      marginTop: '16px',
    },
    filterSection: {
      marginBottom: '16px',
    },
    uploadSection: {
      marginBottom: '16px',
      padding: '16px',
      backgroundColor: theme.palette.neutralLighter,
      borderRadius: '4px',
    },
    analyzeButton: {
      marginTop: '10px',
    },
    processingIndicator: {
      marginTop: '10px',
    }
  };
});

// Simplified component versions
const VideoUploader = ({ onUploadSuccess }) => (
  <Stack>
    <Text>Upload your video:</Text>
    <DefaultButton 
      text="Select File" 
      onClick={() => console.log('Upload clicked')}
    />
    <Text>This is a placeholder - implement file upload here</Text>
  </Stack>
);

const DetectionResults = ({ video }) => (
  <Stack>
    <Text>Detection Results (Placeholder)</Text>
    <Text>Events detected: {video.events?.length || 0}</Text>
  </Stack>
);

const EventReviewer = ({ video, onReview }) => (
  <Stack>
    <Text>Event Review (Placeholder)</Text>
    <DefaultButton 
      text="Mark as Correct" 
      onClick={() => onReview(video.id, video.events?.[0]?.id, 'correct')}
    />
  </Stack>
);

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [isLoading, { setTrue: startLoading, setFalse: stopLoading }] = useBoolean(false);
  const [isAnalyzing, { setTrue: startAnalyzing, setFalse: stopAnalyzing }] = useBoolean(false);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  
  const eventTypeOptions: IComboBoxOption[] = [
    { key: 'all', text: 'All Events' },
    { key: 'fall', text: 'Falls' },
    { key: 'fire', text: 'Fire' },
    { key: 'smoke', text: 'Smoke' },
    { key: 'violence', text: 'Violence' },
    { key: 'inactivity', text: 'Extended Inactivity' },
  ];
  
  const columns: IColumn[] = [
    { 
      key: 'filename', 
      name: 'Filename', 
      fieldName: 'filename', 
      minWidth: 150, 
      isResizable: true 
    },
    { 
      key: 'uploadDate', 
      name: 'Upload Date', 
      fieldName: 'uploadDate', 
      minWidth: 100, 
      isResizable: true,
      onRender: (item: IVideo) => {
        return <span>{new Date(item.uploadDate).toLocaleDateString()}</span>;
      }
    },
    { 
      key: 'duration', 
      name: 'Duration', 
      fieldName: 'duration', 
      minWidth: 80, 
      isResizable: true,
      onRender: (item: IVideo) => {
        const minutes = Math.floor(item.duration / 60);
        const seconds = Math.floor(item.duration % 60);
        return <span>{`${minutes}:${seconds.toString().padStart(2, '0')}`}</span>;
      }
    },
    { 
      key: 'analyzed', 
      name: 'Status', 
      fieldName: 'analyzed', 
      minWidth: 100, 
      isResizable: true,
      onRender: (item: IVideo) => {
        if (item.processing) {
          return <span>Processing...</span>;
        }
        return item.analyzed ? 
          <span>Analyzed</span> : 
          <span>Not Analyzed</span>;
      }
    },
    { 
      key: 'events', 
      name: 'Events Detected', 
      minWidth: 120, 
      isResizable: true,
      onRender: (item: IVideo) => {
        return <span>{item.events?.length || 0}</span>;
      }
    },
    {
      key: 'actions',
      name: 'Actions',
      minWidth: 120,
      onRender: (item: IVideo) => {
        return (
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton 
              text="View" 
              onClick={() => handleSelectVideo(item)}
              disabled={!item.analyzed || item.processing}
            />
            {!item.analyzed && !item.processing && (
              <DefaultButton 
                text="Analyze" 
                onClick={() => handleAnalyzeVideo(item)}
              />
            )}
          </Stack>
        );
      }
    }
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    startLoading();
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      stopLoading();
    }
  };

  const handleSelectVideo = (video: IVideo) => {
    setSelectedVideo(video);
  };

  const handleAnalyzeVideo = async (video: IVideo) => {
    // Update video to show processing state
    setVideos(prevVideos => 
      prevVideos.map(v => v.id === video.id ? { ...v, processing: true } : v)
    );
    
    try {
      startAnalyzing();
      const analyzedVideo = await analyzeVideo(video.id);
      
      // Update the videos list with the analyzed video
      setVideos(prevVideos => 
        prevVideos.map(v => v.id === analyzedVideo.id ? analyzedVideo : v)
      );
      
      // If this was the selected video, update it
      if (selectedVideo && selectedVideo.id === analyzedVideo.id) {
        setSelectedVideo(analyzedVideo);
      }
    } catch (error) {
      console.error('Error analyzing video:', error);
      // Reset processing state on error
      setVideos(prevVideos => 
        prevVideos.map(v => v.id === video.id ? { ...v, processing: false } : v)
      );
    } finally {
      stopAnalyzing();
    }
  };

  const handleVideoUploadSuccess = (newVideo: IVideo) => {
    setVideos(prevVideos => [...prevVideos, newVideo]);
  };

  const handleEventReview = (videoId: string, eventId: string, status: 'correct' | 'false_positive' | 'missed', comment?: string) => {
    // Update the event in the videos list
    setVideos(prevVideos => 
      prevVideos.map(video => {
        if (video.id === videoId && video.events) {
          return {
            ...video,
            events: video.events.map(event => 
              event.id === eventId 
                ? { ...event, reviewed: true, status, comment } 
                : event
            )
          };
        }
        return video;
      })
    );
    
    // Update the selected video if it's the one being reviewed
    if (selectedVideo && selectedVideo.id === videoId) {
      setSelectedVideo({
        ...selectedVideo,
        events: selectedVideo.events?.map(event => 
          event.id === eventId 
            ? { ...event, reviewed: true, status, comment } 
            : event
        )
      });
    }
  };

  const closeDetailView = () => {
    setSelectedVideo(null);
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Text className={styles.title}>AI Detection System Dashboard</Text>
        <Text>Analyze videos for falls, fire/smoke, and physical violence</Text>
      </div>
      
      {selectedVideo ? (
        <div className={styles.section}>
          <Stack horizontal horizontalAlign="space-between">
            <Text className={styles.sectionTitle}>Detection Results: {selectedVideo.filename}</Text>
            <DefaultButton text="Back to List" onClick={closeDetailView} />
          </Stack>
          
          <DetectionResults video={selectedVideo} />
          
          <EventReviewer 
            video={selectedVideo} 
            onReview={handleEventReview} 
          />
        </div>
      ) : (
        <>
          <div className={styles.uploadSection}>
            <Text className={styles.sectionTitle}>Upload New Video</Text>
            <VideoUploader onUploadSuccess={handleVideoUploadSuccess} />
          </div>
          
          <div className={styles.section}>
            <Text className={styles.sectionTitle}>Video Library</Text>
            
            <div className={styles.filterSection}>
              <Stack horizontal tokens={{ childrenGap: 16 }}>
                <Stack.Item grow={1}>
                  <ComboBox
                    label="Filter by event type:"
                    options={eventTypeOptions}
                    selectedKey={filterType}
                    onChange={(_, option) => setFilterType(option?.key as string)}
                    placeholder="Select event type"
                  />
                </Stack.Item>
                <Stack.Item grow={2}>
                  <TextField label="Search by filename:" />
                </Stack.Item>
              </Stack>
            </div>
            
            {isLoading ? (
              <Spinner size={SpinnerSize.large} label="Loading videos..." />
            ) : (
              <div className={styles.videosList}>
                <DetailsList
                  items={videos}
                  columns={columns}
                  selectionMode={SelectionMode.none}
                  layoutMode={DetailsListLayoutMode.justified}
                  isHeaderVisible={true}
                />
                
                {videos.length === 0 && (
                  <Text>No videos found. Upload a video to get started.</Text>
                )}
              </div>
            )}
            
            {isAnalyzing && (
              <div className={styles.processingIndicator}>
                <ProgressIndicator label="Analyzing video..." description="This may take a few minutes depending on the video size and complexity." />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;