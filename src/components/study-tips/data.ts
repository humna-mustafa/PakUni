/**
 * Study Tips data - categories, tips, and encouragement messages
 */

export interface StudyTip {
  id: string;
  title: string;
  iconName: string;
  description: string;
  steps: string[];
  funFact?: string;
}

export interface StudyCategory {
  id: string;
  title: string;
  iconName: string;
  color: string;
  gradient: string[];
  tips: StudyTip[];
}

export const STUDY_CATEGORIES: StudyCategory[] = [
  {
    id: 'time-management',
    title: 'Time Management',
    iconName: 'time-outline',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
    tips: [
      {id: 'pomodoro', title: 'Pomodoro Technique', iconName: 'timer-outline', description: 'Study in short bursts with breaks!', steps: ['Study for 25 minutes straight', 'Take a 5-minute break', 'After 4 sessions, take a 15-30 minute break', 'Repeat! This keeps your brain fresh'], funFact: 'Invented by Francesco Cirillo using a tomato-shaped kitchen timer!'},
      {id: 'schedule', title: 'Daily Study Schedule', iconName: 'calendar-outline', description: 'Plan your day like a champion!', steps: ['Wake up at the same time daily', "Study hardest subjects when you're most alert", 'Take breaks for Namaz/prayers', 'Review what you learned before sleeping']},
      {id: 'no-procrastination', title: 'Beat Procrastination', iconName: 'flash-outline', description: 'Stop saying "I\'ll do it later"!', steps: ['Start with just 2 minutes of studying', 'Put your phone in another room', 'Tell yourself: "Just this one page"', 'Reward yourself after completing tasks'], funFact: 'Your brain releases dopamine when you complete tasks! Feel good by doing work!'},
    ],
  },
  {
    id: 'memory-tricks',
    title: 'Memory Tricks',
    iconName: 'bulb-outline',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#6EE5DD'],
    tips: [
      {id: 'mnemonics', title: 'Memory Tricks (Mnemonics)', iconName: 'text-outline', description: 'Remember things with fun tricks!', steps: ['Make sentences: "My Very Educated Mother Just Served Us Nachos" = Planets', 'Create rhymes: "In 1492, Columbus sailed the ocean blue"', 'Use mental pictures for vocabulary', 'Link new info to things you already know']},
      {id: 'spaced-repetition', title: 'Spaced Repetition', iconName: 'repeat-outline', description: 'Review at the right times!', steps: ['Review new material after 1 day', 'Then after 3 days', 'Then after 1 week', 'Finally after 2 weeks'], funFact: 'This is how top students memorize Quran and textbooks!'},
      {id: 'mind-maps', title: 'Mind Maps', iconName: 'git-network-outline', description: 'Draw your notes like a spider web!', steps: ['Write main topic in the center', 'Draw branches for subtopics', 'Use colors and pictures', 'Connect related ideas with lines']},
      {id: 'teach-others', title: 'Teach Someone Else', iconName: 'people-outline', description: 'The best way to learn is to teach!', steps: ['Explain the topic to your sibling/friend', "Pretend you're the teacher", 'Answer their questions', "If you can't explain it simply, review again!"], funFact: 'Einstein said: "If you can\'t explain it simply, you don\'t understand it well enough!"'},
    ],
  },
  {
    id: 'exam-prep',
    title: 'Exam Preparation',
    iconName: 'document-text-outline',
    color: '#45B7D1',
    gradient: ['#45B7D1', '#67CFE6'],
    tips: [
      {id: 'past-papers', title: 'Solve Past Papers', iconName: 'documents-outline', description: 'Practice with real exam questions!', steps: ['Get past 5-10 years papers', 'Time yourself like real exam', 'Check answers honestly', 'Focus on repeated questions - they appear again!'], funFact: 'Board exams often repeat 30-40% questions from past papers!'},
      {id: 'active-recall', title: 'Active Recall', iconName: 'chatbubble-ellipses-outline', description: 'Test yourself instead of just reading!', steps: ['Close your book after reading', 'Write down everything you remember', 'Check what you missed', 'Focus on what you forgot']},
      {id: 'exam-day', title: 'Exam Day Tips', iconName: 'ribbon-outline', description: 'Be prepared for the big day!', steps: ['Sleep 7-8 hours the night before', 'Eat a good breakfast (eggs, paratha, chai)', 'Reach venue 30 mins early', 'Read all questions first before answering', 'Start with questions you know best']},
    ],
  },
  {
    id: 'healthy-habits',
    title: 'Healthy Habits',
    iconName: 'sunny-outline',
    color: '#96CEB4',
    gradient: ['#96CEB4', '#B2DEC8'],
    tips: [
      {id: 'sleep', title: 'Power of Sleep', iconName: 'moon-outline', description: 'Your brain needs rest to learn!', steps: ['Sleep 7-9 hours every night', 'Go to bed at same time daily', 'No phones 1 hour before bed', 'Your brain processes learning during sleep!'], funFact: 'Staying up all night before exams actually HURTS your performance!'},
      {id: 'exercise', title: 'Exercise & Sports', iconName: 'fitness-outline', description: 'Move your body, boost your brain!', steps: ['Play cricket, football, or badminton daily', 'Even a 20-minute walk helps', 'Do stretches between study sessions', 'Exercise increases blood flow to brain!']},
      {id: 'brain-food', title: 'Brain Food', iconName: 'nutrition-outline', description: 'Eat foods that make you smarter!', steps: ['Eggs - best for memory', 'Almonds & walnuts - brain boosters', 'Bananas - energy for exams', 'Water - stay hydrated always!', 'Green tea - better than too much chai'], funFact: 'Your brain is 75% water! Dehydration makes you forget things!'},
      {id: 'breaks', title: 'Take Good Breaks', iconName: 'cafe-outline', description: 'Rest is part of studying!', steps: ['Take 5-10 min break every hour', 'Do NOT use phone during breaks (it tires brain more)', 'Walk around, drink water, do stretches', 'Chat with family briefly']},
    ],
  },
  {
    id: 'focus-tips',
    title: 'Stay Focused',
    iconName: 'eye-outline',
    color: '#DDA0DD',
    gradient: ['#DDA0DD', '#E9C0E9'],
    tips: [
      {id: 'study-space', title: 'Perfect Study Space', iconName: 'desktop-outline', description: 'Create your study corner!', steps: ['Find a quiet spot away from TV', 'Good lighting - protect your eyes', 'Keep only study materials on desk', 'Make it YOUR dedicated study zone']},
      {id: 'phone-control', title: 'Control Your Phone', iconName: 'phone-portrait-outline', description: "Don't let phone distract you!", steps: ['Put phone in different room', 'Use "Do Not Disturb" mode', "Tell friends you're studying", 'Check messages only during breaks'], funFact: 'It takes 23 minutes to refocus after a phone notification!'},
      {id: 'one-thing', title: 'One Subject at a Time', iconName: 'apps-outline', description: 'Multitasking is a myth!', steps: ['Focus on ONE subject per session', 'Finish chapter before switching', 'Your brain works best on one thing', 'Quality > Quantity']},
    ],
  },
  {
    id: 'smart-notes',
    title: 'Smart Note-Taking',
    iconName: 'journal-outline',
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FFE56D'],
    tips: [
      {id: 'cornell-method', title: 'Cornell Note Method', iconName: 'clipboard-outline', description: 'Organize notes like a pro!', steps: ['Divide page into 3 sections', 'Right side: Main notes during class', 'Left side: Key questions/keywords', 'Bottom: Summary after class']},
      {id: 'colors', title: 'Use Colors', iconName: 'color-palette-outline', description: 'Make notes colorful and memorable!', steps: ['Use different colors for headings', 'Highlight key definitions', 'Draw diagrams with colors', 'Your brain remembers colors better!']},
      {id: 'abbreviations', title: 'Quick Abbreviations', iconName: 'pencil-outline', description: 'Write faster, study smarter!', steps: ['b/c = because, w/ = with', 'Create your own shortcuts', 'Use arrows for "leads to"', 'Use symbols for "therefore"']},
    ],
  },
];

export const ENCOURAGEMENTS = [
  {iconName: 'star-outline', text: 'You can do this!'},
  {iconName: 'flash-outline', text: 'Pakistan ka mustaqbil aap hain!'},
  {iconName: 'rocket-outline', text: 'Dream big, study hard!'},
  {iconName: 'book-outline', text: 'Every page you read is progress!'},
  {iconName: 'ribbon-outline', text: 'Focus today, succeed tomorrow!'},
  {iconName: 'moon-outline', text: 'Mehnat ka phal meetha hota hai!'},
];

export const QUICK_TIPS = [
  {num: 1, text: 'Study in daylight - better for eyes & focus'},
  {num: 2, text: 'Read out loud - helps memory by 50%!'},
  {num: 3, text: 'Drink water, not too much chai'},
  {num: 4, text: 'Take notes by hand, not typing'},
  {num: 5, text: 'Teach concepts to others to master them'},
];
