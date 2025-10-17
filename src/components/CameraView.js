import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import MediaPipeDetector from '../services/poseDetection/MediaPipeDetector';
import ExerciseClassifier from '../services/exerciseClassifier/ExerciseClassifier';
import FormCorrector from '../services/formCorrector/FormCorrector';
import PoseOverlay from './PoseOverlay';
import FeedbackDisplay from './FeedbackDisplay';

const { width, height } = Dimensions.get('window');

const CameraView = () => {
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;

  // State management
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseConfidence, setExerciseConfidence] = useState(0);
  const [formAnalysis, setFormAnalysis] = useState(null);
  const [keypoints, setKeypoints] = useState(null);

  // Service instances
  const poseDetector = useRef(new MediaPipeDetector()).current;
  const exerciseClassifier = useRef(new ExerciseClassifier()).current;
  const formCorrector = useRef(new FormCorrector()).current;

  useEffect(() => {
    requestCameraPermission();
    initializeServices();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        Alert.alert('Permission Required', 'Camera permission is needed to use this app');
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };

  const initializeServices = async () => {
    try {
      await poseDetector.initialize();
      poseDetector.setOnResultsCallback(handlePoseResults);
      console.log('Services initialized successfully');
    } catch (error) {
      console.error('Error initializing services:', error);
      Alert.alert('Initialization Error', 'Failed to initialize pose detection');
    }
  };

  const handlePoseResults = (results) => {
    try {
      const extractedKeypoints = poseDetector.extractKeypoints(results);
      
      if (extractedKeypoints && extractedKeypoints.keypoints) {
        setKeypoints(extractedKeypoints.keypoints);

        // Classify exercise
        const exerciseResult = exerciseClassifier.classifyExercise(extractedKeypoints.keypoints);
        
        if (exerciseResult.exercise && exerciseResult.confidence > 0.7) {
          setCurrentExercise(exerciseResult.exercise);
          setExerciseConfidence(exerciseResult.confidence);

          // Analyze form
          const analysis = formCorrector.analyzeForm(
            exerciseResult.exercise,
            extractedKeypoints.keypoints,
            'static' // TODO: Determine phase based on movement
          );
          
          setFormAnalysis(analysis);
        } else {
          setCurrentExercise(null);
          setExerciseConfidence(0);
          setFormAnalysis(null);
        }
      }
    } catch (error) {
      console.error('Error processing pose results:', error);
    }
  };

  const onCameraReady = () => {
    setIsActive(true);
  };

  const onCameraError = (error) => {
    console.error('Camera error:', error);
    Alert.alert('Camera Error', 'Failed to access camera');
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera permission is required to use this app
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          No camera device found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={isActive}
        onInitialized={onCameraReady}
        onError={onCameraError}
        frameProcessor={poseDetector.processFrame}
        frameProcessorFps={30}
      />
      
      <PoseOverlay 
        keypoints={keypoints}
        exercise={currentExercise}
        confidence={exerciseConfidence}
      />
      
      <FeedbackDisplay
        exercise={currentExercise}
        formAnalysis={formAnalysis}
        confidence={exerciseConfidence}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default CameraView;
