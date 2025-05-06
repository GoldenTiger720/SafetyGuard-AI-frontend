import axios from 'axios';

// Define API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface definitions
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

interface IVideo {
  id: string;
  filename: string;
  uploadDate: string;
  duration: number;
  analyzed: boolean;
  processing?: boolean;
  events?: IDetectionEvent[];
}

// Mock data for development
const mockVideos: IVideo[] = [
  {
    id: '1',
    filename: 'sample-video-1.mp4',
    uploadDate: '2025-05-01T10:30:00Z',
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
  },
  {
    id: '2',
    filename: 'sample-video-2.mp4',
    uploadDate: '2025-05-02T14:15:00Z',
    duration: 180,
    analyzed: false
  }
];

// API Functions

/**
 * Get list of videos
 */
export const getVideos = async (): Promise<IVideo[]> => {
  // For development/demo, return mock data
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockVideos), 500);
    });
  }
  
  // Real API call
  const response = await api.get('/videos');
  return response.data;
};

/**
 * Get a single video by ID
 */
export const getVideoById = async (id: string): Promise<IVideo> => {
  // For development/demo, return mock data
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const video = mockVideos.find(v => v.id === id);
        if (video) {
          resolve(video);
        } else {
          reject(new Error('Video not found'));
        }
      }, 500);
    });
  }
  
  // Real API call
  const response = await api.get(`/videos/${id}`);
  return response.data;
};

/**
 * Upload a new video
 */
export const uploadVideo = async (file: File): Promise<IVideo> => {
  // For development/demo, return mock data
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVideo: IVideo = {
          id: Math.random().toString(36).substring(7),
          filename: file.name,
          uploadDate: new Date().toISOString(),
          duration: 240, // Mock duration
          analyzed: false
        };
        mockVideos.push(newVideo);
        resolve(newVideo);
      }, 2000);
    });
  }
  
  // Real API call with FormData
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Send a video for analysis
 */
export const analyzeVideo = async (videoId: string): Promise<IVideo> => {
  // For development/demo, return mock data
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const videoIndex = mockVideos.findIndex(v => v.id === videoId);
        if (videoIndex >= 0) {
          const analyzedVideo: IVideo = {
            ...mockVideos[videoIndex],
            analyzed: true,
            events: [
              {
                id: `event-${videoId}-1`,
                videoId: videoId,
                timestamp: 45,
                eventType: 'fall',
                confidence: 0.92,
                reviewed: false
              },
              {
                id: `event-${videoId}-2`,
                videoId: videoId,
                timestamp: 120,
                eventType: 'fire',
                confidence: 0.85,
                reviewed: false
              }
            ]
          };
          mockVideos[videoIndex] = analyzedVideo;
          resolve(analyzedVideo);
        }
      }, 3000);
    });
  }
  
  // Real API call
  const response = await api.post(`/videos/${videoId}/analyze`);
  return response.data;
};

/**
 * Submit a review for a detection event
 */
export const submitEventReview = async (
  videoId: string,
  eventId: string,
  status: 'correct' | 'false_positive' | 'missed',
  comment?: string
): Promise<any> => {
  // For development/demo, update mock data
  if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const videoIndex = mockVideos.findIndex(v => v.id === videoId);
        if (videoIndex >= 0 && mockVideos[videoIndex].events) {
          const eventIndex = mockVideos[videoIndex].events!.findIndex(e => e.id === eventId);
          if (eventIndex >= 0) {
            mockVideos[videoIndex].events![eventIndex] = {
              ...mockVideos[videoIndex].events![eventIndex],
              reviewed: true,
              status,
              comment
            };
          }
        }
        resolve({ success: true });
      }, 500);
    });
  }
  
  // Real API call
  const response = await api.post(`/events/${eventId}/review`, {
    status,
    comment
  });
  
  return response.data;
};

export default {
  getVideos,
  getVideoById,
  uploadVideo,
  analyzeVideo,
  submitEventReview
};