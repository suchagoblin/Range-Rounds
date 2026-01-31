/*
  # Seed Famous Golf Courses (Fixed)

  ## Overview
  This migration seeds the database with 10 world-class golf courses inspired by famous real-world courses.
  Each course has realistic hole configurations with proper par, yardage, and strategic hazards.

  ## Courses Added
  
  1. **Pacific Cliffs** - Inspired by coastal championship courses
  2. **Island Green Resort** - Inspired by stadium golf courses
  3. **Azalea Springs** - Inspired by classic southern courses
  4. **Old Town Links** - Inspired by ancient Scottish links
  5. **Sandhills Classic** - Inspired by Carolina sandhills courses
  6. **Black Course** - Inspired by championship public courses
  7. **Cliffside Pines** - Inspired by west coast cliff courses
  8. **Windy Straits** - Inspired by lakeside links courses
  9. **Bay Harbor** - Inspired by dramatic harbor courses
  10. **Ocean Links** - Inspired by Atlantic coast courses
*/

-- Create a temporary function to generate course ID
CREATE OR REPLACE FUNCTION generate_course_with_holes(
  p_name text,
  p_description text,
  p_holes jsonb
) RETURNS void AS $$
DECLARE
  v_course_id uuid;
  v_hole jsonb;
BEGIN
  -- Insert course (not shared, but marked as famous)
  INSERT INTO courses (profile_id, name, description, hole_count, is_shared, is_famous)
  VALUES (NULL, p_name, p_description, 18, false, true)
  RETURNING id INTO v_course_id;

  -- Insert holes
  FOR v_hole IN SELECT * FROM jsonb_array_elements(p_holes)
  LOOP
    INSERT INTO course_holes (
      course_id,
      hole_number,
      par,
      yardage,
      hazard,
      hazard_type,
      wind_speed,
      wind_dir
    ) VALUES (
      v_course_id,
      (v_hole->>'hole_number')::int,
      (v_hole->>'par')::int,
      (v_hole->>'yardage')::int,
      v_hole->>'hazard',
      v_hole->>'hazard_type',
      (v_hole->>'wind_speed')::int,
      v_hole->>'wind_dir'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add is_famous column to courses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'is_famous'
  ) THEN
    ALTER TABLE courses ADD COLUMN is_famous boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Allow NULL profile_id for famous courses
ALTER TABLE courses ALTER COLUMN profile_id DROP NOT NULL;

-- 1. Pacific Cliffs (Coastal Championship)
SELECT generate_course_with_holes(
  'Pacific Cliffs Championship',
  'Dramatic oceanside course with breathtaking cliff-top holes and challenging coastal winds. Home to multiple major championships.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 380, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "W"},
    {"hole_number": 2, "par": 5, "yardage": 520, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 3, "par": 4, "yardage": 405, "hazard": "Left", "hazard_type": "Water", "wind_speed": 12, "wind_dir": "SW"},
    {"hole_number": 4, "par": 4, "yardage": 350, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "W"},
    {"hole_number": 5, "par": 3, "yardage": 180, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 6, "par": 5, "yardage": 550, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "SW"},
    {"hole_number": 7, "par": 3, "yardage": 110, "hazard": "Front", "hazard_type": "Water", "wind_speed": 15, "wind_dir": "W"},
    {"hole_number": 8, "par": 4, "yardage": 420, "hazard": "Left", "hazard_type": "Water", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 9, "par": 4, "yardage": 460, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "NW"},
    {"hole_number": 10, "par": 4, "yardage": 440, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "N"},
    {"hole_number": 11, "par": 4, "yardage": 395, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "NW"},
    {"hole_number": 12, "par": 3, "yardage": 205, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 13, "par": 4, "yardage": 445, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 14, "par": 5, "yardage": 580, "hazard": "Left", "hazard_type": "Water", "wind_speed": 8, "wind_dir": "SW"},
    {"hole_number": 15, "par": 4, "yardage": 400, "hazard": null, "hazard_type": null, "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 16, "par": 4, "yardage": 405, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 17, "par": 3, "yardage": 220, "hazard": "Left", "hazard_type": "Water", "wind_speed": 15, "wind_dir": "W"},
    {"hole_number": 18, "par": 5, "yardage": 540, "hazard": "Left", "hazard_type": "Water", "wind_speed": 12, "wind_dir": "W"}
  ]'::jsonb
);

