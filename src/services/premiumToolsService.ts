import { runAIWithFallback } from './geminiService';

export const analyzeCGPA = async (
  cgpa: number,
  semesterSummary: string,
  role: string = 'University Student',
  university: string = 'Nigerian University',
  course: string = 'General Course'
): Promise<string> => {
  try {
    const response = await runAIWithFallback(async (ai: any) => {
      return await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are an expert academic advisor for a student at ${university} studying ${course}.
Analyze the following CGPA trajectory and semester breakdown:
${semesterSummary}
Current Cumulative CGPA: ${cgpa}

Provide a concise 3-4 sentence diagnostic analysis covering:
1. Performance assessment and current degree class tier.
2. Areas of academic trajectory strength or concern.
3. Strategic actionable advice for upcoming semesters to maintain or upgrade degree classification.`,
      });
    });
    return response.text || `Current CGPA of ${cgpa} reflects your cumulative performance. Focus on high-unit core courses in upcoming semesters to maximize grade points.`;
  } catch (e) {
    console.error("analyzeCGPA error:", e);
    return `Current CGPA of ${cgpa} reflects your cumulative performance. Focus on high-unit core courses in upcoming semesters to maximize grade points.`;
  }
};
