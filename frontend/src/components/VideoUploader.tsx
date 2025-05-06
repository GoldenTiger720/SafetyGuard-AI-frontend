import React, { useState } from 'react';
import { 
  Stack, 
  Text, 
  DefaultButton, 
  ProgressIndicator,
  Label,
  makeStyles
} from '@fluentui/react';
import { uploadVideo } from '../utils/api';

const useStyles = makeStyles((theme) => {
  return {
    container: {
      padding: '16px',
      borderRadius: '4px',
      border: `1px solid ${theme.palette.neutralLight}`,
    },
    fileInput: {
      display: 'none',
    },
    dropZone: {
      padding: '20px',
      borderRadius: '4px',
      border: `2px dashed ${theme.palette.neutralTertiary}`,
      backgroundColor: theme.palette.neutralLighter,
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '16px',
      '&:hover': {
        borderColor: theme.palette.themePrimary,
        backgroundColor: theme.palette.neutralLight,
      },
    },
    fileName: {
      marginTop: '16px',
      fontWeight: 600,
    },
    uploadButton: {
      marginTop: '16px',
    },
    progressContainer: {
      marginTop: '16px',
    },
  };
});

interface VideoUploaderProps {
  onUploadSuccess: (video: any) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onUploadSuccess }) => {
  const styles = useStyles();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
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
      
      // Reset state
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

  return (
    <Stack className={styles.container}>
      <input
        type="file"
        ref={fileInputRef}
        className={styles.fileInput}
        onChange={handleFileSelect}
        accept="video/*"
      />
      
      <div 
        className={styles.dropZone}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Text>Drag and drop a video file here, or click to browse</Text>
        <Text>Supported formats: MP4, AVI, MOV, etc.</Text>
      </div>
      
      {selectedFile && (
        <>
          <Stack>
            <Label>Selected file:</Label>
            <Text className={styles.fileName}>{selectedFile.name}</Text>
          </Stack>
          
          {!isUploading && (
            <DefaultButton
              className={styles.uploadButton}
              text="Upload Video"
              onClick={handleUploadClick}
            />
          )}
          
          {isUploading && (
            <div className={styles.progressContainer}>
              <ProgressIndicator 
                label="Uploading video..." 
                description={`${uploadProgress}% complete`}
                percentComplete={uploadProgress / 100} 
              />
            </div>
          )}
        </>
      )}
    </Stack>
  );
};

export default VideoUploader;