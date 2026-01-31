import { describe, it, expect } from 'vitest';
import { generateHole, generateHoles, calculateShotResult } from './golfLogic';

describe('generateHole', () => {
  it('should generate a hole with required properties', () => {
    const hole = generateHole(1);

    expect(hole.number).toBe(1);
    expect([3, 4, 5]).toContain(hole.par);
    expect(hole.yardage).toBeGreaterThan(0);
    expect(hole.windSpeed).toBeGreaterThanOrEqual(5);
    expect(hole.windSpeed).toBeLessThanOrEqual(19);
    expect(['Headwind', 'Tailwind', 'Left-to-Right', 'Right-to-Left']).toContain(hole.windDir);
    expect(hole.shots).toEqual([]);
    expect(hole.putts).toBe(0);
    expect(hole.isComplete).toBe(false);
  });

  it('should generate par 3 hole with correct yardage range (130-209)', () => {
    const hole = generateHole(1, 3);

    expect(hole.par).toBe(3);
    expect(hole.yardage).toBeGreaterThanOrEqual(130);
    expect(hole.yardage).toBeLessThan(210);
  });

  it('should generate par 4 hole with correct yardage range (320-429)', () => {
    const hole = generateHole(1, 4);

    expect(hole.par).toBe(4);
    expect(hole.yardage).toBeGreaterThanOrEqual(320);
    expect(hole.yardage).toBeLessThan(430);
  });

  it('should generate par 5 hole with correct yardage range (480-559)', () => {
    const hole = generateHole(1, 5);

    expect(hole.par).toBe(5);
    expect(hole.yardage).toBeGreaterThanOrEqual(480);
    expect(hole.yardage).toBeLessThan(560);
  });

  it('should have valid hazard configuration', () => {
    const hole = generateHole(1);

    expect([null, 'Left', 'Right', 'Front']).toContain(hole.hazard);

    if (hole.hazard) {
      expect(['Water', 'Bunker']).toContain(hole.hazardType);
    } else {
      expect(hole.hazardType).toBeNull();
    }
  });
});

describe('generateHoles', () => {
  it('should generate 3 holes for a 3-hole round', () => {
    const holes = generateHoles(3);

    expect(holes).toHaveLength(3);
    expect(holes[0].number).toBe(1);
    expect(holes[1].number).toBe(2);
    expect(holes[2].number).toBe(3);
  });

  it('should generate 9 holes for a 9-hole round', () => {
    const holes = generateHoles(9);

    expect(holes).toHaveLength(9);
    holes.forEach((hole, index) => {
      expect(hole.number).toBe(index + 1);
    });
  });

  it('should generate 18 holes for an 18-hole round', () => {
    const holes = generateHoles(18);

    expect(holes).toHaveLength(18);
    holes.forEach((hole, index) => {
      expect(hole.number).toBe(index + 1);
    });
  });

  it('should include all par values (3, 4, 5) in a 3-hole round', () => {
    const holes = generateHoles(3);
    const pars = holes.map(h => h.par).sort();

    expect(pars).toEqual([3, 4, 5]);
  });
});

