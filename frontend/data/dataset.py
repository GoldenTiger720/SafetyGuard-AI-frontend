import os
import numpy as np
import cv2
from tqdm import tqdm

# Create directories
output_path = "sample_data"
for event_type in ["fall", "fire", "smoke", "violence", "normal"]:
    os.makedirs(os.path.join(output_path, event_type), exist_ok=True)

# Number of sample videos to generate for each category
num_samples = 5  # Start with a small number for testing

# Video parameters
width, height = 640, 480
fps = 30
duration = 3  # seconds (short duration for testing)

print("Generating sample data for testing...")

# Generate sample videos
for event_type in ["fall", "fire", "smoke", "violence", "normal"]:
    print(f"Creating {event_type} samples...")
    for i in range(num_samples):
        # Create a synthetic video
        output_file = os.path.join(output_path, event_type, f"sample_{i:03d}.mp4")
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_file, fourcc, fps, (width, height))
        
        # Generate frames
        for frame_idx in range(fps * duration):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            
            # Add content based on event type
            if event_type == "normal":
                # Just a gradient background
                for y in range(height):
                    for x in range(width):
                        frame[y, x] = [x % 256, y % 256, (x + y) % 256]
            
            elif event_type == "fall":
                # Create a simple falling stick figure
                frame.fill(100)  # Gray background
                
                # Animation progress (0 to 1)
                progress = frame_idx / (fps * duration)
                
                # Draw a stick figure in different positions based on progress
                if progress < 0.7:  # Standing
                    angle = 0
                else:  # Falling
                    angle = min(90, (progress - 0.7) * 300)  # Gradually increase angle to 90 degrees
                
                # Center point
                center_x, center_y = width // 2, height // 2
                
                # Calculate rotated coordinates
                rad_angle = np.radians(angle)
                body_x = int(center_x + 100 * np.sin(rad_angle))
                body_y = int(center_y + 100 * np.cos(rad_angle))
                
                # Draw body
                cv2.line(frame, (center_x, center_y), (body_x, body_y), (255, 255, 255), 5)
                
                # Draw head
                cv2.circle(frame, (center_x, center_y), 20, (255, 255, 255), -1)
            
            elif event_type == "fire":
                # Create a simple fire animation
                frame.fill(50)  # Dark background
                
                # Generate fire-like pattern
                for j in range(50):
                    # Random fire position
                    fire_x = width // 2 + np.random.randint(-100, 100)
                    fire_y = height // 2 + np.random.randint(-50, 50)
                    
                    # Random fire color (red/orange/yellow)
                    b = np.random.randint(0, 50)
                    g = np.random.randint(50, 150)
                    r = np.random.randint(200, 255)
                    
                    # Draw fire blob
                    cv2.circle(frame, (fire_x, fire_y), np.random.randint(5, 30), (b, g, r), -1)
            
            elif event_type == "smoke":
                # Create a simple smoke animation
                frame.fill(50)  # Dark background
                
                # Generate smoke-like pattern
                for j in range(30):
                    # Random smoke position
                    smoke_x = width // 2 + np.random.randint(-100, 100)
                    smoke_y = height // 2 + np.random.randint(-100, 100)
                    
                    # Random smoke color (gray)
                    gray = np.random.randint(150, 220)
                    
                    # Draw smoke blob
                    cv2.circle(frame, (smoke_x, smoke_y), np.random.randint(10, 40), (gray, gray, gray), -1)
            
            elif event_type == "violence":
                # Create a simple violence animation (two objects colliding)
                frame.fill(50)  # Dark background
                
                # Animation progress (0 to 1)
                progress = frame_idx / (fps * duration)
                
                # Two objects moving toward each other then away
                if progress < 0.5:
                    pos1 = int(width * 0.2 + progress * width * 0.3)
                    pos2 = int(width * 0.8 - progress * width * 0.3)
                else:
                    pos1 = int(width * 0.5 - (progress - 0.5) * width * 0.3)
                    pos2 = int(width * 0.5 + (progress - 0.5) * width * 0.3)
                
                # Draw the objects
                cv2.circle(frame, (pos1, height // 2), 30, (0, 0, 255), -1)  # Red circle
                cv2.circle(frame, (pos2, height // 2), 30, (255, 0, 0), -1)  # Blue circle
            
            # Add frame to video
            out.write(frame)
        
        # Release the video writer
        out.release()
        print(f"  Created {output_file}")

print("Sample data generation completed.")