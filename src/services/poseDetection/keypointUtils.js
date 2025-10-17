/**
 * Utility functions for processing MediaPipe keypoints
 */

// Calculate angle between three points
export function calculateAngle(point1, point2, point3) {
  const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                  Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
}

// Calculate distance between two points
export function calculateDistance(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate midpoint between two points
export function calculateMidpoint(point1, point2) {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
    z: (point1.z + point2.z) / 2
  };
}

// Check if keypoints are visible (confidence > threshold)
export function areKeypointsVisible(keypoints, threshold = 0.5) {
  return keypoints.every(kp => kp.visibility > threshold);
}

// Calculate center of mass from keypoints
export function calculateCenterOfMass(keypoints) {
  let totalX = 0, totalY = 0, totalZ = 0;
  let count = 0;

  keypoints.forEach(kp => {
    if (kp.visibility > 0.5) {
      totalX += kp.x;
      totalY += kp.y;
      totalZ += kp.z;
      count++;
    }
  });

  if (count === 0) return null;

  return {
    x: totalX / count,
    y: totalY / count,
    z: totalZ / count
  };
}

// Calculate body symmetry score (0 = perfect symmetry, 1 = maximum asymmetry)
export function calculateSymmetryScore(leftKeypoints, rightKeypoints) {
  if (!leftKeypoints || !rightKeypoints) return 1;

  let totalDifference = 0;
  let count = 0;

  for (let i = 0; i < leftKeypoints.length && i < rightKeypoints.length; i++) {
    const left = leftKeypoints[i];
    const right = rightKeypoints[i];
    
    if (left.visibility > 0.5 && right.visibility > 0.5) {
      const diff = Math.abs(left.y - right.y); // Compare vertical positions
      totalDifference += diff;
      count++;
    }
  }

  return count > 0 ? totalDifference / count : 1;
}

// Check if body is in vertical alignment
export function isVerticalAlignment(shoulder, hip, ankle, tolerance = 0.1) {
  if (!shoulder || !hip || !ankle) return false;

  // Check if points are roughly in a vertical line
  const shoulderHipDiff = Math.abs(shoulder.x - hip.x);
  const hipAnkleDiff = Math.abs(hip.x - ankle.x);
  
  return shoulderHipDiff < tolerance && hipAnkleDiff < tolerance;
}

// Calculate body lean angle
export function calculateBodyLean(shoulder, hip) {
  if (!shoulder || !hip) return 0;

  const dx = hip.x - shoulder.x;
  const dy = hip.y - shoulder.y;
  const angle = Math.atan2(dx, dy) * 180 / Math.PI;
  
  return angle;
}

// Detect if person is in a plank position
export function isPlankPosition(keypoints) {
  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];
  const leftKnee = keypoints[25];
  const rightKnee = keypoints[26];

  if (!areKeypointsVisible([leftShoulder, rightShoulder, leftHip, rightHip])) {
    return false;
  }

  // Check if shoulders and hips are roughly aligned horizontally
  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipY = (leftHip.y + rightHip.y) / 2;
  const verticalDiff = Math.abs(shoulderY - hipY);

  // Check if knees are bent (for high plank) or straight (for low plank)
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, keypoints[27]); // hip-knee-ankle
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, keypoints[28]);

  return verticalDiff < 0.05 && leftKneeAngle > 160 && rightKneeAngle > 160;
}

// Detect if person is in a squat position
export function isSquatPosition(keypoints) {
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];
  const leftKnee = keypoints[25];
  const rightKnee = keypoints[26];
  const leftAnkle = keypoints[27];
  const rightAnkle = keypoints[28];

  if (!areKeypointsVisible([leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle])) {
    return false;
  }

  // Calculate knee angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  // Check if knees are bent significantly (squat depth)
  return avgKneeAngle < 120; // Adjust threshold as needed
}

// Detect if person is in a lunge position
export function isLungePosition(keypoints) {
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];
  const leftKnee = keypoints[25];
  const rightKnee = keypoints[26];
  const leftAnkle = keypoints[27];
  const rightAnkle = keypoints[28];

  if (!areKeypointsVisible([leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle])) {
    return false;
  }

  // Check for significant difference in knee angles (one leg forward, one back)
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  
  const kneeAngleDiff = Math.abs(leftKneeAngle - rightKneeAngle);
  
  // In a lunge, one knee should be more bent than the other
  return kneeAngleDiff > 30 && (leftKneeAngle < 90 || rightKneeAngle < 90);
}

// Detect if person is doing push-ups
export function isPushupPosition(keypoints) {
  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];
  const leftElbow = keypoints[13];
  const rightElbow = keypoints[14];
  const leftWrist = keypoints[15];
  const rightWrist = keypoints[16];

  if (!areKeypointsVisible([leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist])) {
    return false;
  }

  // Check if person is in plank-like position with hands on ground
  const isPlank = isPlankPosition(keypoints);
  
  // Check if wrists are below shoulders (hands on ground)
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const avgWristY = (leftWrist.y + rightWrist.y) / 2;
  
  return isPlank && avgWristY > avgShoulderY;
}
