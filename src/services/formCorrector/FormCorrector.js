import { 
  calculateAngle, 
  calculateDistance, 
  calculateSymmetryScore,
  isVerticalAlignment,
  calculateBodyLean,
  areKeypointsVisible
} from '../poseDetection/keypointUtils';

class FormCorrector {
  constructor() {
    this.correctionRules = {
      pushup: this.getPushupRules(),
      squat: this.getSquatRules(),
      lunge: this.getLungeRules(),
      side_lunge: this.getSideLungeRules(),
      plank: this.getPlankRules(),
      chair_dip: this.getChairDipRules()
    };
  }

  analyzeForm(exercise, keypoints, exercisePhase = 'static') {
    if (!exercise || !keypoints || !this.correctionRules[exercise]) {
      return { errors: [], tips: [], score: 0 };
    }

    const rules = this.correctionRules[exercise];
    const errors = [];
    const tips = [];
    let totalScore = 0;
    let ruleCount = 0;

    // Apply each correction rule
    rules.forEach(rule => {
      const result = rule.check(keypoints, exercisePhase);
      if (result.hasError) {
        errors.push({
          type: result.type,
          severity: result.severity,
          message: result.message,
          confidence: result.confidence
        });
      } else {
        totalScore += result.score || 0;
        ruleCount++;
      }

      if (result.tip) {
        tips.push(result.tip);
      }
    });

    const overallScore = ruleCount > 0 ? totalScore / ruleCount : 0;

    return {
      errors,
      tips,
      score: overallScore,
      exercise,
      phase: exercisePhase,
      timestamp: Date.now()
    };
  }

