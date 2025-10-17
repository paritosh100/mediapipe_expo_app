import { 
  isPlankPosition, 
  isSquatPosition, 
  isLungePosition, 
  isPushupPosition,
  calculateAngle,
  calculateDistance,
  areKeypointsVisible
} from '../poseDetection/keypointUtils';

class ExerciseClassifier {
  constructor() {
    this.exercises = [
      'pushup',
      'squat', 
      'lunge',
      'side_lunge',
      'plank',
      'chair_dip'
    ];
    
    this.currentExercise = null;
    this.exerciseConfidence = 0;
    this.exerciseHistory = [];
    this.minFramesForConfirmation = 10; // Frames needed to confirm exercise
  }

  classifyExercise(keypoints) {
    if (!keypoints || keypoints.length < 33) {
      return { exercise: null, confidence: 0 };
    }

    // Get exercise scores
    const scores = {
      pushup: this.getPushupScore(keypoints),
      squat: this.getSquatScore(keypoints),
      lunge: this.getLungeScore(keypoints),
      side_lunge: this.getSideLungeScore(keypoints),
      plank: this.getPlankScore(keypoints),
      chair_dip: this.getChairDipScore(keypoints)
    };

    // Find exercise with highest score
    const bestExercise = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    const confidence = scores[bestExercise];

    // Add to history for stability
    this.exerciseHistory.push(bestExercise);
    if (this.exerciseHistory.length > this.minFramesForConfirmation) {
      this.exerciseHistory.shift();
    }

    // Confirm exercise if it appears consistently
    const confirmedExercise = this.getConfirmedExercise();
    
    return {
      exercise: confirmedExercise,
      confidence: confidence,
      allScores: scores
    };
  }

  getConfirmedExercise() {
    if (this.exerciseHistory.length < this.minFramesForConfirmation) {
      return null;
    }

    // Count occurrences of each exercise
    const counts = {};
    this.exerciseHistory.forEach(ex => {
      counts[ex] = (counts[ex] || 0) + 1;
    });

    // Find most common exercise
    const mostCommon = Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );

