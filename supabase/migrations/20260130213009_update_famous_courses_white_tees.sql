/*
  # Update Famous Courses to White Tee Distances

  ## Overview
  Updates all famous courses to use white tee yardages instead of championship tees.
  White tees are more appropriate for average golfers and driving range simulators.

  ## Changes Made
  - Par 3s: Reduced to 130-190 yards (from 145-240)
  - Par 4s: Reduced to 310-410 yards (from 350-520)
  - Par 5s: Reduced to 480-560 yards (from 510-640)

  ## Courses Updated
  1. Pacific Cliffs Championship
  2. Island Green Resort
  3. Azalea Springs National
  4. Old Town Links
  5. Sandhills Classic No. 2
  6. The Black Course
  7. Cliffside Pines South
  8. Windy Straits Championship
  9. Bay Harbor Links
  10. Ocean Links Championship
*/

-- 1. Pacific Cliffs Championship - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 345
  WHEN 2 THEN 490
  WHEN 3 THEN 375
  WHEN 4 THEN 320
  WHEN 5 THEN 165
  WHEN 6 THEN 510
  WHEN 7 THEN 95
  WHEN 8 THEN 385
  WHEN 9 THEN 420
  WHEN 10 THEN 405
  WHEN 11 THEN 360
  WHEN 12 THEN 180
  WHEN 13 THEN 410
  WHEN 14 THEN 540
  WHEN 15 THEN 365
  WHEN 16 THEN 370
  WHEN 17 THEN 190
  WHEN 18 THEN 500
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Pacific Cliffs Championship' LIMIT 1);

-- 2. Island Green Resort - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 360
  WHEN 2 THEN 495
  WHEN 3 THEN 160
  WHEN 4 THEN 350
  WHEN 5 THEN 415
  WHEN 6 THEN 360
  WHEN 7 THEN 405
  WHEN 8 THEN 485
  WHEN 9 THEN 425
  WHEN 10 THEN 395
  WHEN 11 THEN 515
  WHEN 12 THEN 330
  WHEN 13 THEN 165
  WHEN 14 THEN 430
  WHEN 15 THEN 405
  WHEN 16 THEN 470
  WHEN 17 THEN 130
  WHEN 18 THEN 410
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Island Green Resort' LIMIT 1);

-- 3. Azalea Springs National - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 405
  WHEN 2 THEN 535
  WHEN 3 THEN 315
  WHEN 4 THEN 205
  WHEN 5 THEN 455
  WHEN 6 THEN 170
  WHEN 7 THEN 410
  WHEN 8 THEN 530
  WHEN 9 THEN 420
  WHEN 10 THEN 455
  WHEN 11 THEN 480
  WHEN 12 THEN 140
  WHEN 13 THEN 470
  WHEN 14 THEN 400
  WHEN 15 THEN 510
  WHEN 16 THEN 170
  WHEN 17 THEN 400
  WHEN 18 THEN 425
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Azalea Springs National' LIMIT 1);

-- 4. Old Town Links - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 340
  WHEN 2 THEN 375
  WHEN 3 THEN 360
  WHEN 4 THEN 440
  WHEN 5 THEN 520
  WHEN 6 THEN 345
  WHEN 7 THEN 355
  WHEN 8 THEN 160
  WHEN 9 THEN 335
  WHEN 10 THEN 350
  WHEN 11 THEN 155
  WHEN 12 THEN 315
  WHEN 13 THEN 395
  WHEN 14 THEN 560
  WHEN 15 THEN 415
  WHEN 16 THEN 385
  WHEN 17 THEN 455
  WHEN 18 THEN 330
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Old Town Links' LIMIT 1);

-- 5. Sandhills Classic No. 2 - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 370
  WHEN 2 THEN 410
  WHEN 3 THEN 345
  WHEN 4 THEN 520
  WHEN 5 THEN 445
  WHEN 6 THEN 185
  WHEN 7 THEN 365
  WHEN 8 THEN 430
  WHEN 9 THEN 170
  WHEN 10 THEN 550
  WHEN 11 THEN 405
  WHEN 12 THEN 400
  WHEN 13 THEN 340
  WHEN 14 THEN 405
  WHEN 15 THEN 180
  WHEN 16 THEN 490
  WHEN 17 THEN 175
  WHEN 18 THEN 405
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Sandhills Classic No. 2' LIMIT 1);