-- 2. Island Green Resort (Stadium Course)
SELECT generate_course_with_holes(
  'Island Green Resort',
  'World-famous stadium course featuring the iconic island green par 3. A true test of precision and nerve.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 395, "hazard": "Right", "hazard_type": "Water", "wind_speed": 6, "wind_dir": "E"},
    {"hole_number": 2, "par": 5, "yardage": 535, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 5, "wind_dir": "SE"},
    {"hole_number": 3, "par": 3, "yardage": 180, "hazard": "Front", "hazard_type": "Water", "wind_speed": 7, "wind_dir": "E"},
    {"hole_number": 4, "par": 4, "yardage": 385, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 5, "wind_dir": "E"},
    {"hole_number": 5, "par": 4, "yardage": 455, "hazard": null, "hazard_type": null, "wind_speed": 6, "wind_dir": "SE"},
    {"hole_number": 6, "par": 4, "yardage": 395, "hazard": "Left", "hazard_type": "Water", "wind_speed": 8, "wind_dir": "E"},
    {"hole_number": 7, "par": 4, "yardage": 440, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "E"},
    {"hole_number": 8, "par": 5, "yardage": 525, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 5, "wind_dir": "NE"},
    {"hole_number": 9, "par": 4, "yardage": 465, "hazard": "Right", "hazard_type": "Water", "wind_speed": 7, "wind_dir": "E"},
    {"hole_number": 10, "par": 4, "yardage": 435, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "E"},
    {"hole_number": 11, "par": 5, "yardage": 555, "hazard": "Right", "hazard_type": "Water", "wind_speed": 5, "wind_dir": "SE"},
    {"hole_number": 12, "par": 4, "yardage": 365, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "E"},
    {"hole_number": 13, "par": 3, "yardage": 185, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "E"},
    {"hole_number": 14, "par": 4, "yardage": 470, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "E"},
    {"hole_number": 15, "par": 4, "yardage": 445, "hazard": "Left", "hazard_type": "Water", "wind_speed": 7, "wind_dir": "SE"},
    {"hole_number": 16, "par": 5, "yardage": 510, "hazard": "Right", "hazard_type": "Water", "wind_speed": 5, "wind_dir": "E"},
    {"hole_number": 17, "par": 3, "yardage": 145, "hazard": "Front", "hazard_type": "Water", "wind_speed": 10, "wind_dir": "E"},
    {"hole_number": 18, "par": 4, "yardage": 445, "hazard": "Left", "hazard_type": "Water", "wind_speed": 6, "wind_dir": "E"}
  ]'::jsonb
);

