import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;

  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
    modelsLoaded = true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw error;
  }
};

export const getFaceDescriptor = async (videoElement: HTMLVideoElement) => {
  try {
    const detections = await faceapi
      .detectSingleFace(videoElement)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      throw new Error('No face detected');
    }

    return detections.descriptor;
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    throw error;
  }
};

export const compareFaceDescriptors = (
  descriptor1: Float32Array,
  descriptor2: Float32Array
): boolean => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  return distance < 0.6; // Adjust threshold as needed
};