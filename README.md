# SafetyGuard AI: Multi-Detector System

A comprehensive video analysis system for detecting safety incidents including falls, fire/smoke, and physical violence. This system processes pre-recorded video footage to identify potentially dangerous situations in care environments.

## Overview

SafetyGuard AI is designed to assist caregivers and safety personnel by automatically detecting critical incidents in video footage. The system uses state-of-the-art deep learning models to identify various safety concerns and provides a user-friendly web interface for reviewing and validating detection results.

### Detection Capabilities

- **Falls**: Forward, backward, and sideways falls
- **Medical Emergencies**: Choking or loss of consciousness
- **Inactivity**: Extended periods without movement (30+ minutes)
- **Physical Violence**: Aggression or abuse by caregivers
- **Mobility Issues**: Unstable or abnormal walking patterns
- **Wandering**: Movement during nighttime hours
- **Fire/Smoke**: Detection of fire or smoke in the environment
- **Boundary Violations**: Approaches to exit doors or danger zones
- **Unauthorized Access**: Presence of unidentified individuals
- **Supervision Gaps**: Caregiver absence during required hours

## Technology Stack

### Backend

- **Framework**: Flask/FastAPI
- **Models**:
  - Fall Detection: YOLOv8 or Pose-based methods
  - Fire/Smoke Detection: YOLO or FireNet
  - Violence Detection: 3D CNN / SlowFast networks
- **Database**: SQLite (for storing detection results and feedback)

### Frontend

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Data Storage**: JSON/CSV/SQLite

## Datasets Used

The system utilizes publicly available datasets for training and fine-tuning detection models:

- **Fall Detection**:
  - [UR Fall Detection Dataset](http://fenix.univ.rzeszow.pl/~mkepski/ds/uf.html)
  - [SisFall Dataset](http://sistemic.udea.edu.co/en/investigacion/proyectos/english-falls/)
- **Violence Detection**:
  - [RWF-2000](https://github.com/mchengny/RWF2000-Video-Database-for-Violence-Detection)
  - [UCF-Crime](https://www.crcv.ucf.edu/projects/real-world/)
- **Fire and Smoke Detection**:
  - [FireNet](https://github.com/arpit-jadon/FireNet-LightWeight-Network-for-Fire-Detection)
  - [VisiFire](https://github.com/milesial/PyTorch-VisiFire)

## System Architecture

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│  Video Upload &   │────▶│  AI Processing    │────▶│  Results Display  │
│  Management       │     │  Pipeline         │     │  & Feedback       │
│                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

### Processing Pipeline

1. **Video Upload**: Users upload pre-recorded video through the web interface
2. **Pre-processing**: Videos are segmented and prepared for analysis
3. **Multi-Model Detection**:
   - Fall detection model processes each frame/segment
   - Fire/smoke detection model analyzes environment
   - Violence detection model evaluates human interactions
4. **Results Aggregation**: Detections are timestamped and confidence scores calculated
5. **Manual Review**: Users can view, validate, and provide feedback on detections
6. **Feedback Storage**: User corrections stored for future model improvements

## Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- CUDA-compatible GPU (recommended for faster processing)

### Backend Setup

````bash
# Clone repository
git clone https://github.com/GoldenTiger720/SafetyGuard-AI-frontend.git
cd safetyguard-ai/frontend

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
````

## Usage Guide

1. **Access the Web Interface**: Open your browser and navigate to `http://localhost:3000`

2. **Upload Video**:

   - Click "Upload Video" button
   - Select video file from your computer
   - Add optional metadata (location, date, context)

3. **Process Video**:

   - Click "Analyze Video" to start the detection process
   - Processing time depends on video length and system capabilities

4. **Review Results**:

   - View detection timeline with marked incidents
   - Click on incidents to view the corresponding video segment
   - See confidence scores for each detection

5. **Provide Feedback**:
   - For each detection, mark as:
     - Correct detection
     - False positive
     - Add comments for future reference
   - Identify missed incidents by manually adding markers

## API Documentation

The backend exposes the following API endpoints:

### Video Management

- `POST /api/videos/upload` - Upload a new video
- `GET /api/videos` - List all uploaded videos
- `GET /api/videos/{id}` - Get specific video details

### Detection

- `POST /api/videos/{id}/analyze` - Run detection on a video
- `GET /api/videos/{id}/detections` - Get all detections for a video

### Feedback

- `POST /api/detections/{id}/feedback` - Submit feedback for a detection
- `GET /api/feedback/stats` - Get feedback statistics

## Model Details

### Fall Detection

The system uses [YOLOv8](https://github.com/ultralytics/ultralytics) with additional pose estimation to detect falls. The model identifies human subjects and analyzes the velocity and position changes to determine if a fall has occurred.

### Fire/Smoke Detection

Fire and smoke detection utilizes a specialized [FireNet](https://github.com/arpit-jadon/FireNet-LightWeight-Network-for-Fire-Detection) model that can identify flames and smoke patterns even in challenging lighting conditions.

### Violence Detection

Physical violence is detected using a 3D CNN architecture (SlowFast networks) that can understand temporal features in the video to identify aggressive actions and movements.

## Contributing

We welcome contributions to improve the detection accuracy and expand the system's capabilities:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The developers of the public datasets used in training the models
- The open-source computer vision and deep learning communities
- All contributors who have helped improve this system

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com)