-- 3. Azalea Springs National
SELECT generate_course_with_holes(
  'Azalea Springs National',
  'Historic championship course known for its pristine conditions, strategic design, and challenging corner stretch.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 445, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 4, "wind_dir": "N"},
    {"hole_number": 2, "par": 5, "yardage": 575, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 3, "wind_dir": "NE"},
    {"hole_number": 3, "par": 4, "yardage": 350, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 5, "wind_dir": "E"},
    {"hole_number": 4, "par": 3, "yardage": 240, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "E"},
    {"hole_number": 5, "par": 4, "yardage": 495, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 4, "wind_dir": "SE"},
    {"hole_number": 6, "par": 3, "yardage": 200, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 5, "wind_dir": "S"},
    {"hole_number": 7, "par": 4, "yardage": 450, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 4, "wind_dir": "SW"},
    {"hole_number": 8, "par": 5, "yardage": 570, "hazard": null, "hazard_type": null, "wind_speed": 3, "wind_dir": "W"},
    {"hole_number": 9, "par": 4, "yardage": 460, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 5, "wind_dir": "W"},
    {"hole_number": 10, "par": 4, "yardage": 495, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 4, "wind_dir": "NW"},
    {"hole_number": 11, "par": 4, "yardage": 520, "hazard": "Left", "hazard_type": "Water", "wind_speed": 6, "wind_dir": "W"},
    {"hole_number": 12, "par": 3, "yardage": 155, "hazard": "Front", "hazard_type": "Water", "wind_speed": 8, "wind_dir": "SW"},
    {"hole_number": 13, "par": 5, "yardage": 510, "hazard": "Left", "hazard_type": "Water", "wind_speed": 5, "wind_dir": "W"},
    {"hole_number": 14, "par": 4, "yardage": 440, "hazard": null, "hazard_type": null, "wind_speed": 4, "wind_dir": "NW"},
    {"hole_number": 15, "par": 5, "yardage": 550, "hazard": "Front", "hazard_type": "Water", "wind_speed": 3, "wind_dir": "N"},
    {"hole_number": 16, "par": 3, "yardage": 190, "hazard": "Front", "hazard_type": "Water", "wind_speed": 6, "wind_dir": "NE"},
    {"hole_number": 17, "par": 4, "yardage": 440, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 5, "wind_dir": "E"},
    {"hole_number": 18, "par": 4, "yardage": 465, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 4, "wind_dir": "SE"}
  ]'::jsonb
);

-- 4. Old Town Links
SELECT generate_course_with_holes(
  'Old Town Links',
  'The ancient home of golf. This historic links course features centuries of tradition, deep bunkers, and the famous road hole.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 375, "hazard": null, "hazard_type": null, "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 2, "par": 4, "yardage": 415, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "SW"},
    {"hole_number": 3, "par": 4, "yardage": 395, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 15, "wind_dir": "W"},
    {"hole_number": 4, "par": 4, "yardage": 480, "hazard": null, "hazard_type": null, "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 5, "par": 5, "yardage": 570, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "SW"},
    {"hole_number": 6, "par": 4, "yardage": 380, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "W"},
    {"hole_number": 7, "par": 4, "yardage": 390, "hazard": null, "hazard_type": null, "wind_speed": 12, "wind_dir": "NW"},
    {"hole_number": 8, "par": 3, "yardage": 185, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 16, "wind_dir": "W"},
    {"hole_number": 9, "par": 4, "yardage": 370, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 10, "par": 4, "yardage": 385, "hazard": null, "hazard_type": null, "wind_speed": 12, "wind_dir": "E"},
    {"hole_number": 11, "par": 3, "yardage": 180, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 15, "wind_dir": "E"},
    {"hole_number": 12, "par": 4, "yardage": 350, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "SE"},
    {"hole_number": 13, "par": 4, "yardage": 435, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "E"},
    {"hole_number": 14, "par": 5, "yardage": 620, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "E"},
    {"hole_number": 15, "par": 4, "yardage": 455, "hazard": null, "hazard_type": null, "wind_speed": 10, "wind_dir": "NE"},
    {"hole_number": 16, "par": 4, "yardage": 425, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 16, "wind_dir": "E"},
    {"hole_number": 17, "par": 4, "yardage": 495, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "E"},
    {"hole_number": 18, "par": 4, "yardage": 360, "hazard": null, "hazard_type": null, "wind_speed": 12, "wind_dir": "SE"}
  ]'::jsonb
);

