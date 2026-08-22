import { type MindmapNode, type MindmapLink } from '../../../store/useAppStore';

export const createDefaultMindmapData = (): { nodes: MindmapNode[]; links: MindmapLink[] } => {
  const nodes: MindmapNode[] = [
    { id: 'root', text: 'Productivity Mind Map', x: 450, y: 250, color: 'gray', isRoot: true, icon: '🧠' },

    { id: 'mindset', text: 'Mindset', x: 260, y: 150, color: 'rose', parentId: 'root', side: 'left' },
    { id: 'planning', text: 'Planning', x: 640, y: 150, color: 'amber', parentId: 'root', side: 'right' },
    { id: 'habits', text: 'Habits', x: 260, y: 350, color: 'purple', parentId: 'root', side: 'left' },
    { id: 'wellbeing', text: 'Wellbeing', x: 640, y: 350, color: 'green', parentId: 'root', side: 'right' },
    { id: 'tools', text: 'Tools', x: 450, y: 440, color: 'blue', parentId: 'root', side: 'bottom' },

    { id: 'ms1', text: 'Positive Thinking', x: 40, y: 60, color: 'gray', parentId: 'mindset', side: 'left', icon: '⭐' },
    { id: 'ms2', text: 'Growth Mindset', x: 40, y: 120, color: 'gray', parentId: 'mindset', side: 'left', icon: '📈' },
    { id: 'ms3', text: 'Self Discipline', x: 40, y: 180, color: 'gray', parentId: 'mindset', side: 'left', icon: '🛡️' },
    { id: 'ms4', text: 'Focus & Clarity', x: 40, y: 240, color: 'gray', parentId: 'mindset', side: 'left', icon: '🎯' },

    { id: 'pl1', text: 'Set Goals', x: 860, y: 60, color: 'gray', parentId: 'planning', side: 'right', icon: '🎯' },
    { id: 'pl2', text: 'Prioritize Tasks', x: 860, y: 120, color: 'gray', parentId: 'planning', side: 'right', icon: '📋' },
    { id: 'pl3', text: 'Time Blocking', x: 860, y: 180, color: 'gray', parentId: 'planning', side: 'right', icon: '⏰' },
    { id: 'pl4', text: 'Review & Reflect', x: 860, y: 240, color: 'gray', parentId: 'planning', side: 'right', icon: '🔄' },

    { id: 'hb1', text: 'Daily Routine', x: 40, y: 310, color: 'gray', parentId: 'habits', side: 'left', icon: '⏰' },
    { id: 'hb2', text: 'Morning Ritual', x: 40, y: 370, color: 'gray', parentId: 'habits', side: 'left', icon: '🌅' },
    { id: 'hb3', text: 'Pomodoro Technique', x: 40, y: 430, color: 'gray', parentId: 'habits', side: 'left', icon: '⏱️' },
    { id: 'hb4', text: 'Digital Detox', x: 40, y: 490, color: 'gray', parentId: 'habits', side: 'left', icon: '📱' },

    { id: 'wb1', text: 'Exercise', x: 860, y: 310, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🏋️' },
    { id: 'wb2', text: 'Meditation', x: 860, y: 370, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🧘' },
    { id: 'wb3', text: 'Healthy Diet', x: 860, y: 430, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🍏' },
    { id: 'wb4', text: 'Sleep', x: 860, y: 490, color: 'gray', parentId: 'wellbeing', side: 'right', icon: '🌙' },

    { id: 'tl1', text: 'Notes', x: 250, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '🗒️' },
    { id: 'tl2', text: 'Task Manager', x: 380, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '☑️' },
    { id: 'tl3', text: 'Calendar', x: 520, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '📅' },
    { id: 'tl4', text: 'Mind Maps', x: 650, y: 560, color: 'gray', parentId: 'tools', side: 'bottom', icon: '🗺️' },
  ];

  const links: MindmapLink[] = [
    { source: 'root', target: 'mindset' },
    { source: 'root', target: 'planning' },
    { source: 'root', target: 'habits' },
    { source: 'root', target: 'wellbeing' },
    { source: 'root', target: 'tools' },

    { source: 'mindset', target: 'ms1' },
    { source: 'mindset', target: 'ms2' },
    { source: 'mindset', target: 'ms3' },
    { source: 'mindset', target: 'ms4' },

    { source: 'planning', target: 'pl1' },
    { source: 'planning', target: 'pl2' },
    { source: 'planning', target: 'pl3' },
    { source: 'planning', target: 'pl4' },

    { source: 'habits', target: 'hb1' },
    { source: 'habits', target: 'hb2' },
    { source: 'habits', target: 'hb3' },
    { source: 'habits', target: 'hb4' },

    { source: 'wellbeing', target: 'wb1' },
    { source: 'wellbeing', target: 'wb2' },
    { source: 'wellbeing', target: 'wb3' },
    { source: 'wellbeing', target: 'wb4' },

    { source: 'tools', target: 'tl1' },
    { source: 'tools', target: 'tl2' },
    { source: 'tools', target: 'tl3' },
    { source: 'tools', target: 'tl4' },
  ];

  return { nodes, links };
};
