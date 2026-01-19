import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING, FONTS, BORDER_RADIUS} from '../constants/theme';
import {Icon} from '../components/icons';
import {useTheme} from '../contexts/ThemeContext';
import {Haptics} from '../utils/haptics';

const {width} = Dimensions.get('window');

interface Career {
  id: string;
  title: string;
  iconName: string;
  color: string;
  tagline: string;
  description: string;
  whatTheyDo: string[];
  funFact: string;
  becomeOne: string;
  superpowers: string[];
  coolTools: string[];
  salary: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Super Hard';
}

const KIDS_CAREERS: Career[] = [
  {
    id: 'doctor',
    title: 'Doctor',
    iconName: 'medkit',
    color: '#EF5350',
    tagline: 'Heal People & Save Lives!',
    description: 'Doctors are like real-life superheroes! They help sick people feel better and save lives every day.',
    whatTheyDo: [
      'Check if you are healthy',
      'Give medicine to make you feel better',
      'Do surgeries to fix problems inside body',
      'Help babies come into the world',
    ],
    funFact: 'The first Pakistani female doctor was Dr. Rashid Jahan, who inspired many girls to become doctors!',
    becomeOne: 'Study hard in science, pass MDCAT exam, complete 5 years of medical school + 1 year training',
    superpowers: ['Healing Touch', 'Problem Solving', 'Staying Calm', 'Never Giving Up'],
    coolTools: ['Stethoscope', 'X-Ray Machine', 'Medicine', 'Surgical Tools'],
    salary: 'PKR 100,000 - 800,000/month',
    difficulty: 'Super Hard',
  },
  {
    id: 'engineer',
    title: 'Engineer',
    iconName: 'construct',
    color: '#42A5F5',
    tagline: 'Build Amazing Things!',
    description: 'Engineers are the builders of the world! They create buildings, bridges, computers, rockets, and everything cool.',
    whatTheyDo: [
      'Design buildings and bridges',
      'Create apps and video games',
      'Build robots and machines',
      'Make cars and airplanes work',
    ],
    funFact: 'The Pakistan Engineering Council has over 200,000 registered engineers. Some helped build the Karakoram Highway!',
    becomeOne: 'Be good at math, pass ECAT exam, complete 4 years of engineering university',
    superpowers: ['Problem Solving', 'Creativity', 'Math Wizardry', 'Building Stuff'],
    coolTools: ['Computer', 'Calculator', 'Drawing Tools', 'Measuring Tape'],
    salary: 'PKR 60,000 - 500,000/month',
    difficulty: 'Hard',
  },
  {
    id: 'programmer',
    title: 'Programmer',
    iconName: 'code-slash',
    color: '#7E57C2',
    tagline: 'Create Apps & Games!',
    description: 'Programmers are like wizards who speak to computers! They create the apps, games, and websites you love.',
    whatTheyDo: [
      'Create video games like PUBG and Free Fire',
      'Build apps for your phone',
      'Make websites and social media',
      'Teach robots and AI to think',
    ],
    funFact: 'Arfa Karim from Pakistan was the youngest Microsoft Certified Professional at age 9! You can start coding today!',
    becomeOne: 'Learn coding languages, practice on computer, get degree in Computer Science',
    superpowers: ['Logic Master', 'Creative Thinking', 'Patience', 'Learning Fast'],
    coolTools: ['Computer', 'Coding Languages', 'Coffee', 'Internet'],
    salary: 'PKR 80,000 - 1,000,000/month (can earn in $$ too!)',
    difficulty: 'Medium',
  },
  {
    id: 'pilot',
    title: 'Pilot',
    iconName: 'airplane',
    color: '#26A69A',
    tagline: 'Fly High in the Sky!',
    description: 'Pilots are the captains of the sky! They fly huge airplanes and take people on amazing journeys around the world.',
    whatTheyDo: [
      'Fly airplanes across the world',
      'Keep passengers safe in the sky',
      'Navigate through clouds and weather',
      'Talk to control towers',
    ],
    funFact: 'PIA was one of the first airlines in Asia! Pakistani pilots fly to over 30 countries.',
    becomeOne: 'Good eyesight, join CAA cadet program or private flying school, pass medical tests',
    superpowers: ['Sharp Eyes', 'Quick Decisions', 'Staying Calm', 'Navigation Skills'],
    coolTools: ['Airplane', 'Flight Computer', 'Radio', 'Maps'],
    salary: 'PKR 300,000 - 1,500,000/month',
    difficulty: 'Hard',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    iconName: 'school',
    color: '#66BB6A',
    tagline: 'Shape Future Leaders!',
    description: 'Teachers are the builders of minds! They help children learn and grow into amazing adults.',
    whatTheyDo: [
      'Teach subjects like math, science, English',
      'Help students understand difficult things',
      'Organize fun activities and projects',
      'Guide students to achieve dreams',
    ],
    funFact: 'Dr. Abdul Qadeer Khan was taught by amazing teachers who inspired him to become a scientist!',
    becomeOne: 'Get good education, complete B.Ed degree, love to help others learn',
    superpowers: ['Patience', 'Explaining Clearly', 'Caring Heart', 'Inspiring Others'],
    coolTools: ['Books', 'Whiteboard', 'Computer', 'Creative Ideas'],
    salary: 'PKR 35,000 - 200,000/month',
    difficulty: 'Medium',
  },
  {
    id: 'artist',
    title: 'Artist / Designer',
    iconName: 'brush',
    color: '#EC407A',
    tagline: 'Create Beautiful Things!',
    description: 'Artists make the world beautiful! They create paintings, designs, animations, and everything pretty you see.',
    whatTheyDo: [
      'Draw and paint pictures',
      'Design logos and posters',
      'Create cartoon characters',
      'Make beautiful decorations',
    ],
    funFact: 'Pakistani truck art is famous worldwide! Artists earn in dollars by selling their art online.',
    becomeOne: 'Practice drawing daily, learn design software, join art school (optional)',
    superpowers: ['Creativity', 'Color Sense', 'Imagination', 'Patience'],
    coolTools: ['Pencils & Brushes', 'Computer/Tablet', 'Photoshop', 'Colors'],
    salary: 'PKR 50,000 - 400,000/month (can earn $$ freelancing!)',
    difficulty: 'Medium',
  },
  {
    id: 'scientist',
    title: 'Scientist',
    iconName: 'flask',
    color: '#5C6BC0',
    tagline: 'Discover New Things!',
    description: 'Scientists are the explorers of knowledge! They discover cures for diseases, secrets of space, and how nature works.',
    whatTheyDo: [
      'Do experiments in labs',
      'Discover new medicines',
      'Study space and stars',
      'Find solutions to world problems',
    ],
    funFact: 'Dr. Abdus Salam from Pakistan won the Nobel Prize in Physics! He was the first Pakistani to win it.',
    becomeOne: 'Love asking questions, study science subjects, do research at university',
    superpowers: ['Curiosity', 'Careful Observation', 'Critical Thinking', 'Patience'],
    coolTools: ['Microscope', 'Lab Equipment', 'Computer', 'Research Papers'],
    salary: 'PKR 80,000 - 500,000/month',
    difficulty: 'Super Hard',
  },
  {
    id: 'chef',
    title: 'Chef',
    iconName: 'restaurant',
    color: '#FF7043',
    tagline: 'Cook Delicious Food!',
    description: 'Chefs are food artists! They create yummy dishes that make people happy and bring families together.',
    whatTheyDo: [
      'Create new recipes',
      'Cook delicious meals',
      'Run restaurant kitchens',
      'Appear on cooking shows',
    ],
    funFact: 'Pakistani biryani, nihari, and seekh kebabs are famous worldwide! Many Pakistani chefs work in top hotels.',
    becomeOne: 'Practice cooking at home, join culinary school, work in restaurants',
    superpowers: ['Taste Mastery', 'Creativity', 'Speed', 'Time Management'],
    coolTools: ['Knives', 'Pots & Pans', 'Spices', 'Oven'],
    salary: 'PKR 40,000 - 300,000/month',
    difficulty: 'Medium',
  },
  {
    id: 'athlete',
    title: 'Athlete / Sports Star',
    iconName: 'football',
    color: '#29B6F6',
    tagline: 'Win Medals & Championships!',
    description: 'Athletes are the champions! They represent their country in sports and inspire millions with their skills.',
    whatTheyDo: [
      'Play sports professionally',
      'Represent Pakistan internationally',
      'Train hard every day',
      'Win medals and trophies',
    ],
    funFact: 'Jahangir Khan won the World Squash Championship 10 times! Pakistan has produced many cricket legends.',
    becomeOne: 'Start playing a sport early, practice daily, join sports academies',
    superpowers: ['Physical Fitness', 'Determination', 'Team Spirit', 'Never Giving Up'],
    coolTools: ['Sports Equipment', 'Training Gear', 'Healthy Food', 'Coach'],
    salary: 'PKR 100,000 - Millions/month for top players',
    difficulty: 'Hard',
  },
  {
    id: 'youtuber',
    title: 'Content Creator',
    iconName: 'phone-portrait',
    color: '#FF5252',
    tagline: 'Entertain Millions Online!',
    description: 'Content creators are the new stars! They make videos, streams, and content that millions of people watch and love.',
    whatTheyDo: [
      'Create fun videos for YouTube',
      'Stream games on Twitch',
      'Share knowledge online',
      'Build a community of fans',
    ],
    funFact: 'Many Pakistani YouTubers have millions of subscribers! You can start with just a phone.',
    becomeOne: 'Choose your niche, create content regularly, learn video editing',
    superpowers: ['Creativity', 'Consistency', 'Communication', 'Understanding Trends'],
    coolTools: ['Phone/Camera', 'Microphone', 'Editing Software', 'Internet'],
    salary: 'PKR 0 - Millions/month (depends on views!)',
    difficulty: 'Easy',
  },
];