-- 5. Sandhills Classic No. 2
SELECT generate_course_with_holes(
  'Sandhills Classic No. 2',
  'Championship course featuring crowned greens, sandy waste areas, and strategic design. A true test of shotmaking.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 405, "hazard": null, "hazard_type": null, "wind_speed": 7, "wind_dir": "SW"},
    {"hole_number": 2, "par": 4, "yardage": 450, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "W"},
    {"hole_number": 3, "par": 4, "yardage": 380, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "SW"},
    {"hole_number": 4, "par": 5, "yardage": 565, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "W"},
    {"hole_number": 5, "par": 4, "yardage": 485, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "NW"},
    {"hole_number": 6, "par": 3, "yardage": 215, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 9, "wind_dir": "W"},
    {"hole_number": 7, "par": 4, "yardage": 400, "hazard": null, "hazard_type": null, "wind_speed": 7, "wind_dir": "SW"},
    {"hole_number": 8, "par": 4, "yardage": 470, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "W"},
    {"hole_number": 9, "par": 3, "yardage": 195, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "W"},
    {"hole_number": 10, "par": 5, "yardage": 600, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "NW"},
    {"hole_number": 11, "par": 4, "yardage": 445, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "N"},
    {"hole_number": 12, "par": 4, "yardage": 440, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "NE"},
    {"hole_number": 13, "par": 4, "yardage": 375, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "E"},
    {"hole_number": 14, "par": 4, "yardage": 445, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 6, "wind_dir": "SE"},
    {"hole_number": 15, "par": 3, "yardage": 210, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 9, "wind_dir": "S"},
    {"hole_number": 16, "par": 5, "yardage": 530, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "SW"},
    {"hole_number": 17, "par": 3, "yardage": 200, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "W"},
    {"hole_number": 18, "par": 4, "yardage": 445, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "SW"}
  ]'::jsonb
);

-- 6. The Black Course
SELECT generate_course_with_holes(
  'The Black Course',
  'One of the toughest public courses in the world. Brutally long and demanding, this course has hosted major championships.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 430, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "W"},
    {"hole_number": 2, "par": 4, "yardage": 395, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "SW"},
    {"hole_number": 3, "par": 3, "yardage": 215, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 9, "wind_dir": "W"},
    {"hole_number": 4, "par": 5, "yardage": 525, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "W"},
    {"hole_number": 5, "par": 4, "yardage": 455, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "NW"},
    {"hole_number": 6, "par": 4, "yardage": 410, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "N"},
    {"hole_number": 7, "par": 5, "yardage": 535, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "NE"},
    {"hole_number": 8, "par": 3, "yardage": 215, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "E"},
    {"hole_number": 9, "par": 4, "yardage": 445, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "SE"},
    {"hole_number": 10, "par": 4, "yardage": 495, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "S"},
    {"hole_number": 11, "par": 4, "yardage": 435, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "SW"},
    {"hole_number": 12, "par": 5, "yardage": 605, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "W"},
    {"hole_number": 13, "par": 3, "yardage": 165, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 9, "wind_dir": "W"},
    {"hole_number": 14, "par": 4, "yardage": 440, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "NW"},
    {"hole_number": 15, "par": 4, "yardage": 460, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 7, "wind_dir": "N"},
    {"hole_number": 16, "par": 4, "yardage": 490, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "NE"},
    {"hole_number": 17, "par": 3, "yardage": 210, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "E"},
    {"hole_number": 18, "par": 4, "yardage": 415, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "SE"}
  ]'::jsonb
);

-- 7. Cliffside Pines South
SELECT generate_course_with_holes(
  'Cliffside Pines South',
  'Spectacular clifftop course overlooking the Pacific. Features dramatic ocean views and challenging coastal winds.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 450, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 2, "par": 4, "yardage": 390, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "SW"},
    {"hole_number": 3, "par": 3, "yardage": 200, "hazard": "Left", "hazard_type": "Water", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 4, "par": 5, "yardage": 615, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 5, "par": 4, "yardage": 455, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "NW"},
    {"hole_number": 6, "par": 3, "yardage": 220, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "W"},
    {"hole_number": 7, "par": 4, "yardage": 480, "hazard": "Right", "hazard_type": "Water", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 8, "par": 4, "yardage": 420, "hazard": null, "hazard_type": null, "wind_speed": 10, "wind_dir": "SW"},
    {"hole_number": 9, "par": 5, "yardage": 575, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "W"},
    {"hole_number": 10, "par": 4, "yardage": 380, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "NW"},
    {"hole_number": 11, "par": 4, "yardage": 460, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 12, "par": 4, "yardage": 505, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 13, "par": 5, "yardage": 575, "hazard": "Left", "hazard_type": "Water", "wind_speed": 8, "wind_dir": "SW"},
    {"hole_number": 14, "par": 4, "yardage": 475, "hazard": null, "hazard_type": null, "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 15, "par": 4, "yardage": 475, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 16, "par": 3, "yardage": 230, "hazard": "Front", "hazard_type": "Water", "wind_speed": 15, "wind_dir": "W"},
    {"hole_number": 17, "par": 4, "yardage": 450, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "NW"},
    {"hole_number": 18, "par": 5, "yardage": 570, "hazard": "Right", "hazard_type": "Water", "wind_speed": 12, "wind_dir": "W"}
  ]'::jsonb
);

