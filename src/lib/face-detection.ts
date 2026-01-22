/**
 * Face detection utility using BlazeFace from TensorFlow Models
 * Detects faces in images to ensure exactly one face is present
 */
import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs';

let model: blazeface.BlazeFaceModel | null = null;

/**
 * Load BlazeFace model
 * Loads the lightweight BlazeFace model with high-accuracy settings
 */
export async function loadFaceDetectionModel(): Promise<void> {
  if (model) return;

  try {
    console.log('Loading BlazeFace model with high-accuracy settings...');
    // Configure for high accuracy with minimal false positives
    // Note: BlazeFace has fixed input size of 128x128 internally
    model = await blazeface.load({
      maxFaces: 2,              // Limit to 2 faces max to reduce false positives
      iouThreshold: 0.3,        // Non-maximum suppression threshold (default: 0.3)
      scoreThreshold: 0.95      // Very high threshold for precision (default: 0.75)
    });
    console.log('BlazeFace model loaded successfully with scoreThreshold: 0.95');
  } catch (error) {
    console.error('Error loading BlazeFace model:', error);
    throw new Error('Failed to load face detection model');
  }
}

/**
 * Detect faces in an image
 * @param imageElement - HTML Image element to analyze
 * @returns Object with face count and detection success status
 */
export async function detectFaces(imageElement: HTMLImageElement): Promise<{
  faceCount: number;
  success: boolean;
  message: string;
}> {
  try {
    // Ensure model is loaded
    if (!model) {
      await loadFaceDetectionModel();
    }

    // Detect faces using BlazeFace
    // returnTensors: false means we get regular arrays instead of tensors
    const predictions = await model!.estimateFaces(imageElement, false);

    // Additional filtering: only count faces with high probability scores
    // BlazeFace returns predictions with a 'probability' array
    const MIN_CONFIDENCE = 0.95; // Very high confidence threshold
    const highConfidenceFaces = predictions.filter(prediction => {
      // Each prediction has a probability array for each detected point
      // We check if the face has high confidence
      const avgProbability = prediction.probability
        ? (Array.isArray(prediction.probability)
            ? prediction.probability.reduce((a: number, b: number) => a + b, 0) / prediction.probability.length
            : prediction.probability)
        : 0;

      console.log('Face detected with confidence:', avgProbability);
      return avgProbability >= MIN_CONFIDENCE;
    });

    const faceCount = highConfidenceFaces.length;

    console.log(`Total predictions: ${predictions.length}, High confidence faces: ${faceCount}`);

    // Return appropriate message based on face count
    if (faceCount === 0) {
      return {
        faceCount: 0,
        success: false,
        message: 'No clear face detected in the image. Please upload a well-lit, front-facing photo of your face.',
      };
    } else if (faceCount > 1) {
      return {
        faceCount,
        success: false,
        message: `Multiple faces detected (${faceCount}). Please upload a photo with only your face.`,
      };
    } else {
      return {
        faceCount: 1,
        success: true,
        message: 'Face detected successfully!',
      };
    }
  } catch (error) {
    console.error('Error detecting faces:', error);
    return {
      faceCount: 0,
      success: false,
      message: 'Error analyzing image. Please try another photo.',
    };
  }
}

/**
 * Validate that an image file contains exactly one face
 * @param file - Image file to validate
 * @returns Promise with validation result
 */
export async function validatePhotoHasOneFace(file: File): Promise<{
  valid: boolean;
  message: string;
  faceCount?: number;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const img = new Image();

        img.onload = async () => {
          const result = await detectFaces(img);

          resolve({
            valid: result.success,
            message: result.message,
            faceCount: result.faceCount,
          });
        };

        img.onerror = () => {
          resolve({
            valid: false,
            message: 'Failed to load image. Please try another file.',
          });
        };

        img.src = e.target?.result as string;
      } catch (error) {
        resolve({
          valid: false,
          message: 'Error processing image. Please try another file.',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        valid: false,
        message: 'Failed to read image file. Please try again.',
      });
    };

    reader.readAsDataURL(file);
  });
}