// Quiz questions for each career type
const CAREER_QUIZ_QUESTIONS: Record<string, {question: string; options: string[]; correctIndex: number; explanation: string}[]> = {
  doctor: [
    {question: "Do you like helping people feel better?", options: ["Yes! I love helping!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Great! Doctors need to love helping people."},
    {question: "Are you okay with studying for many years?", options: ["Yes, I'm patient!", "Maybe", "No, that's too long"], correctIndex: 0, explanation: "Being a doctor requires about 6+ years of study!"},
    {question: "Can you stay calm when someone is hurt?", options: ["Yes, I stay calm", "I try to", "I get scared"], correctIndex: 0, explanation: "Doctors need to stay calm in emergencies."},
  ],
  engineer: [
    {question: "Do you like building things?", options: ["Yes! I love building!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Engineers build amazing things!"},
    {question: "Are you good at solving puzzles?", options: ["Yes, I love puzzles!", "Kind of", "Not really"], correctIndex: 0, explanation: "Engineering is like solving big puzzles!"},
    {question: "Do you enjoy math?", options: ["Yes!", "It's okay", "No"], correctIndex: 0, explanation: "Math is an important tool for engineers."},
  ],
  pilot: [
    {question: "Do you love airplanes?", options: ["Yes! They're amazing!", "They're okay", "Not really"], correctIndex: 0, explanation: "Pilots fly these incredible machines!"},
    {question: "Are you brave?", options: ["Yes, very brave!", "Kind of", "Not really"], correctIndex: 0, explanation: "Pilots need to be brave and confident!"},
    {question: "Can you stay focused for long periods?", options: ["Yes!", "Sometimes", "I get distracted easily"], correctIndex: 0, explanation: "Flying requires lots of concentration!"},
  ],
  teacher: [
    {question: "Do you enjoy explaining things to others?", options: ["Yes! I love teaching!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Teachers help others learn new things!"},
    {question: "Are you patient?", options: ["Yes, very patient!", "Kind of", "Not really"], correctIndex: 0, explanation: "Patience is a teacher's superpower!"},
    {question: "Do you like being around kids?", options: ["Yes!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Teachers work with students every day!"},
  ],
  artist: [
    {question: "Do you love drawing or painting?", options: ["Yes! All the time!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Artists express themselves through art!"},
    {question: "Are you creative?", options: ["Yes, very!", "Kind of", "Not really"], correctIndex: 0, explanation: "Creativity is an artist's main tool!"},
    {question: "Do you see the world in colors?", options: ["Yes!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Artists notice beauty everywhere!"},
  ],
  scientist: [
    {question: "Do you like asking 'Why?' about everything?", options: ["Yes! I'm curious!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Scientists are always curious!"},
    {question: "Do you enjoy experiments?", options: ["Yes!", "Sometimes", "No"], correctIndex: 0, explanation: "Experiments help scientists discover new things!"},
    {question: "Are you patient enough to try again if something fails?", options: ["Yes!", "Sometimes", "I give up easily"], correctIndex: 0, explanation: "Scientists learn from failures!"},
  ],
  athlete: [
    {question: "Do you love playing sports?", options: ["Yes! Every day!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Athletes play sports professionally!"},
    {question: "Can you handle losing sometimes?", options: ["Yes, I learn from it!", "It's hard but okay", "No, I hate losing"], correctIndex: 0, explanation: "Even champions lose sometimes!"},
    {question: "Are you willing to exercise every day?", options: ["Yes!", "Maybe", "No"], correctIndex: 0, explanation: "Athletes train their bodies daily!"},
  ],
  youtuber: [
    {question: "Do you enjoy making videos?", options: ["Yes! It's fun!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Content creators make videos people love!"},
    {question: "Are you comfortable being on camera?", options: ["Yes!", "A little nervous", "No way!"], correctIndex: 0, explanation: "Being on camera gets easier with practice!"},
    {question: "Can you be consistent and post regularly?", options: ["Yes!", "I'll try", "That's hard"], correctIndex: 0, explanation: "Success needs consistency!"},
  ],
};

const CareerExplorerKidsScreen = () => {
  const {colors, isDark} = useTheme();
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return colors.success;
      case 'Medium': return colors.warning;
      case 'Hard': return '#FF7043';
      default: return colors.error;
    }
  };

  // Start quiz for selected career
  const handleStartQuiz = () => {
    if (!selectedCareer) return;
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setShowQuiz(true);
    Haptics.light();
  };

  // Handle quiz answer
  const handleAnswer = (answerIndex: number) => {
    if (!selectedCareer) return;
    const questions = CAREER_QUIZ_QUESTIONS[selectedCareer.id] || [];
    const currentQ = questions[currentQuestion];
    
    if (answerIndex === currentQ.correctIndex) {
      setScore(prev => prev + 1);
      Haptics.success();
    } else {
      Haptics.light();
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  // Get quiz result message
  const getQuizResult = () => {
    if (!selectedCareer) return {title: '', message: '', emoji: ''};
    const questions = CAREER_QUIZ_QUESTIONS[selectedCareer.id] || [];
    const percentage = (score / questions.length) * 100;
    
    if (percentage >= 80) {
      return {
        title: "Perfect Match! 🎉",
        message: `You would make an AMAZING ${selectedCareer.title}! You have all the right qualities!`,
        emoji: '🌟',
      };
    } else if (percentage >= 50) {
      return {
        title: "Good Match! 👍",
        message: `${selectedCareer.title} could be a good career for you! Keep exploring and learning!`,
        emoji: '✨',
      };
    } else {
      return {
        title: "Keep Exploring! 🔍",
        message: `Maybe try exploring other careers too! There might be something else perfect for you!`,
        emoji: '🚀',
      };
    }
  };

  const renderCareerCard = (career: Career) => (
    <TouchableOpacity
      key={career.id}
      style={[styles.careerCard, {backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: career.color}]}
      onPress={() => {
        setSelectedCareer(career);
        setShowDetail(true);
      }}>
      <View style={[styles.emojiCircle, {backgroundColor: career.color + '20'}]}>
        <Icon name={career.iconName} family="Ionicons" size={28} color={career.color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.careerTitle, {color: colors.text}]}>{career.title}</Text>
        <Text style={[styles.tagline, {color: colors.textSecondary}]}>{career.tagline}</Text>
        <View style={styles.difficultyRow}>
          <View style={[styles.difficultyBadge, {backgroundColor: getDifficultyColor(career.difficulty) + '20'}]}>
            <Text style={[styles.difficultyText, {color: getDifficultyColor(career.difficulty)}]}>
              {career.difficulty}
            </Text>
          </View>
        </View>
      </View>
      <Icon name="arrow-forward" family="Ionicons" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const renderDetailView = () => {
    if (!selectedCareer) return null;

    return (
      <ScrollView style={[styles.detailContainer, {backgroundColor: colors.background}]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.detailHeader, {backgroundColor: selectedCareer.color}]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowDetail(false)}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="arrow-back" family="Ionicons" size={16} color={colors.white} />
              <Text style={[styles.backBtnText, {color: colors.white, marginLeft: 4}]}>Back</Text>
            </View>
          </TouchableOpacity>
          <Icon name={selectedCareer.iconName} family="Ionicons" size={64} color={colors.white} />
          <Text style={[styles.detailTitle, {color: colors.white}]}>{selectedCareer.title}</Text>
          <Text style={[styles.detailTagline, {color: colors.white}]}>{selectedCareer.tagline}</Text>
        </View>

        {/* Description */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm}}>
            <Icon name="reader-outline" family="Ionicons" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0, marginLeft: 6}]}>What is a {selectedCareer.title}?</Text>
          </View>
          <Text style={[styles.sectionText, {color: colors.text}]}>{selectedCareer.description}</Text>
        </View>

        {/* What They Do */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm}}>
            <Icon name="flag-outline" family="Ionicons" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0, marginLeft: 6}]}>What They Do</Text>
          </View>
          <View style={styles.bulletList}>
            {selectedCareer.whatTheyDo.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <View style={{marginRight: SPACING.sm}}>
                  <Icon name="checkmark" family="Ionicons" size={16} color={colors.success} />
                </View>
                <Text style={[styles.bulletText, {color: colors.text}]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Superpowers */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm}}>
            <Icon name="flash-outline" family="Ionicons" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0, marginLeft: 6}]}>Superpowers Needed</Text>
          </View>
          <View style={styles.powerGrid}>
            {selectedCareer.superpowers.map((power, idx) => (
              <View key={idx} style={[styles.powerChip, {backgroundColor: selectedCareer.color + '20'}]}>
                <Text style={[styles.powerText, {color: selectedCareer.color}]}>{power}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cool Tools */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm}}>
            <Icon name="hammer-outline" family="Ionicons" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0, marginLeft: 6}]}>Cool Tools</Text>
          </View>
          <View style={styles.toolsRow}>
            {selectedCareer.coolTools.map((tool, idx) => (
              <View key={idx} style={[styles.toolChip, {backgroundColor: isDark ? colors.surface : '#F5F5F5'}]}>
                <Text style={[styles.toolText, {color: colors.text}]}>{tool}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fun Fact */}
        <View style={[styles.section, styles.funFactSection, {backgroundColor: isDark ? colors.warning + '20' : '#FFF9C4'}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm}}>
            <Icon name="star-outline" family="Ionicons" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0, marginLeft: 6}]}>Fun Fact!</Text>
          </View>
          <View style={[styles.funFactCard, {backgroundColor: isDark ? colors.warning + '10' : '#FFFDE7'}]}>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
              <View style={{marginRight: 8, marginTop: 2}}>
                <Icon name="bulb-outline" family="Ionicons" size={16} color={isDark ? colors.warning : '#F57F17'} />
              </View>
              <Text style={[styles.funFactText, {color: colors.text, flex: 1}]}>{selectedCareer.funFact}</Text>
            </View>
          </View>
        </View>

        {/* How to Become */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm}}>
            <Icon name="rocket-outline" family="Ionicons" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0, marginLeft: 6}]}>How to Become One</Text>
          </View>
          <View style={[styles.becomeCard, {backgroundColor: colors.success + '15', borderLeftColor: colors.success}]}>
            <Text style={[styles.becomeText, {color: colors.text}]}>{selectedCareer.becomeOne}</Text>
          </View>
        </View>

        {/* Salary & Difficulty */}
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm}}>
            <Icon name="wallet-outline" family="Ionicons" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0, marginLeft: 6}]}>How Much They Earn</Text>
          </View>
          <View style={[styles.salaryCard, {backgroundColor: colors.primary + '15'}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <View style={{marginRight: 8}}>
                <Icon name="cash-outline" family="Ionicons" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.salaryText, {color: colors.primary}]}>{selectedCareer.salary}</Text>
            </View>
          </View>
          <View style={styles.difficultyInfo}>
            <Text style={[styles.difficultyLabel, {color: colors.textSecondary}]}>Difficulty Level:</Text>
            <View style={[styles.difficultyBadgeLg, {backgroundColor: getDifficultyColor(selectedCareer.difficulty)}]}>
              <Text style={[styles.difficultyTextLg, {color: colors.white}]}>{selectedCareer.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Quiz Button */}
        <TouchableOpacity 
          style={[styles.quizBtn, {backgroundColor: selectedCareer.color}]}
          onPress={handleStartQuiz}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <View style={{marginRight: 8}}>
              <Icon name="game-controller-outline" family="Ionicons" size={20} color={colors.white} />
            </View>
            <Text style={[styles.quizBtnText, {color: colors.white}]}>Take Quiz: Is this career right for me?</Text>
          </View>
        </TouchableOpacity>

        <View style={{height: SPACING.xxl * 2}} />
      </ScrollView>
    );
  };

  // Render Quiz Modal
  const renderQuizModal = () => {
    if (!selectedCareer) return null;
    const questions = CAREER_QUIZ_QUESTIONS[selectedCareer.id] || [];
    const currentQ = questions[currentQuestion];
    const result = getQuizResult();
    
    return (
      <Modal
        visible={showQuiz}
        animationType="slide"
        transparent
        onRequestClose={() => setShowQuiz(false)}>
        <View style={styles.quizModalOverlay}>
          <View style={[styles.quizModalContent, {backgroundColor: colors.card}]}>
            {/* Header */}
            <View style={[styles.quizModalHeader, {backgroundColor: selectedCareer.color}]}>
              <TouchableOpacity 
                style={styles.quizCloseBtn}
                onPress={() => setShowQuiz(false)}>
                <Icon name="close" family="Ionicons" size={24} color="#FFF" />
              </TouchableOpacity>
              <Icon name={selectedCareer.iconName} family="Ionicons" size={40} color="#FFF" />
              <Text style={styles.quizModalTitle}>
                {quizCompleted ? 'Quiz Complete!' : `Question ${currentQuestion + 1}/${questions.length}`}
              </Text>
            </View>
            
            {/* Quiz Content */}
            <View style={styles.quizBody}>
              {quizCompleted ? (
                // Result Screen
                <View style={styles.quizResult}>
                  <Text style={styles.resultEmoji}>{result.emoji}</Text>
                  <Text style={[styles.resultTitle, {color: colors.text}]}>{result.title}</Text>
                  <Text style={[styles.resultMessage, {color: colors.textSecondary}]}>{result.message}</Text>
                  <Text style={[styles.resultScore, {color: selectedCareer.color}]}>
                    Score: {score}/{questions.length}
                  </Text>
                  <TouchableOpacity
                    style={[styles.retryBtn, {backgroundColor: selectedCareer.color}]}
                    onPress={() => {
                      setCurrentQuestion(0);
                      setScore(0);
                      setQuizCompleted(false);
                    }}>
                    <Icon name="refresh" family="Ionicons" size={18} color="#FFF" />
                    <Text style={styles.retryBtnText}>Try Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.doneBtn, {borderColor: selectedCareer.color}]}
                    onPress={() => setShowQuiz(false)}>
                    <Text style={[styles.doneBtnText, {color: selectedCareer.color}]}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Question Screen
                <>
                  <Text style={[styles.quizQuestion, {color: colors.text}]}>
                    {currentQ?.question}
                  </Text>
                  <View style={styles.quizOptions}>
                    {currentQ?.options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.quizOption,
                          {
                            backgroundColor: index === 0 ? selectedCareer.color + '15' : colors.background,
                            borderColor: index === 0 ? selectedCareer.color : colors.border,
                          },
                        ]}
                        onPress={() => handleAnswer(index)}>
                        <Text style={[
                          styles.quizOptionText,
                          {color: index === 0 ? selectedCareer.color : colors.text}
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['bottom']}>
      {!showDetail ? (
        <>
          {/* Fun Header */}
          <View style={[styles.header, {backgroundColor: colors.primary}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <View style={{marginRight: 8}}>
                <Icon name="sparkles-outline" family="Ionicons" size={24} color={colors.white} />
              </View>
              <Text style={[styles.headerTitle, {color: colors.white}]}>Career Explorer for Kids</Text>
            </View>
            <Text style={[styles.headerSubtitle, {color: colors.white}]}>Tap on any career to discover your dream job!</Text>
          </View>

          {/* Career Cards */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {KIDS_CAREERS.map(career => renderCareerCard(career))}
          </ScrollView>
        </>
      ) : (
        renderDetailView()
      )}
      
      {/* Quiz Modal */}
      {renderQuizModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  careerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  emoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  careerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  difficultyRow: {
    marginTop: SPACING.xs,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  difficultyText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
  },
  // Detail View
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  backBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  detailEmoji: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  detailTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
  },
  detailTagline: {
    fontSize: FONTS.sizes.md,
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  sectionText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 22,
  },
  bulletList: {
    gap: SPACING.xs,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
  },
  powerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  powerChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  powerText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  toolChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  toolText: {
    fontSize: FONTS.sizes.sm,
  },
  funFactSection: {
    // Colors applied dynamically
  },
  funFactCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  funFactText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  becomeCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
  },
  becomeText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 22,
  },
  salaryCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  salaryText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  difficultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  difficultyLabel: {
    fontSize: FONTS.sizes.sm,
  },
  difficultyBadgeLg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  difficultyTextLg: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  quizBtn: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  quizBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  // Quiz Modal Styles
  quizModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  quizModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  quizModalHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  quizCloseBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: 4,
  },
  quizModalTitle: {
    color: '#FFF',
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  quizBody: {
    padding: SPACING.lg,
  },
  quizQuestion: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 28,
  },
  quizOptions: {
    gap: SPACING.md,
  },
  quizOption: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
  },
  quizOptionText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  quizResult: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  resultMessage: {
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  resultScore: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
    width: '100%',
    marginBottom: SPACING.sm,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  doneBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
});

export default CareerExplorerKidsScreen;
