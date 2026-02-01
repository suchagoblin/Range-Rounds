import { useState, useEffect } from 'react';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SecurityQuestion } from '../types/golf';

export function SecurityQuestions() {
  const { profileId } = useAuth();
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [answer, setAnswer] = useState('');
  const [hasExistingQuestion, setHasExistingQuestion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [profileId]);

  const loadData = async () => {
    if (!profileId) return;

    setIsLoading(true);
    try {
      // Load available questions
      const { data: questionsData } = await supabase
        .from('security_questions')
        .select('id, question, display_order')
        .order('display_order');

      if (questionsData) {
        setQuestions(questionsData);
        if (questionsData.length > 0) {
          setSelectedQuestionId(questionsData[0].id);
        }
      }

      // Check if user has existing security question
      const { data: existingData } = await supabase
        .from('profile_security_answers')
        .select('id, question_id')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (existingData) {
        setHasExistingQuestion(true);
        setSelectedQuestionId(existingData.question_id);
      }
    } catch (error) {
      console.error('Error loading security questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileId || !selectedQuestionId || !answer.trim()) {
      setMessage({ type: 'error', text: 'Please select a question and provide an answer' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Hash the answer
      const { data: hashedAnswer, error: hashError } = await supabase
        .rpc('hash_security_answer', { answer: answer.trim() });

      if (hashError) throw hashError;

      // Delete existing answer if any
      await supabase
        .from('profile_security_answers')
        .delete()
        .eq('profile_id', profileId);

      // Insert new answer
      const { error: insertError } = await supabase
        .from('profile_security_answers')
        .insert({
          profile_id: profileId,
          question_id: selectedQuestionId,
          answer_hash: hashedAnswer
        });

      if (insertError) throw insertError;

      setHasExistingQuestion(true);
      setAnswer('');
      setMessage({ type: 'success', text: 'Security question saved! You can use this to recover your PIN.' });
    } catch (error) {
      console.error('Error saving security answer:', error);
      setMessage({ type: 'error', text: 'Failed to save security question. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!profileId) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await supabase
        .from('profile_security_answers')
        .delete()
        .eq('profile_id', profileId);

      setHasExistingQuestion(false);
      setAnswer('');
      setMessage({ type: 'success', text: 'Security question removed.' });
    } catch (error) {
      console.error('Error removing security answer:', error);
      setMessage({ type: 'error', text: 'Failed to remove security question.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-violet-400" />
          <h2 className="text-xl font-bold text-white">Account Recovery</h2>
        </div>
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-violet-400" />
        <h2 className="text-xl font-bold text-white">Account Recovery</h2>
        {hasExistingQuestion && (
          <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
            Set up
          </span>
        )}
      </div>

      <p className="text-slate-400 text-sm mb-4">
        Set up a security question to recover your account if you forget your PIN.
        This is optional but recommended.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Security Question
          </label>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-violet-500 focus:outline-none"
            disabled={isSaving}
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.question}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Your Answer
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={hasExistingQuestion ? 'Enter new answer to update' : 'Enter your answer'}
            className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            disabled={isSaving}
          />
          <p className="text-xs text-slate-500 mt-1">
            Answers are not case-sensitive
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/30'
              : 'bg-red-500/20 border border-red-500/30'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !answer.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium border border-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield className="w-4 h-4" />
            {hasExistingQuestion ? 'Update Security Question' : 'Save Security Question'}
          </button>

          {hasExistingQuestion && (
            <button
              onClick={handleRemove}
              disabled={isSaving}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium border border-red-500/30 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