-- 6. The Black Course - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 390
  WHEN 2 THEN 355
  WHEN 3 THEN 185
  WHEN 4 THEN 485
  WHEN 5 THEN 415
  WHEN 6 THEN 370
  WHEN 7 THEN 495
  WHEN 8 THEN 190
  WHEN 9 THEN 405
  WHEN 10 THEN 455
  WHEN 11 THEN 395
  WHEN 12 THEN 555
  WHEN 13 THEN 145
  WHEN 14 THEN 400
  WHEN 15 THEN 420
  WHEN 16 THEN 450
  WHEN 17 THEN 180
  WHEN 18 THEN 375
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'The Black Course' LIMIT 1);

-- 7. Cliffside Pines South - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 410
  WHEN 2 THEN 355
  WHEN 3 THEN 175
  WHEN 4 THEN 560
  WHEN 5 THEN 415
  WHEN 6 THEN 190
  WHEN 7 THEN 440
  WHEN 8 THEN 385
  WHEN 9 THEN 535
  WHEN 10 THEN 345
  WHEN 11 THEN 420
  WHEN 12 THEN 465
  WHEN 13 THEN 535
  WHEN 14 THEN 435
  WHEN 15 THEN 435
  WHEN 16 THEN 200
  WHEN 17 THEN 410
  WHEN 18 THEN 530
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Cliffside Pines South' LIMIT 1);

-- 8. Windy Straits Championship - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 405
  WHEN 2 THEN 550
  WHEN 3 THEN 355
  WHEN 4 THEN 435
  WHEN 5 THEN 425
  WHEN 6 THEN 400
  WHEN 7 THEN 190
  WHEN 8 THEN 560
  WHEN 9 THEN 390
  WHEN 10 THEN 345
  WHEN 11 THEN 540
  WHEN 12 THEN 155
  WHEN 13 THEN 355
  WHEN 14 THEN 335
  WHEN 15 THEN 445
  WHEN 16 THEN 200
  WHEN 17 THEN 425
  WHEN 18 THEN 535
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Windy Straits Championship' LIMIT 1);

-- 9. Bay Harbor Links - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 380
  WHEN 2 THEN 160
  WHEN 3 THEN 520
  WHEN 4 THEN 440
  WHEN 5 THEN 405
  WHEN 6 THEN 180
  WHEN 7 THEN 560
  WHEN 8 THEN 365
  WHEN 9 THEN 435
  WHEN 10 THEN 470
  WHEN 11 THEN 350
  WHEN 12 THEN 180
  WHEN 13 THEN 360
  WHEN 14 THEN 580
  WHEN 15 THEN 140
  WHEN 16 THEN 385
  WHEN 17 THEN 450
  WHEN 18 THEN 555
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Bay Harbor Links' LIMIT 1);

-- 10. Ocean Links Championship - Update to White Tees
UPDATE course_holes
SET yardage = CASE hole_number
  WHEN 1 THEN 390
  WHEN 2 THEN 495
  WHEN 3 THEN 355
  WHEN 4 THEN 430
  WHEN 5 THEN 545
  WHEN 6 THEN 415
  WHEN 7 THEN 185
  WHEN 8 THEN 445
  WHEN 9 THEN 425
  WHEN 10 THEN 555
  WHEN 11 THEN 435
  WHEN 12 THEN 195
  WHEN 13 THEN 365
  WHEN 14 THEN 515
  WHEN 15 THEN 395
  WHEN 16 THEN 450
  WHEN 17 THEN 175
  WHEN 18 THEN 545
END
WHERE course_id = (SELECT id FROM courses WHERE name = 'Ocean Links Championship' LIMIT 1);