  getPushupRules() {
    return [
      // Rule 1: Check body alignment
      {
        check: (keypoints, phase) => {
          const leftShoulder = keypoints[11];
          const rightShoulder = keypoints[12];
          const leftHip = keypoints[23];
          const rightHip = keypoints[24];
          const leftAnkle = keypoints[27];
          const rightAnkle = keypoints[28];

          if (!areKeypointsVisible([leftShoulder, rightShoulder, leftHip, rightHip, leftAnkle, rightAnkle])) {
            return { hasError: false, score: 0 };
          }

          // Check if body is straight (shoulders, hips, ankles aligned)
          const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
          const hipY = (leftHip.y + rightHip.y) / 2;
          const ankleY = (leftAnkle.y + rightAnkle.y) / 2;

          const bodyAlignment = Math.abs(shoulderY - hipY) + Math.abs(hipY - ankleY);

          if (bodyAlignment > 0.1) {
            return {
              hasError: true,
              type: 'body_alignment',
              severity: 0.7,
              message: 'Keep your body straight from head to heels',
              confidence: 0.8,
              tip: 'Engage your core and imagine a straight line from your head to your feet'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      },

      // Rule 2: Check hand position
      {
        check: (keypoints, phase) => {
          const leftShoulder = keypoints[11];
          const rightShoulder = keypoints[12];
          const leftWrist = keypoints[15];
          const rightWrist = keypoints[16];

          if (!areKeypointsVisible([leftShoulder, rightShoulder, leftWrist, rightWrist])) {
            return { hasError: false, score: 0 };
          }

          const shoulderDistance = calculateDistance(leftShoulder, rightShoulder);
          const wristDistance = calculateDistance(leftWrist, rightWrist);

          if (wristDistance > shoulderDistance * 1.5) {
            return {
              hasError: true,
              type: 'hand_position',
              severity: 0.5,
              message: 'Keep your hands closer to your body',
              confidence: 0.7,
              tip: 'Place hands slightly wider than shoulder-width apart'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      },

      // Rule 3: Check elbow position
      {
        check: (keypoints, phase) => {
          const leftShoulder = keypoints[11];
          const rightShoulder = keypoints[12];
          const leftElbow = keypoints[13];
          const rightElbow = keypoints[14];
          const leftWrist = keypoints[15];
          const rightWrist = keypoints[16];

          if (!areKeypointsVisible([leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist])) {
            return { hasError: false, score: 0 };
          }

          const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
          const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

          // Check if elbows are flaring out too much
          const leftElbowX = leftElbow.x;
          const rightElbowX = rightElbow.x;
          const shoulderMidpoint = (leftShoulder.x + rightShoulder.x) / 2;

          if (Math.abs(leftElbowX - shoulderMidpoint) > 0.15 || 
              Math.abs(rightElbowX - shoulderMidpoint) > 0.15) {
            return {
              hasError: true,
              type: 'elbow_position',
              severity: 0.6,
              message: 'Keep your elbows closer to your body',
              confidence: 0.8,
              tip: 'Tuck your elbows in at a 45-degree angle'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      }
    ];
  }

  getSquatRules() {
    return [
      // Rule 1: Check squat depth
      {
        check: (keypoints, phase) => {
          const leftHip = keypoints[23];
          const rightHip = keypoints[24];
          const leftKnee = keypoints[25];
          const rightKnee = keypoints[26];
          const leftAnkle = keypoints[27];
          const rightAnkle = keypoints[28];

          if (!areKeypointsVisible([leftHip, leftKnee, leftAnkle, rightHip, rightKnee, rightAnkle])) {
            return { hasError: false, score: 0 };
          }

          const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
          const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
          const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

          if (avgKneeAngle > 120) {
            return {
              hasError: true,
              type: 'squat_depth',
              severity: 0.8,
              message: 'Squat deeper - aim for 90° knee angle',
              confidence: 0.9,
              tip: 'Lower your hips until your thighs are parallel to the ground'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      },

      // Rule 2: Check knee alignment
      {
        check: (keypoints, phase) => {
          const leftKnee = keypoints[25];
          const rightKnee = keypoints[26];
          const leftAnkle = keypoints[27];
          const rightAnkle = keypoints[28];

          if (!areKeypointsVisible([leftKnee, rightKnee, leftAnkle, rightAnkle])) {
            return { hasError: false, score: 0 };
          }

          // Check if knees are caving in (knee valgus)
          const leftKneeAnkleDiff = Math.abs(leftKnee.x - leftAnkle.x);
          const rightKneeAnkleDiff = Math.abs(rightKnee.x - rightAnkle.x);

          if (leftKneeAnkleDiff > 0.05 || rightKneeAnkleDiff > 0.05) {
            return {
              hasError: true,
              type: 'knee_alignment',
              severity: 0.7,
              message: 'Keep your knees aligned with your toes',
              confidence: 0.8,
              tip: 'Push your knees outwards and track them over your toes'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      },

      // Rule 3: Check back position
      {
        check: (keypoints, phase) => {
          const leftShoulder = keypoints[11];
          const rightShoulder = keypoints[12];
          const leftHip = keypoints[23];
          const rightHip = keypoints[24];

          if (!areKeypointsVisible([leftShoulder, rightShoulder, leftHip, rightHip])) {
            return { hasError: false, score: 0 };
          }

          const bodyLean = calculateBodyLean(
            { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
            { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
          );

          if (Math.abs(bodyLean) > 20) {
            return {
              hasError: true,
              type: 'back_position',
              severity: 0.6,
              message: 'Keep your chest up and back straight',
              confidence: 0.7,
              tip: 'Engage your core and maintain a neutral spine'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      }
    ];
  }

  getLungeRules() {
    return [
      // Rule 1: Check lunge depth
      {
        check: (keypoints, phase) => {
          const leftHip = keypoints[23];
          const rightHip = keypoints[24];
          const leftKnee = keypoints[25];
          const rightKnee = keypoints[26];
          const leftAnkle = keypoints[27];
          const rightAnkle = keypoints[28];

          if (!areKeypointsVisible([leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle])) {
            return { hasError: false, score: 0 };
          }

          const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
          const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

          // Check if at least one knee is bent significantly
          if (leftKneeAngle > 90 && rightKneeAngle > 90) {
            return {
              hasError: true,
              type: 'lunge_depth',
              severity: 0.7,
              message: 'Lower your body more - aim for 90° knee angle',
              confidence: 0.8,
              tip: 'Step forward and lower until your front thigh is parallel to the ground'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      },

      // Rule 2: Check front knee position
      {
        check: (keypoints, phase) => {
          const leftKnee = keypoints[25];
          const rightKnee = keypoints[26];
          const leftAnkle = keypoints[27];
          const rightAnkle = keypoints[28];

          if (!areKeypointsVisible([leftKnee, rightKnee, leftAnkle, rightAnkle])) {
            return { hasError: false, score: 0 };
          }

          // Check if front knee is over the ankle
          const leftKneeAnkleDiff = Math.abs(leftKnee.x - leftAnkle.x);
          const rightKneeAnkleDiff = Math.abs(rightKnee.x - rightAnkle.x);

          if (leftKneeAnkleDiff > 0.08 || rightKneeAnkleDiff > 0.08) {
            return {
              hasError: true,
              type: 'knee_position',
              severity: 0.6,
              message: 'Keep your front knee over your ankle',
              confidence: 0.7,
              tip: 'Don\'t let your knee go past your toes'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      }
    ];
  }

  getSideLungeRules() {
    return [
      // Rule 1: Check lateral movement
      {
        check: (keypoints, phase) => {
          const leftHip = keypoints[23];
          const rightHip = keypoints[24];
          const leftAnkle = keypoints[27];
          const rightAnkle = keypoints[28];

          if (!areKeypointsVisible([leftHip, rightHip, leftAnkle, rightAnkle])) {
            return { hasError: false, score: 0 };
          }

          const hipDistance = Math.abs(leftHip.x - rightHip.x);
          const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);

          if (ankleDistance < hipDistance * 1.2) {
            return {
              hasError: true,
              type: 'lateral_movement',
              severity: 0.6,
              message: 'Step wider to the side',
              confidence: 0.7,
              tip: 'Keep your feet wider apart for a proper side lunge'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      }
    ];
  }

  getPlankRules() {
    return [
      // Rule 1: Check body alignment
      {
        check: (keypoints, phase) => {
          const leftShoulder = keypoints[11];
          const rightShoulder = keypoints[12];
          const leftHip = keypoints[23];
          const rightHip = keypoints[24];
          const leftKnee = keypoints[25];
          const rightKnee = keypoints[26];

          if (!areKeypointsVisible([leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee])) {
            return { hasError: false, score: 0 };
          }

          const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
          const hipY = (leftHip.y + rightHip.y) / 2;
          const kneeY = (leftKnee.y + rightKnee.y) / 2;

          const alignment = Math.abs(shoulderY - hipY) + Math.abs(hipY - kneeY);

          if (alignment > 0.08) {
            return {
              hasError: true,
              type: 'body_alignment',
              severity: 0.7,
              message: 'Keep your body in a straight line',
              confidence: 0.8,
              tip: 'Engage your core and avoid sagging or piking'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      }
    ];
  }

  getChairDipRules() {
    return [
      // Rule 1: Check arm position
      {
        check: (keypoints, phase) => {
          const leftShoulder = keypoints[11];
          const rightShoulder = keypoints[12];
          const leftElbow = keypoints[13];
          const rightElbow = keypoints[14];
          const leftWrist = keypoints[15];
          const rightWrist = keypoints[16];

          if (!areKeypointsVisible([leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist])) {
            return { hasError: false, score: 0 };
          }

          const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
          const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

          if (leftElbowAngle > 150 || rightElbowAngle > 150) {
            return {
              hasError: true,
              type: 'arm_position',
              severity: 0.6,
              message: 'Lower your body more to work your triceps',
              confidence: 0.7,
              tip: 'Bend your elbows to 90 degrees for full range of motion'
            };
          }

          return { hasError: false, score: 1.0 };
        }
      }
    ];
  }
}

export default FormCorrector;
