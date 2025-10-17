import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView, 
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CameraView from './src/components/CameraView';

const App = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request camera permission
      const cameraResult = await request(PERMISSIONS.ANDROID.CAMERA);
      
      // Request audio permission for TTS
      const audioResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);

      if (cameraResult === RESULTS.GRANTED) {
        setPermissionsGranted(true);
        setIsInitialized(true);
      } else {
        Alert.alert(
          'Permissions Required',
          'This app needs camera permission to work. Please grant permission in settings.',
          [
            { text: 'OK', onPress: () => {} }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const renderWelcomeScreen = () => (
    <SafeAreaView style={styles.welcomeContainer}>
      <View style={styles.welcomeContent}>
        <Text style={styles.title}>Pose Correction App</Text>
        <Text style={styles.subtitle}>Your Personal Fitness Coach</Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features:</Text>
          <Text style={styles.feature}>• Real-time pose detection</Text>
          <Text style={styles.feature}>• Form correction for 6 exercises</Text>
          <Text style={styles.feature}>• Voice and text feedback</Text>
          <Text style={styles.feature}>• Works offline - no internet needed</Text>
        </View>

        <View style={styles.exercisesContainer}>
          <Text style={styles.exercisesTitle}>Supported Exercises:</Text>
          <Text style={styles.exercise}>🏋️‍♂️ Push-ups</Text>
          <Text style={styles.exercise}>🦵 Squats</Text>
          <Text style={styles.exercise}>🚶‍♂️ Lunges</Text>
          <Text style={styles.exercise}>↔️ Side Lunges</Text>
          <Text style={styles.exercise}>📏 Planks</Text>
          <Text style={styles.exercise}>💺 Chair Dips</Text>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={requestPermissions}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>

        <Text style={styles.instructions}>
          Position yourself in front of the camera and start exercising!
        </Text>
      </View>
    </SafeAreaView>
  );

  if (!permissionsGranted) {
    return renderWelcomeScreen();
  }

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <CameraView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  feature: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  exercisesContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  exercise: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  startButton: {
    backgroundColor: '#00AA00',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
});

export default App;
