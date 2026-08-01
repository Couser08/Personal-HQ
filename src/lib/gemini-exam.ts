import type { StudyUnit, ExamQuestion, ExamGradingReport } from '../store/types';

const DEFAULT_MODEL = 'gemini-2.5-flash';

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

/**
 * Phase 1: Parses uploaded study material into structured units/topics.
 */
export async function parseStudyMaterial(
  apiKey: string,
  rawContent: string,
  model: string = DEFAULT_MODEL
): Promise<StudyUnit[]> {
  if (!apiKey?.trim()) throw new Error('Gemini API key is required.');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are a study material parser. Extract the content into structured units and topics.
Respond ONLY with valid JSON in this structure:
[
  {
    "id": "unit_1",
    "title": "Unit Name",
    "topics": [
      { "id": "topic_1_1", "title": "Topic Name", "keyPoints": ["Key point 1", "Key point 2"] }
    ]
  }
]`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: rawContent }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

  try {
    const parsed = JSON.parse(cleanJsonResponse(rawText));
    return parsed.map((u: StudyUnit, i: number) => ({
      ...u,
      id: `unit_${Date.now()}_${i}`,
      topics: u.topics.map((t, j) => ({
        ...t,
        id: `topic_${Date.now()}_${i}_${j}`,
      })),
    }));
  } catch {
    throw new Error('AI returned invalid JSON while parsing study material.');
  }
}

/**
 * Phase 2: Generates an exam based on structured study data and user spec.
 */
export async function generateExamPaper(
  apiKey: string,
  structuredData: StudyUnit[],
  userSpec: string,
  model: string = DEFAULT_MODEL
): Promise<{ title: string; totalMarks: number; questions: Omit<ExamQuestion, 'id'>[] }> {
  if (!apiKey?.trim()) throw new Error('Gemini API key is required.');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are a strict Exam Generator.
Create an exam based ONLY on the provided SOURCE MATERIAL. No hallucination.
User spec: ${userSpec}
Respond ONLY with valid JSON:
{
  "title": "Exam title",
  "totalMarks": 100,
  "questions": [
    { "type": "mcq", "questionText": "...", "options": ["A","B","C","D"], "correctAnswer": "A", "marks": 5 },
    { "type": "subjective", "questionText": "...", "correctAnswer": "key points...", "marks": 10 }
  ]
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(structuredData) }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  try {
    return JSON.parse(cleanJsonResponse(rawText));
  } catch {
    throw new Error('AI returned invalid JSON for exam paper.');
  }
}

/**
 * Phase 3: Grade exam answers — returns full report with totalScore, feedback array, weaknessSummary.
 */
export async function gradeExamAttempt(
  apiKey: string,
  questions: ExamQuestion[],
  userAnswers: Record<string, string>,
  model: string = DEFAULT_MODEL
): Promise<ExamGradingReport> {
  if (!apiKey?.trim()) throw new Error('Gemini API key is required.');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const payload = questions.map(q => ({
    questionId: q.id,
    questionText: q.questionText,
    correctAnswer: q.correctAnswer,
    userAnswer: userAnswers[q.id] || '',
    marks: q.marks,
    type: q.type,
  }));

  const systemInstruction = `Grade each answer fairly. Return ONLY valid JSON:
{
  "totalScore": 45,
  "weaknessSummary": "Student struggled with X and Y concepts.",
  "feedback": [
    {
      "questionId": "q1",
      "marksGiven": 4,
      "isCorrect": true,
      "missingPoints": [],
      "wrongPoints": [],
      "explanation": "Good answer covering all key points."
    }
  ]
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  try {
    return JSON.parse(cleanJsonResponse(rawText)) as ExamGradingReport;
  } catch {
    throw new Error('AI returned invalid JSON for grading.');
  }
}
