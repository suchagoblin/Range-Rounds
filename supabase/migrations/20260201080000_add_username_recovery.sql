/*
  # Add Username Recovery Function

  Allows users to find their username by providing their security answer.
  This is useful when users forget their username but remember their security answer.
*/

-- Function to find username by security answer
CREATE OR REPLACE FUNCTION find_username_by_security_answer(
  p_question_id uuid,
  p_answer text
)
RETURNS text AS $$
DECLARE
  v_answer_hash text;
  v_username text;
BEGIN
  -- Hash the provided answer
  v_answer_hash := encode(digest(lower(trim(p_answer)), 'sha256'), 'hex');

  -- Find matching username
  SELECT p.username INTO v_username
  FROM profile_security_answers psa
  JOIN profiles p ON p.id = psa.profile_id
  WHERE psa.question_id = p_question_id
    AND psa.answer_hash = v_answer_hash
  LIMIT 1;

  RETURN v_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