-- 8. Windy Straits
SELECT generate_course_with_holes(
  'Windy Straits Championship',
  'Dramatic links-style course on the lakeshore. Features extreme wind, deep bunkers, and stunning water views.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 445, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 15, "wind_dir": "W"},
    {"hole_number": 2, "par": 5, "yardage": 600, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "SW"},
    {"hole_number": 3, "par": 4, "yardage": 395, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 18, "wind_dir": "W"},
    {"hole_number": 4, "par": 4, "yardage": 475, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 15, "wind_dir": "W"},
    {"hole_number": 5, "par": 4, "yardage": 465, "hazard": null, "hazard_type": null, "wind_speed": 12, "wind_dir": "NW"},
    {"hole_number": 6, "par": 4, "yardage": 440, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 16, "wind_dir": "W"},
    {"hole_number": 7, "par": 3, "yardage": 220, "hazard": "Front", "hazard_type": "Water", "wind_speed": 20, "wind_dir": "W"},
    {"hole_number": 8, "par": 5, "yardage": 620, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 15, "wind_dir": "SW"},
    {"hole_number": 9, "par": 4, "yardage": 430, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 10, "par": 4, "yardage": 380, "hazard": null, "hazard_type": null, "wind_speed": 14, "wind_dir": "E"},
    {"hole_number": 11, "par": 5, "yardage": 590, "hazard": "Left", "hazard_type": "Water", "wind_speed": 16, "wind_dir": "E"},
    {"hole_number": 12, "par": 3, "yardage": 175, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 18, "wind_dir": "E"},
    {"hole_number": 13, "par": 4, "yardage": 395, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 15, "wind_dir": "SE"},
    {"hole_number": 14, "par": 4, "yardage": 370, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "E"},
    {"hole_number": 15, "par": 4, "yardage": 485, "hazard": null, "hazard_type": null, "wind_speed": 14, "wind_dir": "NE"},
    {"hole_number": 16, "par": 3, "yardage": 230, "hazard": "Front", "hazard_type": "Water", "wind_speed": 20, "wind_dir": "E"},
    {"hole_number": 17, "par": 4, "yardage": 465, "hazard": "Left", "hazard_type": "Water", "wind_speed": 18, "wind_dir": "E"},
    {"hole_number": 18, "par": 5, "yardage": 575, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 15, "wind_dir": "SE"}
  ]'::jsonb
);

-- 9. Bay Harbor Links
SELECT generate_course_with_holes(
  'Bay Harbor Links',
  'Dramatic harbor course with extreme elevation changes. Features stunning vistas and challenging terrain throughout.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 420, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 2, "par": 3, "yardage": 180, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "SW"},
    {"hole_number": 3, "par": 5, "yardage": 565, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "W"},
    {"hole_number": 4, "par": 4, "yardage": 480, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "W"},
    {"hole_number": 5, "par": 4, "yardage": 445, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "W"},
    {"hole_number": 6, "par": 3, "yardage": 210, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 16, "wind_dir": "W"},
    {"hole_number": 7, "par": 5, "yardage": 620, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "SW"},
    {"hole_number": 8, "par": 4, "yardage": 405, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 9, "par": 4, "yardage": 475, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "NW"},
    {"hole_number": 10, "par": 4, "yardage": 510, "hazard": null, "hazard_type": null, "wind_speed": 8, "wind_dir": "N"},
    {"hole_number": 11, "par": 4, "yardage": 385, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "NE"},
    {"hole_number": 12, "par": 3, "yardage": 205, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "E"},
    {"hole_number": 13, "par": 4, "yardage": 400, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 10, "wind_dir": "SE"},
    {"hole_number": 14, "par": 5, "yardage": 640, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 8, "wind_dir": "S"},
    {"hole_number": 15, "par": 3, "yardage": 155, "hazard": "Front", "hazard_type": "Water", "wind_speed": 16, "wind_dir": "SW"},
    {"hole_number": 16, "par": 4, "yardage": 425, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 17, "par": 4, "yardage": 490, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "W"},
    {"hole_number": 18, "par": 5, "yardage": 615, "hazard": "Left", "hazard_type": "Water", "wind_speed": 10, "wind_dir": "NW"}
  ]'::jsonb
);

