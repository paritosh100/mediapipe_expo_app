import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Tts from 'react-native-tts';

const { width, height } = Dimensions.get('window');

const FeedbackDisplay = ({ exercise, formAnalysis, confidence }) => {
  const [lastSpokenMessage, setLastSpokenMessage] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
  }, []);

  useEffect(() => {
    if (formAnalysis && formAnalysis.errors && formAnalysis.errors.length > 0) {
      // Show feedback with animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Speak the most severe error
      const mostSevereError = formAnalysis.errors.reduce((prev, current) => 
        (prev.severity > current.severity) ? prev : current
      );

      if (mostSevereError.message !== lastSpokenMessage) {
        Tts.speak(mostSevereError.message);
        setLastSpokenMessage(mostSevereError.message);
      }
    }
  }, [formAnalysis, fadeAnim, lastSpokenMessage]);

  const getFeedbackColor = (severity) => {
    if (severity > 0.7) return '#FF4444'; // Red for high severity
    if (severity > 0.4) return '#FFAA00'; // Orange for medium severity
    return '#44AA44'; // Green for low severity
  };

  const getFeedbackIcon = (errorType) => {
    const icons = {
      'body_alignment': '📏',
      'hand_position': '✋',
      'elbow_position': '🦾',
      'squat_depth': '⬇️',
      'knee_alignment': '🦵',
      'back_position': '🫁',
      'lunge_depth': '📐',
      'knee_position': '🎯',
      'lateral_movement': '↔️',
      'arm_position': '💪'
    };
    return icons[errorType] || '⚠️';
  };

  if (!exercise || confidence < 0.7 || !formAnalysis) {
    return (
      <View style={styles.container}>
        <Text style={styles.exerciseLabel}>
          {exercise ? `${exercise.toUpperCase()}` : 'Position yourself in front of the camera'}
        </Text>
        {confidence > 0 && confidence < 0.7 && (
          <Text style={styles.confidenceText}>
            Confidence: {Math.round(confidence * 100)}% - Keep adjusting your position
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Exercise and score display */}
      <View style={styles.header}>
        <Text style={styles.exerciseLabel}>
          {exercise.toUpperCase()}
        </Text>
        <Text style={styles.scoreText}>
          Form Score: {Math.round(formAnalysis.score * 100)}%
        </Text>
      </View>

      {/* Errors display */}
      {formAnalysis.errors && formAnalysis.errors.length > 0 && (
        <Animated.View 
          style={[styles.feedbackContainer, { opacity: fadeAnim }]}
        >
          {formAnalysis.errors.map((error, index) => (
            <View 
              key={index}
              style={[
                styles.errorItem,
                { backgroundColor: getFeedbackColor(error.severity) }
              ]}
            >
              <Text style={styles.errorIcon}>
                {getFeedbackIcon(error.type)}
              </Text>
              <Text style={styles.errorText}>
                {error.message}
              </Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Tips display */}
      {formAnalysis.tips && formAnalysis.tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips:</Text>
          {formAnalysis.tips.map((tip, index) => (
            <Text key={index} style={styles.tipText}>
              • {tip}
            </Text>
          ))}
        </View>
      )}

      {/* Success message */}
      {formAnalysis.errors.length === 0 && formAnalysis.score > 0.8 && (
        <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
          <Text style={styles.successText}>
            🎉 Excellent form! Keep it up!
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseLabel: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  scoreText: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceText: {
    color: '#FFAA00',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  feedbackContainer: {
    marginBottom: 15,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: 'rgba(68, 170, 68, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  tipsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  successContainer: {
    backgroundColor: 'rgba(68, 170, 68, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FeedbackDisplay;
