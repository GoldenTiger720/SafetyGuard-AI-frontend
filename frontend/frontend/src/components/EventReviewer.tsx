import React, { useState } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

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

interface ReviewOption {
  value: 'correct' | 'false_positive' | 'missed';
  label: string;
  description: string;
  icon: React.ReactNode;
}

const reviewOptions: ReviewOption[] = [
  {
    value: 'correct',
    label: 'Correct Detection',
    description: 'The AI correctly identified this event',
    icon: <CheckIcon className="h-5 w-5 text-green-500" />
  },
  {
    value: 'false_positive',
    label: 'False Positive',
    description: 'The AI incorrectly identified this as an event',
    icon: <XMarkIcon className="h-5 w-5 text-red-500" />
  },
  {
    value: 'missed',
    label: 'Missed Event',
    description: 'The AI missed part of the event or details',
    icon: <NoSymbolIcon className="h-5 w-5 text-yellow-500" />
  }
];

const EventReviewer: React.FC<EventReviewerProps> = ({ video, onReview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IDetectionEvent | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'correct' | 'false_positive' | 'missed'>('correct');
  const [comment, setComment] = useState('');
  
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

  const getEventStatusLabel = (status?: string) => {
    if (!status) return 'Not Reviewed';
    
    switch (status) {
      case 'correct': return 'Confirmed ✓';
      case 'false_positive': return 'False Positive ✗';
      case 'missed': return 'Missed Event !';
      default: return status;
    }
  };

  const handleOpenReview = (event: IDetectionEvent) => {
    setSelectedEvent(event);
    
    // Pre-fill form if already reviewed
    if (event.reviewed && event.status) {
      setSelectedStatus(event.status);
      setComment(event.comment || '');
    } else {
      // Default values for new review
      setSelectedStatus('correct');
      setComment('');
    }
    
    setIsOpen(true);
  };

  const handleSubmitReview = () => {
    if (selectedEvent) {
      onReview(selectedEvent.videoId, selectedEvent.id, selectedStatus, comment);
      setIsOpen(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Review Detection Events</h3>
      
      {(!video.events || video.events.length === 0) ? (
        <div className="bg-white p-4 border border-gray-200 rounded-md">
          <p className="text-gray-500">No events to review in this video.</p>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm text-gray-600">
            Select an event to review its accuracy and provide feedback:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {video.events.map(event => (
              <div 
                key={event.id}
                className={`bg-white border rounded-md shadow-sm overflow-hidden ${
                  event.reviewed 
                    ? event.status === 'correct' 
                      ? 'border-green-200 bg-green-50' 
                      : event.status === 'false_positive' 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-yellow-200 bg-yellow-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900">
                      {getEventTypeLabel(event.eventType)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    event.reviewed 
                      ? event.status === 'correct' 
                        ? 'bg-green-100 text-green-800' 
                        : event.status === 'false_positive' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getEventStatusLabel(event.status)}
                  </span>
                </div>
                
                <div className="p-4">
                  {event.reviewed && event.comment && (
                    <p className="text-sm text-gray-600 italic mb-4">
                      "{event.comment}"
                    </p>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleOpenReview(event)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PencilIcon className="mr-1.5 h-4 w-4 text-gray-500" />
                      {event.reviewed ? 'Update Review' : 'Review Event'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Review Detection Event
                  </Dialog.Title>
                  
                  {selectedEvent && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {getEventTypeLabel(selectedEvent.eventType)} at {formatTime(selectedEvent.timestamp)}
                      </p>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Classification status:
                        </label>
                        
                        <RadioGroup value={selectedStatus} onChange={setSelectedStatus}>
                          <div className="space-y-2">
                            {reviewOptions.map((option) => (
                              <RadioGroup.Option
                                key={option.value}
                                value={option.value}
                                className={({ active, checked }) =>
                                  `${
                                    active
                                      ? 'ring-2 ring-offset-2 ring-indigo-500'
                                      : ''
                                  }
                                  ${
                                    checked 
                                      ? option.value === 'correct'
                                        ? 'bg-green-50 border-green-200'
                                        : option.value === 'false_positive'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-yellow-50 border-yellow-200'
                                      : 'bg-white border-gray-200'
                                  }
                                    relative flex cursor-pointer rounded-lg px-5 py-4 border focus:outline-none`
                                }
                              >
                                {({ active, checked }) => (
                                  <>
                                    <div className="flex w-full items-center justify-between">
                                      <div className="flex items-center">
                                        <div className="text-sm">
                                          <RadioGroup.Label
                                            as="p"
                                            className={`font-medium ${
                                              checked ? 'text-gray-900' : 'text-gray-900'
                                            }`}
                                          >
                                            {option.label}
                                          </RadioGroup.Label>
                                          <RadioGroup.Description
                                            as="span"
                                            className={`inline ${
                                              checked ? 'text-gray-700' : 'text-gray-500'
                                            }`}
                                          >
                                            <span>{option.description}</span>
                                          </RadioGroup.Description>
                                        </div>
                                      </div>
                                      <div className="shrink-0 text-white">
                                        {option.icon}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </RadioGroup.Option>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="mt-4">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                          Comments (optional):
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="comment"
                            name="comment"
                            rows={3}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Add any additional information about this detection event..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={handleSubmitReview}
                    >
                      Submit Review
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EventReviewer;