describe('calculateShotResult', () => {
  describe('distance calculations', () => {
    it('should calculate basic shot without wind or hazards', () => {
      const result = calculateShotResult(
        200, // inputDistance
        'Middle', // direction
        400, // currentDistance
        null, // hazard
        null, // hazardType
        10, // windSpeed
        'Left-to-Right' // windDir (no distance effect)
      );

      expect(result.finalDistance).toBe(200);
      expect(result.remainingDistance).toBe(200);
      expect(result.penaltyStrokes).toBe(0);
      expect(result.distancePenalty).toBe(0);
      expect(result.hitHazard).toBe(false);
    });

    it('should reduce distance by 10% for headwind', () => {
      const result = calculateShotResult(
        200,
        'Middle',
        400,
        null,
        null,
        10,
        'Headwind'
      );

      expect(result.finalDistance).toBe(180); // 200 * 0.9
      expect(result.remainingDistance).toBe(220); // 400 - 180
    });

    it('should increase distance by 10% for tailwind', () => {
      const result = calculateShotResult(
        200,
        'Middle',
        400,
        null,
        null,
        10,
        'Tailwind'
      );

      expect(result.finalDistance).toBe(220); // 200 * 1.1
      expect(result.remainingDistance).toBe(180); // 400 - 220
    });
  });

  describe('direction penalties', () => {
    it('should add 15 yard penalty for Wide Left shots', () => {
      const result = calculateShotResult(
        200,
        'Wide Left',
        400,
        null,
        null,
        10,
        'Left-to-Right'
      );

      expect(result.distancePenalty).toBe(15);
      expect(result.remainingDistance).toBe(215); // 400 - 200 + 15
    });

    it('should add 15 yard penalty for Wide Right shots', () => {
      const result = calculateShotResult(
        200,
        'Wide Right',
        400,
        null,
        null,
        10,
        'Left-to-Right'
      );

      expect(result.distancePenalty).toBe(15);
      expect(result.remainingDistance).toBe(215);
    });

    it('should not add penalty for Left, Middle, or Right directions', () => {
      const directions = ['Left', 'Middle', 'Right'] as const;

      directions.forEach(direction => {
        const result = calculateShotResult(
          200,
          direction,
          400,
          null,
          null,
          10,
          'Left-to-Right'
        );

        expect(result.distancePenalty).toBe(0);
      });
    });
  });

  describe('hazard penalties', () => {
    it('should add 1 penalty stroke for hitting water hazard on left', () => {
      const result = calculateShotResult(
        200,
        'Wide Left', // lateralDeviation = -30
        400,
        'Left',
        'Water',
        10,
        'Headwind' // No lateral effect
      );

      expect(result.hitHazard).toBe(true);
      expect(result.penaltyStrokes).toBe(1);
    });

    it('should add 1 penalty stroke for hitting water hazard on right', () => {
      const result = calculateShotResult(
        200,
        'Wide Right', // lateralDeviation > 20
        400,
        'Right',
        'Water',
        10,
        'Left-to-Right'
      );

      expect(result.hitHazard).toBe(true);
      expect(result.penaltyStrokes).toBe(1);
    });

    it('should add 7 yard bunker penalty instead of stroke penalty', () => {
      const result = calculateShotResult(
        200,
        'Wide Left',
        400,
        'Left',
        'Bunker',
        10,
        'Headwind' // No lateral effect
      );

      expect(result.hitHazard).toBe(true);
      expect(result.penaltyStrokes).toBe(0);
      expect(result.distancePenalty).toBe(22); // 7 (bunker) + 15 (wide shot)
    });

    it('should not hit hazard when shot direction does not match hazard location', () => {
      const result = calculateShotResult(
        200,
        'Wide Right',
        400,
        'Left', // hazard on left, but shot went right
        'Water',
        10,
        'Left-to-Right'
      );

      expect(result.hitHazard).toBe(false);
      expect(result.penaltyStrokes).toBe(0);
    });

    it('should hit front hazard when shot is less than 30% of current distance', () => {
      const result = calculateShotResult(
        50, // less than 30% of 400 = 120
        'Middle',
        400,
        'Front',
        'Water',
        10,
        'Left-to-Right'
      );

      expect(result.hitHazard).toBe(true);
      expect(result.penaltyStrokes).toBe(1);
    });
  });

  describe('wind drift effects', () => {
    it('should push shot right with Left-to-Right wind', () => {
      // Left shot with L-to-R wind should not hit left hazard
      // because wind pushes it right (lateralDeviation goes from -15 to -5)
      const result = calculateShotResult(
        200,
        'Left', // -15 base, but +10 from wind = -5
        400,
        'Left',
        'Water',
        10,
        'Left-to-Right'
      );

      expect(result.hitHazard).toBe(false);
    });

    it('should push shot left with Right-to-Left wind', () => {
      // Right shot with R-to-L wind should not hit right hazard
      const result = calculateShotResult(
        200,
        'Right', // +15 base, but -10 from wind = +5
        400,
        'Right',
        'Water',
        10,
        'Right-to-Left'
      );

      expect(result.hitHazard).toBe(false);
    });
  });

  describe('remaining distance calculations', () => {
    it('should never return negative remaining distance', () => {
      const result = calculateShotResult(
        500, // more than current distance
        'Middle',
        300,
        null,
        null,
        10,
        'Left-to-Right'
      );

      expect(result.remainingDistance).toBeGreaterThanOrEqual(0);
    });

    it('should correctly calculate remaining distance with all factors', () => {
      // Headwind: 200 * 0.9 = 180
      // Wide Left penalty: 15 yards
      // Left bunker: 7 yards
      // Remaining: 400 - 180 + 15 + 7 = 242
      const result = calculateShotResult(
        200,
        'Wide Left',
        400,
        'Left',
        'Bunker',
        10,
        'Headwind'
      );

      expect(result.finalDistance).toBe(180);
      expect(result.distancePenalty).toBe(22); // 15 + 7
      expect(result.remainingDistance).toBe(242); // 400 - 180 + 22
    });
  });
});