    // Confirm if it appears in majority of recent frames
    const threshold = this.minFramesForConfirmation * 0.6;
    return counts[mostCommon] >= threshold ? mostCommon : null;
  }

  getPushupScore(keypoints) {
    const leftShoulder = keypoints[11];
    const rightShoulder = keypoints[12];
    const leftElbow = keypoints[13];
    const rightElbow = keypoints[14];
    const leftWrist = keypoints[15];
    const rightWrist = keypoints[16];
    const leftHip = keypoints[23];
    const rightHip = keypoints[24];

    if (!areKeypointsVisible([leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist])) {
      return 0;
    }

    let score = 0;

    // Check if in plank position
    if (isPlankPosition(keypoints)) {
      score += 0.4;
    }

    // Check if wrists are below shoulders (hands on ground)
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgWristY = (leftWrist.y + rightWrist.y) / 2;
    if (avgWristY > avgShoulderY) {
      score += 0.3;
    }

    // Check elbow angles (should be bent for push-up)
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    
    if (leftElbowAngle < 180 && rightElbowAngle < 180) {
      score += 0.2;
    }

    // Check if body is roughly horizontal
    const shoulderHipAngle = calculateAngle(leftShoulder, leftHip, rightHip);
    if (shoulderHipAngle > 170 && shoulderHipAngle < 190) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  getSquatScore(keypoints) {
    const leftHip = keypoints[23];
    const rightHip = keypoints[24];
    const leftKnee = keypoints[25];
    const rightKnee = keypoints[26];
    const leftAnkle = keypoints[27];
    const rightAnkle = keypoints[28];

    if (!areKeypointsVisible([leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle])) {
      return 0;
    }

    let score = 0;

    // Check if in squat position
    if (isSquatPosition(keypoints)) {
      score += 0.5;
    }

    // Check knee angles
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    if (avgKneeAngle < 120) {
      score += 0.3;
    }

    // Check if feet are roughly shoulder-width apart
    const footDistance = calculateDistance(leftAnkle, rightAnkle);
    const shoulderDistance = calculateDistance(keypoints[11], keypoints[12]);
    const footToShoulderRatio = footDistance / shoulderDistance;

    if (footToShoulderRatio > 0.8 && footToShoulderRatio < 1.5) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  getLungeScore(keypoints) {
    const leftHip = keypoints[23];
    const rightHip = keypoints[24];
    const leftKnee = keypoints[25];
    const rightKnee = keypoints[26];
    const leftAnkle = keypoints[27];
    const rightAnkle = keypoints[28];

    if (!areKeypointsVisible([leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle])) {
      return 0;
    }

    let score = 0;

    // Check if in lunge position
    if (isLungePosition(keypoints)) {
      score += 0.4;
    }

    // Check for significant difference in knee angles
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const kneeAngleDiff = Math.abs(leftKneeAngle - rightKneeAngle);

    if (kneeAngleDiff > 30) {
      score += 0.3;
    }

    // Check if one leg is more forward than the other
    const hipDistance = Math.abs(leftHip.x - rightHip.x);
    const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);

    if (ankleDistance > hipDistance * 1.2) {
      score += 0.3;
    }

    return Math.min(score, 1);
  }

  getSideLungeScore(keypoints) {
    const leftHip = keypoints[23];
    const rightHip = keypoints[24];
    const leftKnee = keypoints[25];
    const rightKnee = keypoints[26];
    const leftAnkle = keypoints[27];
    const rightAnkle = keypoints[28];

    if (!areKeypointsVisible([leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle])) {
      return 0;
    }

    let score = 0;

    // Check for lateral movement (side lunge)
    const hipDistance = Math.abs(leftHip.x - rightHip.x);
    const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);

    if (ankleDistance > hipDistance * 1.5) {
      score += 0.4;
    }

    // Check if one knee is significantly bent while other is straight
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    
    const oneLegBent = (leftKneeAngle < 90 && rightKneeAngle > 160) || 
                      (rightKneeAngle < 90 && leftKneeAngle > 160);

    if (oneLegBent) {
      score += 0.4;
    }

    // Check if hips are shifted to one side
    const leftShoulder = keypoints[11];
    const rightShoulder = keypoints[12];
    const shoulderMidpoint = (leftShoulder.x + rightShoulder.x) / 2;
    const hipMidpoint = (leftHip.x + rightHip.x) / 2;
    const hipShift = Math.abs(shoulderMidpoint - hipMidpoint);

    if (hipShift > 0.05) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  getPlankScore(keypoints) {
    const leftShoulder = keypoints[11];
    const rightShoulder = keypoints[12];
    const leftHip = keypoints[23];
    const rightHip = keypoints[24];
    const leftKnee = keypoints[25];
    const rightKnee = keypoints[26];

    if (!areKeypointsVisible([leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee])) {
      return 0;
    }

    let score = 0;

    // Check if in plank position
    if (isPlankPosition(keypoints)) {
      score += 0.6;
    }

    // Check if body is roughly horizontal
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipY = (leftHip.y + rightHip.y) / 2;
    const kneeY = (leftKnee.y + rightKnee.y) / 2;

    const shoulderHipDiff = Math.abs(shoulderY - hipY);
    const hipKneeDiff = Math.abs(hipY - kneeY);

    if (shoulderHipDiff < 0.05 && hipKneeDiff < 0.05) {
      score += 0.4;
    }

    return Math.min(score, 1);
  }

  getChairDipScore(keypoints) {
    const leftShoulder = keypoints[11];
    const rightShoulder = keypoints[12];
    const leftElbow = keypoints[13];
    const rightElbow = keypoints[14];
    const leftWrist = keypoints[15];
    const rightWrist = keypoints[16];

    if (!areKeypointsVisible([leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist])) {
      return 0;
    }

    let score = 0;

    // Check if person is sitting (hips lower than shoulders)
    const leftHip = keypoints[23];
    const rightHip = keypoints[24];
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgHipY = (leftHip.y + rightHip.y) / 2;

    if (avgHipY > avgShoulderY) {
      score += 0.4;
    }

    // Check if arms are bent (elbow angles)
    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

    if (avgElbowAngle < 120) {
      score += 0.4;
    }

    // Check if wrists are behind body (on chair)
    const shoulderMidpoint = (leftShoulder.x + rightShoulder.x) / 2;
    const wristMidpoint = (leftWrist.x + rightWrist.x) / 2;

    // For chair dips, wrists should be behind shoulders
    if (Math.abs(wristMidpoint - shoulderMidpoint) > 0.1) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }

  reset() {
    this.currentExercise = null;
    this.exerciseConfidence = 0;
    this.exerciseHistory = [];
  }
}

export default ExerciseClassifier;
