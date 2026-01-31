import { Hole, HazardLocation, HazardType, Direction } from '../types/golf';

export function generateHole(holeNumber: number, forcedPar?: 3 | 4 | 5): Hole {
  const parOptions = [3, 4, 5] as const;
  const par = forcedPar !== undefined ? forcedPar : parOptions[Math.floor(Math.random() * parOptions.length)];

  let yardage: number;
  if (par === 3) {
    yardage = Math.floor(Math.random() * 80) + 130;
  } else if (par === 4) {
    yardage = Math.floor(Math.random() * 110) + 320;
  } else {
    yardage = Math.floor(Math.random() * 80) + 480;
  }

  const hazardOptions: HazardLocation[] = ['Left', 'Right', 'Front', null];
  const hazardChance = Math.random();
  const hazard = hazardChance > 0.35 ? hazardOptions[Math.floor(Math.random() * hazardOptions.length)] : null;

  let hazardType: HazardType = null;
  if (hazard) {
    hazardType = Math.random() > 0.5 ? 'Water' : 'Bunker';
  }

  const windSpeed = Math.floor(Math.random() * 15) + 5;
  const windDirections = ['Headwind', 'Tailwind', 'Left-to-Right', 'Right-to-Left'];
  const windDir = windDirections[Math.floor(Math.random() * windDirections.length)];

  return {
    number: holeNumber,
    par,
    yardage,
    hazard,
    hazardType,
    windSpeed,
    windDir,
    shots: [],
    putts: 0,
    isComplete: false,
  };
}

interface ShotResult {
  finalDistance: number;
  remainingDistance: number;
  penaltyStrokes: number;
  distancePenalty: number;
  hitHazard: boolean;
}

export function calculateShotResult(
  inputDistance: number,
  direction: Direction,
  currentDistance: number,
  hazard: HazardLocation,
  hazardType: HazardType,
  windSpeed: number,
  windDir: string
): ShotResult {
  let effectiveDistance = inputDistance;

  if (windDir === 'Headwind') {
    effectiveDistance *= 0.9;
  } else if (windDir === 'Tailwind') {
    effectiveDistance *= 1.1;
  }

  let lateralDeviation = 0;
  if (direction === 'Wide Left') lateralDeviation = -30;
  if (direction === 'Left') lateralDeviation = -15;
  if (direction === 'Right') lateralDeviation = 15;
  if (direction === 'Wide Right') lateralDeviation = 30;

  if (windDir === 'Left-to-Right') {
    lateralDeviation += 10;
  } else if (windDir === 'Right-to-Left') {
    lateralDeviation -= 10;
  }

  let penaltyStrokes = 0;
  let distancePenalty = 0;
  let hitHazard = false;

  const hitLeftHazard = hazard === 'Left' && lateralDeviation < -20;
  const hitRightHazard = hazard === 'Right' && lateralDeviation > 20;
  const hitFrontHazard = hazard === 'Front' && effectiveDistance < currentDistance * 0.3;

  if (hitLeftHazard || hitRightHazard || hitFrontHazard) {
    hitHazard = true;
    if (hazardType === 'Water') {
      penaltyStrokes = 1;
    } else if (hazardType === 'Bunker') {
      distancePenalty = 7;
    }
  }

  if (direction === 'Wide Left' || direction === 'Wide Right') {
    distancePenalty += 15;
  }

  const finalDistance = Math.round(effectiveDistance);
  let remainingDistance = Math.max(0, currentDistance - finalDistance);
  remainingDistance += distancePenalty;

  return {
    finalDistance,
    remainingDistance,
    penaltyStrokes,
    distancePenalty,
    hitHazard,
  };
}

export function generateHoles(holeCount: 3 | 9 | 18): Hole[] {
  const holes: Hole[] = [];

  if (holeCount === 3) {
    const parValues: (3 | 4 | 5)[] = [3, 4, 5];
    for (let i = 0; i < parValues.length; i++) {
      const randomIndex = Math.floor(Math.random() * parValues.length);
      [parValues[i], parValues[randomIndex]] = [parValues[randomIndex], parValues[i]];
    }

    for (let i = 0; i < 3; i++) {
      holes.push(generateHole(i + 1, parValues[i]));
    }
  } else {
    for (let i = 1; i <= holeCount; i++) {
      holes.push(generateHole(i));
    }
  }

  return holes;
}
