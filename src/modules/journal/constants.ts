export const WRITING_PROMPTS = [
  "What did you learn about yourself today?",
  "What was the highlight of your day, and why?",
  "Write about a small win that made you smile today.",
  "What is a challenge you faced today and how did you handle it?",
  "What are three things you are grateful for right now?",
  "What is a goal you want to achieve this week?",
  "Describe today in three words.",
  "How do you feel right now? Free write about it.",
  "Who made a positive impact on your life today?"
];

export const TEMPLATES = [
  {
    name: 'Gratitude Diary',
    emoji: '🌸',
    title: 'Daily Gratitude',
    preset: 'calm' as const,
    mood: 'great' as const,
    content: `<h3>Gratitude Journal</h3><p>Take a moment to reflect on three things you are grateful for today:</p><ol><li><i>I am grateful for...</i></li><li><i>I am grateful for...</i></li><li><i>I am grateful for...</i></li></ol><p>What is one thing that would make today wonderful?</p><ul><li><i>Today would be wonderful if...</i></li></ul>`
  },
  {
    name: 'Daily Reflection',
    emoji: '✨',
    title: 'Daily Reflection Log',
    preset: 'warm' as const,
    mood: 'good' as const,
    content: `<h3>Daily Reflection Log</h3><p><b>1. What went well today?</b></p><ul><li></li></ul><p><b>2. What could have gone better?</b></p><ul><li></li></ul><p><b>3. What did I learn or discover today?</b></p><ul><li></li></ul>`
  },
  {
    name: 'Zen Journal',
    emoji: '🍃',
    title: 'Zen Journal Entry',
    preset: 'evergreen' as const,
    mood: 'good' as const,
    content: `<h3>Zen Journal Entry</h3><p>Clear your mind. Take a deep breath. Write whatever comes to your mind without judgment...</p>`
  },
  {
    name: 'Work Log',
    emoji: '💼',
    title: 'Work Wins & Progress',
    preset: 'ocean' as const,
    mood: 'good' as const,
    content: `<h3>Work Wins & Progress</h3><p><b>Today's Main Tasks:</b></p><ul><li></li></ul><p><b>Wins & Progress:</b></p><ul><li></li></ul><p><b>Blockers / Challenges:</b></p><ul><li></li></ul>`
  }
];
