import React, { useState, useEffect } from 'react';
import { Dialog, Transition, Menu, Listbox } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  ChevronDownIcon, 
  EyeIcon, 
  PlayIcon, 
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import VideoUploader from './VideoUploader';
import DetectionResults from './DetectionResults';
import EventReviewer from './EventReviewer';
import { getVideos, analyzeVideo } from '../utils/api.ts';

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

interface EventTypeOption {
  id: string;
  name: string;
}

const eventTypes: EventTypeOption[] = [
  { id: 'all', name: 'All Events' },
  { id: 'fall', name: 'Falls' },
  { id: 'fire', name: 'Fire' },
  { id: 'smoke', name: 'Smoke' },
  { id: 'violence', name: 'Violence' },
  { id: 'inactivity', name: 'Extended Inactivity' },
]

const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(eventTypes[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
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
      setIsAnalyzing(true);
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
      setIsAnalyzing(false);
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filter videos based on search query
  const filteredVideos = videos.filter(video => 
    video.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Detection System Dashboard</h1>
        <p className="text-gray-600">Analyze videos for falls, fire/smoke, and physical violence</p>
      </div>
      
      {selectedVideo ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Detection Results: {selectedVideo.filename}</h2>
            <button
              onClick={closeDetailView}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to List
            </button>
          </div>
          
          <DetectionResults video={selectedVideo} />
          
          <EventReviewer 
            video={selectedVideo} 
            onReview={handleEventReview} 
          />
        </div>
      ) : (
        <>
          <div className="bg-gray-50 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Video</h2>
            <VideoUploader onUploadSuccess={handleVideoUploadSuccess} />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Library</h2>
            
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Listbox value={selectedEventType} onChange={setSelectedEventType}>
                  <div className="relative mt-1">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Filter by event type:</Listbox.Label>
                    <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <span className="block truncate">{selectedEventType.name}</span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {eventTypes.map((type) => (
                          <Listbox.Option
                            key={type.id}
                            className={({ active }) =>
                              `${active ? 'text-white bg-indigo-600' : 'text-gray-900'}
                                cursor-default select-none relative py-2 pl-10 pr-4`
                            }
                            value={type}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`${
                                    selected ? 'font-medium' : 'font-normal'
                                  } block truncate`}
                                >
                                  {type.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`${
                                      active ? 'text-white' : 'text-indigo-600'
                                    } absolute inset-y-0 left-0 flex items-center pl-3`}
                                  >
                                    <CheckIcon className="w-5 h-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by filename:
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <ArrowPathIcon className="animate-spin h-10 w-10 text-gray-500" />
                <span className="ml-4 text-gray-700 font-medium">Loading videos...</span>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Filename
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Upload Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Events Detected
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVideos.length > 0 ? (
                              filteredVideos.map((video) => (
                                <tr key={video.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{video.filename}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{new Date(video.uploadDate).toLocaleDateString()}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{formatDuration(video.duration)}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {video.processing ? (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Processing...
                                      </span>
                                    ) : video.analyzed ? (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Analyzed
                                      </span>
                                    ) : (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        Not Analyzed
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {video.events?.length || 0}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleSelectVideo(video)}
                                        disabled={!video.analyzed || video.processing}
                                        className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 ${
                                          !video.analyzed || video.processing 
                                            ? 'bg-gray-50 cursor-not-allowed' 
                                            : 'bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                        }`}
                                      >
                                        <EyeIcon className="mr-1 h-4 w-4" aria-hidden="true" />
                                        View
                                      </button>
                                      
                                      {!video.analyzed && !video.processing && (
                                        <button
                                          onClick={() => handleAnalyzeVideo(video)}
                                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                          <PlayIcon className="mr-1 h-4 w-4" aria-hidden="true" />
                                          Analyze
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                  No videos found. Upload a video to get started.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="mt-6">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <div className="flex items-center">
                    <ArrowPathIcon className="animate-spin h-5 w-5 text-indigo-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Analyzing video...</h4>
                      <p className="text-xs text-gray-500">This may take a few minutes depending on the video size and complexity.</p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;