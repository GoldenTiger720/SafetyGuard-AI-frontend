// This file contains mock API functions until your backend is ready

/**
 * Get list of videos from the backend
 */
export const getVideos = async () => {
    // For now, return mock data
    // In a real app, you would use axios or fetch to call your API
    // e.g., return axios.get('/api/videos');
    
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve([
          {
            id: '1',
            filename: 'sample-video-1.mp4',
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
          },
          {
            id: '2',
            filename: 'sample-video-2.mp4',
            uploadDate: '2025-05-02',
            duration: 180,
            analyzed: false
          }
        ]);
      }, 1000);
    });
  };
  
  /**
   * Send a video for analysis
   * @param {string} videoId - The ID of the video to analyze
   */
  export const analyzeVideo = async (videoId) => {
    // In a real app, you would use axios or fetch
    // e.g., return axios.post(`/api/videos/${videoId}/analyze`);
    
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Return the analyzed video
        resolve({
          id: videoId,
          filename: `sample-video-${videoId}.mp4`,
          uploadDate: '2025-05-02',
          duration: 180,
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
        });
      }, 3000);
    });
  };
  
  /**
   * Upload a new video
   * @param {File} file - The video file to upload
   */
  export const uploadVideo = async (file) => {
    // In a real app, you would use FormData with axios or fetch
    // const formData = new FormData();
    // formData.append('video', file);
    // return axios.post('/api/videos', formData);
    
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Generate random ID
        const videoId = Math.floor(Math.random() * 10000).toString();
        
        // Return new video object
        resolve({
          id: videoId,
          filename: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          duration: 240, // Mock duration
          analyzed: false
        });
      }, 2000);
    });
  };