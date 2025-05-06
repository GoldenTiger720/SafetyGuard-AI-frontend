import React, { useState, useRef } from 'react';
import { ArrowUpTrayIcon, XMarkIcon, CheckIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { uploadVideo } from '../utils/api';

interface VideoUploaderProps {
  onUploadSuccess: (video: any) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };
  
  const handleUploadClick = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      // In a real app, you would handle file upload with progress
      const uploadedVideo = await uploadVideo(selectedFile);
      
      // Complete progress
      setUploadProgress(100);
      
      // Notify parent
      onUploadSuccess(uploadedVideo);
      
      // Reset state after a short delay
      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsUploading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        accept="video/*"
      />
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-indigo-600 hover:text-indigo-500">
              Upload a file
            </span> or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            MP4, AVI, MOV, MKV, WMV (max 500MB)
          </p>
        </div>
      </div>
      
      {selectedFile && (
        <div className="bg-gray-50 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <DocumentIcon className="h-8 w-8 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <button 
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {isUploading ? (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">Uploading...</span>
                <span className="text-gray-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <button
                onClick={handleUploadClick}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                Upload Video
              </button>
            </div>
          )}
        </div>
      )}
      
      {uploadProgress === 100 && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Upload successful!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;