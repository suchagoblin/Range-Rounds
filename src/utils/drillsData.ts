import { Drill } from '../types/drills';

export const DRILLS_DATA: Drill[] = [
    // Putting
    {
        id: 'putting-gate',
        title: 'The Gate Drill',
        description: 'Perfect your putting path and impact by swinging through a tight gate.',
        difficulty: 'Intermediate',
        category: 'Putting',
        rating: 4.8,
        steps: [
            'Find a straight putt about 3-4 feet from the hole.',
            'Place your putter head on the ground behind the ball.',
            'Insert two tees into the ground, one just outside the toe and one just outside the heel of your putter.',
            'Practice hitting putts without your putter touching either tee.',
            'If you hit a tee, your path is offline.'
        ]
    },
    {
        id: 'putting-clock',
        title: 'The Clock Drill',
        description: 'Build pressure and confidence by making consecutive short putts.',
        difficulty: 'Intermediate',
        category: 'Putting',
        rating: 4.5,
        steps: [
            'Place 4 balls around the hole at 12, 3, 6, and 9 o\'clock positions.',
            'Start at 3 feet from the hole.',
            'Make all 4 putts in a row.',
            'If you miss one, start over from the beginning.',
            'Once mastered, move back to 4 feet, then 5 feet.'
        ]
    },
    {
        id: 'putting-ladder',
        title: 'The Ladder Drill',
        description: 'Master distance control by putting to specific yardages.',
        difficulty: 'Beginner',
        category: 'Putting',
        rating: 4.2,
        steps: [
            'Place a tee at 10ft, 20ft, 30ft, and 40ft from your starting spot.',
            'Try to get the ball to stop as close to each tee as possible.',
            'Start at 10ft and work your way up to 40ft.',
            'Then work your way back down.',
            'Bonus: The ball must go past the tee but no more than 2 feet past.'
        ]
    },

    // Chipping
    {
        id: 'chipping-landing',
        title: 'Landing Spot',
        description: 'Focus on where the ball lands, not where it stops.',
        difficulty: 'Beginner',
        category: 'Chipping',
        rating: 4.6,
        steps: [
            'Place a small towel or headcover on the green about halfway to the hole.',
            'Hit chip shots trying to land the ball directly on the towel.',
            'Do not worry about if it rolls into the hole yet.',
            'This teaches you to visualize the carry distance vs roll out.'
        ]
    },
    {
        id: 'chipping-up-down',
        title: 'Up & Down Challenge',
        description: 'Simulate real scoring pressure around the green.',
        difficulty: 'Advanced',
        category: 'Chipping',
        rating: 4.9,
        steps: [
            'Take one ball and throw it into a random spot in the rough around the green.',
            'Play the chip shot onto the green.',
            'Putt out until the ball is in the hole.',
            'If you take 2 strokes total (1 chip + 1 putt), that is a "save".',
            'Try to get 5 saves out of 9 attempts.'
        ]
    },

    // Full Swing
    {
        id: 'swing-tempo',
        title: 'Tempo Drill',
        description: 'Find your natural rhythm and smooth out jerky transitions.',
        difficulty: 'Beginner',
        category: 'Full Swing',
        rating: 4.7,
        steps: [
            'Tee up 3 balls in a row.',
            'Take your address posture but do not hit a ball yet.',
            'Swing back and through continuously (like a pendulum) without stopping.',
            'Count "1" on backswing, "2" on impact.',
            'Step forward and hit the balls while maintaining that continuous rhythm.'
        ]
    },
    {
        id: 'swing-feet-together',
        title: 'Feet Together',
        description: 'Improve balance and rotation by neutralizing your lower body.',
        difficulty: 'Intermediate',
        category: 'Full Swing',
        rating: 4.4,
        steps: [
            'Take your normal grip but place your feet completely together (touching).',
            'Make 3/4 swings (hands to shoulder height).',
            'Focus on rotating your chest back and through.',
            'This forces you to stay centered and balanced.',
            'If you sway or lunge, you will lose balance immediately.'
        ]
    },
    // Driving
    {
        id: 'driving-headcover',
        title: 'Headcover Drill',
        description: 'Keep your swing connected and sync your arms with your body rotation.',
        difficulty: 'Beginner',
        category: 'Driving',
        rating: 4.7,
        steps: [
            'Place a headcover under your trailing armpit (right arm for righties).',
            'Take 3/4 swings with your driver, keeping the headcover pinned.',
            'If the headcover drops early, your arms are disconnecting from your body.',
            'Focus on turning your chest to move the club, not just lifting your arms.'
        ]
    },
    {
        id: 'driving-chair',
        title: 'The Chair Drill',
        description: 'Eliminate lateral sway and build a powerful, centered turn.',
        difficulty: 'Intermediate',
        category: 'Driving',
        rating: 4.5,
        steps: [
            'Place a chair (or alignment stick) next to your trail hip.',
            'Make your backswing without bumping into the chair.',
            'Feel your trail hip rotating "back and around" rather than sliding sideways.',
            'This creates more torque and power for your drives.'
        ]
    },
    // Irons
    {
        id: 'irons-towel',
        title: 'The Towel Drill',
        description: 'The ultimate drill for connection and consistent ball striking.',
        difficulty: 'Intermediate',
        category: 'Irons',
        rating: 4.9,
        steps: [
            'Place a towel across your chest and under both armpits.',
            'Make half-swings with a 7-iron, keeping the towel in place.',
            'This forces your body and arms to move as a single unit.',
            'Great for fixing "flying elbows" and inconsistent contact.'
        ]
    },
    {
        id: 'irons-divot',
        title: 'Divot Discipline',
        description: 'Ensure you hit the ball first, then the ground for crisp iron shots.',
        difficulty: 'Advanced',
        category: 'Irons',
        rating: 4.8,
        steps: [
            'Place a piece of tape or a tee completely flat on the ground.',
            'Place your ball 1 inch in front of the tape.',
            'Hit the ball without disturbing the tape.',
            'If you hit the tape, you are hitting "fat" (ground first).',
            'Focus on shifting your weight forward to the lead side at impact.'
        ]
    }
];
