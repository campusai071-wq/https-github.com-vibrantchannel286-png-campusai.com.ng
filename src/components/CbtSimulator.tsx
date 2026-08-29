import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  text: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer: string;
  examType: string;
  subject: string;
  year: number;
}

export const CbtSimulator: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aloc/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType: 'jamb', subject: 'mathematics', year: 2019 })
      });
      const data = await response.json();
      if (data.data) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (loading) return <div>Loading Simulator...</div>;
  if (questions.length === 0) return <div>No questions available.</div>;

  const question = questions[currentIndex];

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [question.id]: option });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">CBT Simulator</h2>
      <div className="mb-4">
        <p className="font-semibold">{currentIndex + 1}. {question.text}</p>
        <div className="mt-4 flex flex-col gap-2">
          {Object.entries(question.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`p-2 border rounded ${answers[question.id] === key ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              {key.toUpperCase()}. {value}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>Previous</button>
        <button disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>Next</button>
      </div>
    </div>
  );
};