-- 10. Ocean Links Championship
SELECT generate_course_with_holes(
  'Ocean Links Championship',
  'Legendary oceanfront course with relentless wind. Known as one of the toughest tests in championship golf.',
  '[
    {"hole_number": 1, "par": 4, "yardage": 430, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "E"},
    {"hole_number": 2, "par": 4, "yardage": 545, "hazard": "Left", "hazard_type": "Water", "wind_speed": 12, "wind_dir": "SE"},
    {"hole_number": 3, "par": 4, "yardage": 390, "hazard": null, "hazard_type": null, "wind_speed": 16, "wind_dir": "E"},
    {"hole_number": 4, "par": 4, "yardage": 470, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "E"},
    {"hole_number": 5, "par": 5, "yardage": 595, "hazard": "Left", "hazard_type": "Water", "wind_speed": 12, "wind_dir": "NE"},
    {"hole_number": 6, "par": 4, "yardage": 455, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 18, "wind_dir": "E"},
    {"hole_number": 7, "par": 3, "yardage": 215, "hazard": "Front", "hazard_type": "Water", "wind_speed": 20, "wind_dir": "E"},
    {"hole_number": 8, "par": 4, "yardage": 485, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 16, "wind_dir": "SE"},
    {"hole_number": 9, "par": 4, "yardage": 465, "hazard": null, "hazard_type": null, "wind_speed": 14, "wind_dir": "E"},
    {"hole_number": 10, "par": 5, "yardage": 605, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 11, "par": 4, "yardage": 475, "hazard": "Left", "hazard_type": "Water", "wind_speed": 16, "wind_dir": "W"},
    {"hole_number": 12, "par": 3, "yardage": 225, "hazard": "Front", "hazard_type": "Bunker", "wind_speed": 18, "wind_dir": "W"},
    {"hole_number": 13, "par": 4, "yardage": 405, "hazard": "Right", "hazard_type": "Bunker", "wind_speed": 14, "wind_dir": "SW"},
    {"hole_number": 14, "par": 5, "yardage": 555, "hazard": "Left", "hazard_type": "Bunker", "wind_speed": 12, "wind_dir": "W"},
    {"hole_number": 15, "par": 4, "yardage": 435, "hazard": null, "hazard_type": null, "wind_speed": 16, "wind_dir": "W"},
    {"hole_number": 16, "par": 4, "yardage": 490, "hazard": "Right", "hazard_type": "Water", "wind_speed": 18, "wind_dir": "W"},
    {"hole_number": 17, "par": 3, "yardage": 195, "hazard": "Front", "hazard_type": "Water", "wind_speed": 20, "wind_dir": "W"},
    {"hole_number": 18, "par": 5, "yardage": 585, "hazard": "Left", "hazard_type": "Water", "wind_speed": 14, "wind_dir": "NW"}
  ]'::jsonb
);

-- Clean up the temporary function
DROP FUNCTION generate_course_with_holes(text, text, jsonb);

-- Create index for famous courses
CREATE INDEX IF NOT EXISTS idx_courses_famous ON courses(is_famous) WHERE is_famous = true;
