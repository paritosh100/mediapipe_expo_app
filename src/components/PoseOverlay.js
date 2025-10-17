import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const PoseOverlay = ({ keypoints, exercise, confidence }) => {
  if (!keypoints || keypoints.length < 33) {
    return null;
  }

  const connections = [
    // Head and shoulders
    [0, 1], [1, 2], [2, 3], [3, 7],
    [0, 4], [4, 5], [5, 6], [6, 8],
    
    // Shoulders and arms
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    
    // Torso
    [11, 23], [12, 24], [23, 24],
    
    // Legs
    [23, 25], [25, 27], [24, 26], [26, 28],
    [27, 29], [28, 30], [29, 31], [30, 32],
    
    // Face
    [0, 9], [9, 10]
  ];

  const getKeypointColor = (visibility) => {
    if (visibility > 0.8) return '#00FF00'; // Green for high confidence
    if (visibility > 0.5) return '#FFFF00'; // Yellow for medium confidence
    return '#FF0000'; // Red for low confidence
  };

  const getConnectionColor = (kp1, kp2) => {
    const avgVisibility = (kp1.visibility + kp2.visibility) / 2;
    if (avgVisibility > 0.7) return '#00FF00';
    if (avgVisibility > 0.4) return '#FFFF00';
    return '#FF0000';
  };

  const scaleX = (x) => x * width;
  const scaleY = (y) => y * height;

  return (
    <View style={styles.overlay}>
      <Svg width={width} height={height} style={styles.svg}>
        {/* Draw connections */}
        {connections.map((connection, index) => {
          const kp1 = keypoints[connection[0]];
          const kp2 = keypoints[connection[1]];
          
          if (!kp1 || !kp2 || kp1.visibility < 0.3 || kp2.visibility < 0.3) {
            return null;
          }

          return (
            <Line
              key={index}
              x1={scaleX(kp1.x)}
              y1={scaleY(kp1.y)}
              x2={scaleX(kp2.x)}
              y2={scaleY(kp2.y)}
              stroke={getConnectionColor(kp1, kp2)}
              strokeWidth="2"
            />
          );
        })}

        {/* Draw keypoints */}
        {keypoints.map((keypoint, index) => {
          if (!keypoint || keypoint.visibility < 0.3) {
            return null;
          }

          return (
            <Circle
              key={index}
              cx={scaleX(keypoint.x)}
              cy={scaleY(keypoint.y)}
              r="4"
              fill={getKeypointColor(keypoint.visibility)}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}

        {/* Exercise label */}
        {exercise && confidence > 0.7 && (
          <SvgText
            x={width / 2}
            y={50}
            fontSize="20"
            fill="white"
            textAnchor="middle"
            stroke="black"
            strokeWidth="2"
          >
            {exercise.toUpperCase()} ({Math.round(confidence * 100)}%)
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default PoseOverlay;
