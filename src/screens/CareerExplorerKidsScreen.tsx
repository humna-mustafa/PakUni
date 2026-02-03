import React, {useState, useRef, useEffect, useMemo} from 'react';
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
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SPACING, FONTS, BORDER_RADIUS} from '../constants/theme';
import {TYPOGRAPHY} from '../constants/design';
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
  category: 'science' | 'creative' | 'tech' | 'business' | 'service' | 'sports';
  famousPakistanis?: string[];
}

// Animated Career Card Component
const AnimatedCareerCard: React.FC<{
  career: Career;
  index: number;
  colors: any;
  isDark: boolean;
  getDifficultyColor: (d: string) => string;
  onPress: (career: Career) => void;
}> = ({career, index, colors, isDark, getDifficultyColor, onPress}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(bounceAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {translateY: slideAnim},
          {scale: Animated.multiply(scaleAnim, bounceAnim)},
        ],
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(career)}
        style={[styles.careerCard, {backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: career.color}]}>
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
            <View style={[styles.categoryBadge, {backgroundColor: colors.primaryLight}]}>
              <Text style={[styles.categoryChipText, {color: colors.primary}]}>
                {career.category}
              </Text>
            </View>
          </View>
        </View>
        <Icon name="arrow-forward" family="Ionicons" size={24} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

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
    category: 'science',
    famousPakistanis: ['Dr. Nergis Mavalvala (Astrophysicist)', 'Dr. Ruth Pfau (Leprosy Fighter)'],
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
    category: 'tech',
    famousPakistanis: ['Dr. Atta-ur-Rahman (Scientist)', 'Munir Ahmad Khan (Nuclear Engineer)'],
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
    category: 'tech',
    famousPakistanis: ['Arfa Karim (Youngest MCP)', 'Maria Umar (Founder, Women\'s Digital League)'],
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
    category: 'service',
    famousPakistanis: ['Ayesha Farooq (First Female Fighter Pilot)', 'Maryam Mujtaba (First Female PAF Pilot)'],
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
    category: 'service',
    famousPakistanis: ['Malala Yousafzai (Education Activist)', 'Sir Syed Ahmad Khan (Education Pioneer)'],
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
    category: 'creative',
    famousPakistanis: ['Sadequain (Painter)', 'Salima Hashmi (Artist)'],
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
    category: 'science',
    famousPakistanis: ['Dr. Abdus Salam (Nobel Laureate)', 'Dr. Atta-ur-Rahman (Organic Chemist)'],
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
    category: 'creative',
    famousPakistanis: ['Zubaida Tariq (Cooking Expert)', 'Naheed Ansari (Celebrity Chef)'],
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
    category: 'sports',
    famousPakistanis: ['Jahangir Khan (Squash Legend)', 'Babar Azam (Cricket Captain)', 'Naseem Shah (Fast Bowler)'],
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
    category: 'creative',
    famousPakistanis: ['Irfan Junejo (Vlogger)', 'Mooroo (Content Creator)', 'Ducky Bhai (Gaming)'],
  },
  {
    id: 'lawyer',
    title: 'Lawyer / Advocate',
    iconName: 'briefcase',
    color: '#8D6E63',
    tagline: 'Fight for Justice!',
    description: 'Lawyers are the defenders of justice! They help people solve problems and make sure everyone is treated fairly.',
    whatTheyDo: [
      'Help people in court cases',
      'Write legal documents',
      'Protect innocent people',
      'Advise companies and families',
    ],
    funFact: 'Quaid-e-Azam Muhammad Ali Jinnah was a brilliant lawyer before becoming the founder of Pakistan!',
    becomeOne: 'Study law (LLB degree), pass bar exam, practice in courts',
    superpowers: ['Public Speaking', 'Critical Thinking', 'Research Skills', 'Persuasion'],
    coolTools: ['Law Books', 'Legal Documents', 'Laptop', 'Black Coat'],
    salary: 'PKR 50,000 - 1,000,000/month',
    difficulty: 'Hard',
    category: 'service',
    famousPakistanis: ['Quaid-e-Azam M.A. Jinnah', 'Asma Jahangir (Human Rights)'],
  },
  {
    id: 'architect',
    title: 'Architect',
    iconName: 'home',
    color: '#78909C',
    tagline: 'Design Amazing Buildings!',
    description: 'Architects design the buildings we live in! They create beautiful houses, schools, malls, and skyscrapers.',
    whatTheyDo: [
      'Design homes and buildings',
      'Create 3D models of structures',
      'Make buildings safe and beautiful',
      'Plan entire cities',
    ],
    funFact: 'The Faisal Mosque in Islamabad was designed by Turkish architect and is shaped like a desert tent!',
    becomeOne: 'Love drawing and design, study architecture (5 years), get licensed',
    superpowers: ['Creativity', 'Spatial Thinking', 'Technical Drawing', 'Problem Solving'],
    coolTools: ['Drawing Board', 'CAD Software', '3D Printer', 'Models'],
    salary: 'PKR 60,000 - 400,000/month',
    difficulty: 'Hard',
    category: 'creative',
    famousPakistanis: ['Nayyar Ali Dada (Architect)', 'Habib Fida Ali (Urban Designer)'],
  },
  {
    id: 'nurse',
    title: 'Nurse',
    iconName: 'heart',
    color: '#F48FB1',
    tagline: 'Care for Patients with Love!',
    description: 'Nurses are the heart of hospitals! They take care of patients day and night with love and dedication.',
    whatTheyDo: [
      'Take care of sick patients',
      'Give medicines and injections',
      'Monitor patient health',
      'Comfort patients and families',
    ],
    funFact: 'During COVID-19, Pakistani nurses worked 24/7 as frontline heroes saving lives!',
    becomeOne: 'Complete nursing diploma or BSN degree, pass nursing council exam',
    superpowers: ['Caring Heart', 'Attention to Detail', 'Staying Calm', 'Physical Stamina'],
    coolTools: ['Stethoscope', 'Thermometer', 'Medicine Tray', 'Patient Charts'],
    salary: 'PKR 40,000 - 150,000/month',
    difficulty: 'Medium',
    category: 'science',
    famousPakistanis: ['Florence Nightingale inspired many Pakistani nurses!'],
  },
  {
    id: 'police',
    title: 'Police Officer',
    iconName: 'shield-checkmark',
    color: '#1E88E5',
    tagline: 'Protect & Serve!',
    description: 'Police officers are the guardians of safety! They protect people and catch bad guys to keep everyone safe.',
    whatTheyDo: [
      'Catch criminals and solve crimes',
      'Help people in emergencies',
      'Direct traffic safely',
      'Protect important places',
    ],
    funFact: 'Pakistan has the first all-women police station in Karachi to help female citizens!',
    becomeOne: 'Pass police exam, complete training at police academy, stay physically fit',
    superpowers: ['Bravery', 'Quick Thinking', 'Physical Strength', 'Helping Others'],
    coolTools: ['Uniform', 'Radio', 'Vehicle', 'First Aid Kit'],
    salary: 'PKR 40,000 - 200,000/month',
    difficulty: 'Hard',
    category: 'service',
    famousPakistanis: ['SSP Shehla Qureshi (Crime Fighter)', 'SP Tahir Dawar (Bravery Award)'],
  },
  {
    id: 'banker',
    title: 'Banker / Finance',
    iconName: 'cash',
    color: '#4CAF50',
    tagline: 'Master of Money!',
    description: 'Bankers are the money wizards! They help people save money, grow wealth, and make smart financial decisions.',
    whatTheyDo: [
      'Help people save and invest money',
      'Give loans for businesses',
      'Manage bank operations',
      'Advise on financial planning',
    ],
    funFact: 'Pakistan has digital banking apps now! JazzCash and Easypaisa changed how Pakistanis use money.',
    becomeOne: 'Study business/finance, get MBA or banking certification, work in banks',
    superpowers: ['Math Skills', 'Trustworthiness', 'Analysis', 'Communication'],
    coolTools: ['Computer', 'Calculator', 'Financial Software', 'Reports'],
    salary: 'PKR 60,000 - 500,000/month',
    difficulty: 'Medium',
    category: 'business',
    famousPakistanis: ['Mian Muhammad Mansha (Business Tycoon)', 'Shamshad Akhtar (Central Bank Governor)'],
  },
  {
    id: 'journalist',
    title: 'Journalist / Reporter',
    iconName: 'newspaper',
    color: '#607D8B',
    tagline: 'Tell the Truth to the World!',
    description: 'Journalists are the truth seekers! They report news, uncover stories, and inform people about what\'s happening.',
    whatTheyDo: [
      'Report news on TV and newspapers',
      'Interview important people',
      'Investigate important stories',
      'Write articles and make videos',
    ],
    funFact: 'Pakistan has hundreds of TV channels and newspapers! Journalists keep people informed every day.',
    becomeOne: 'Study journalism or mass communication, work at news organizations, build your portfolio',
    superpowers: ['Curiosity', 'Writing Skills', 'Communication', 'Bravery'],
    coolTools: ['Camera', 'Microphone', 'Notebook', 'Computer'],
    salary: 'PKR 40,000 - 300,000/month',
    difficulty: 'Medium',
    category: 'creative',
    famousPakistanis: ['Hamid Mir (Senior Journalist)', 'Gharidah Farooqi (News Anchor)'],
  },
  {
    id: 'fashion',
    title: 'Fashion Designer',
    iconName: 'shirt',
    color: '#9C27B0',
    tagline: 'Create Stunning Styles!',
    description: 'Fashion designers create the clothes we wear! They design beautiful dresses, suits, and accessories.',
    whatTheyDo: [
      'Design clothes and accessories',
      'Create fashion collections',
      'Run fashion shows',
      'Dress celebrities and brides',
    ],
    funFact: 'Pakistani fashion designers are famous worldwide! HSY, Maria B, and Sana Safinaz dresses are loved globally.',
    becomeOne: 'Study fashion design, learn sketching and sewing, build your brand',
    superpowers: ['Creativity', 'Color Sense', 'Trend Awareness', 'Sewing Skills'],
    coolTools: ['Fabric', 'Sewing Machine', 'Sketch Pad', 'Mannequin'],
    salary: 'PKR 50,000 - 500,000/month',
    difficulty: 'Medium',
    category: 'creative',
    famousPakistanis: ['HSY (Fashion Icon)', 'Maria B (Designer)', 'Khaadi Founders'],
  },
  {
    id: 'musician',
    title: 'Musician / Singer',
    iconName: 'musical-notes',
    color: '#E91E63',
    tagline: 'Create Beautiful Music!',
    description: 'Musicians bring joy through music! They sing songs, play instruments, and create music that touches hearts.',
    whatTheyDo: [
      'Sing songs and perform concerts',
      'Play musical instruments',
      'Compose and write songs',
      'Record music in studios',
    ],
    funFact: 'Nusrat Fateh Ali Khan is known worldwide as the "King of Qawwali"! Pakistani music is loved globally.',
    becomeOne: 'Learn to sing or play instruments, practice daily, share your music',
    superpowers: ['Musical Talent', 'Creativity', 'Performance Skills', 'Discipline'],
    coolTools: ['Instruments', 'Microphone', 'Music Software', 'Recording Studio'],
    salary: 'PKR 20,000 - Millions/month (top artists)',
    difficulty: 'Medium',
    category: 'creative',
    famousPakistanis: ['Nusrat Fateh Ali Khan', 'Atif Aslam', 'Rahat Fateh Ali Khan', 'Ali Zafar'],
  },
  {
    id: 'vet',
    title: 'Veterinarian',
    iconName: 'paw',
    color: '#8BC34A',
    tagline: 'Heal Animals with Love!',
    description: 'Vets are animal doctors! They help pets, farm animals, and even zoo animals stay healthy and happy.',
    whatTheyDo: [
      'Treat sick animals',
      'Give vaccinations to pets',
      'Do surgeries on animals',
      'Advise on animal care',
    ],
    funFact: 'Pakistan has rescue organizations that save street animals! Vets help thousands of animals every year.',
    becomeOne: 'Study veterinary medicine (5 years), love animals, get licensed',
    superpowers: ['Animal Lover', 'Patience', 'Gentle Hands', 'Problem Solving'],
    coolTools: ['Stethoscope', 'Medicine', 'X-Ray', 'Surgical Tools'],
    salary: 'PKR 50,000 - 200,000/month',
    difficulty: 'Hard',
    category: 'science',
    famousPakistanis: ['Many animal rescue heroes in Pakistan!'],
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
  chef: [
    {question: "Do you enjoy cooking and trying new recipes?", options: ["Yes! I love cooking!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Chefs create amazing dishes every day!"},
    {question: "Can you work in a busy kitchen?", options: ["Yes, I can handle it!", "Maybe", "That's too stressful"], correctIndex: 0, explanation: "Professional kitchens are fast-paced and exciting!"},
    {question: "Do you like making people happy with food?", options: ["Yes! Seeing smiles makes me happy!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Chefs bring joy through delicious food!"},
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
  lawyer: [
    {question: "Do you like debating and arguing points?", options: ["Yes! I love debates!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Lawyers argue cases in court!"},
    {question: "Are you good at reading and understanding rules?", options: ["Yes, I'm detail-oriented!", "Kind of", "Not really"], correctIndex: 0, explanation: "Lawyers need to understand many laws and rules."},
    {question: "Do you want to help people get justice?", options: ["Yes! Justice is important!", "Maybe", "Not sure"], correctIndex: 0, explanation: "Lawyers fight for what's right!"},
  ],
  architect: [
    {question: "Do you like drawing buildings and structures?", options: ["Yes! I love it!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Architects draw amazing building designs!"},
    {question: "Can you imagine buildings before they exist?", options: ["Yes, I can visualize!", "Kind of", "That's hard"], correctIndex: 0, explanation: "Architects need great imagination!"},
    {question: "Are you patient enough for detailed work?", options: ["Yes!", "Sometimes", "I prefer quick work"], correctIndex: 0, explanation: "Architecture requires careful, detailed planning."},
  ],
  nurse: [
    {question: "Do you like taking care of others?", options: ["Yes! I love helping!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Nurses care for patients every day!"},
    {question: "Can you stay calm around sick people?", options: ["Yes, I can!", "I try to", "It makes me nervous"], correctIndex: 0, explanation: "Nurses need to stay calm and reassuring."},
    {question: "Are you okay with working long hours?", options: ["Yes, for helping others!", "Maybe", "No"], correctIndex: 0, explanation: "Nurses sometimes work long shifts to help patients."},
  ],
  police: [
    {question: "Are you brave?", options: ["Yes, very brave!", "Kind of", "I scare easily"], correctIndex: 0, explanation: "Police officers need courage!"},
    {question: "Do you want to protect people?", options: ["Yes! I want to help!", "Maybe", "Not sure"], correctIndex: 0, explanation: "Protecting others is a police officer's duty!"},
    {question: "Can you follow rules strictly?", options: ["Yes!", "Sometimes", "Rules are boring"], correctIndex: 0, explanation: "Police must follow and enforce rules fairly."},
  ],
  banker: [
    {question: "Do you like math and numbers?", options: ["Yes! I love math!", "It's okay", "Not really"], correctIndex: 0, explanation: "Bankers work with numbers every day!"},
    {question: "Are you trustworthy?", options: ["Yes, people trust me!", "I think so", "I'm not sure"], correctIndex: 0, explanation: "Bankers handle people's money - trust is essential!"},
    {question: "Do you like planning and organizing?", options: ["Yes!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Financial planning requires organization skills."},
  ],
  journalist: [
    {question: "Are you curious about what's happening?", options: ["Yes! I want to know everything!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Journalists are always curious about news!"},
    {question: "Do you like writing or speaking?", options: ["Yes! Both!", "One of them", "Neither"], correctIndex: 0, explanation: "Journalists write articles and speak on TV!"},
    {question: "Can you ask tough questions?", options: ["Yes!", "Sometimes", "I'm shy"], correctIndex: 0, explanation: "Good journalists ask important questions."},
  ],
  fashion: [
    {question: "Do you love clothes and styles?", options: ["Yes! Fashion is everything!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Fashion designers live and breathe style!"},
    {question: "Are you creative with colors?", options: ["Yes! I love colors!", "Kind of", "Not really"], correctIndex: 0, explanation: "Fashion needs amazing color combinations!"},
    {question: "Do you notice what people wear?", options: ["Yes, always!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Fashion designers observe trends everywhere!"},
  ],
  musician: [
    {question: "Do you love listening to music?", options: ["Yes! Music is life!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Musicians are passionate about music!"},
    {question: "Can you keep a rhythm or beat?", options: ["Yes! I'm rhythmic!", "Kind of", "Not really"], correctIndex: 0, explanation: "Rhythm is the heartbeat of music!"},
    {question: "Are you willing to practice every day?", options: ["Yes!", "Maybe", "That's too much"], correctIndex: 0, explanation: "Musicians practice for hours to perfect their craft!"},
  ],
  vet: [
    {question: "Do you love animals?", options: ["Yes! I love all animals!", "Some animals", "Not really"], correctIndex: 0, explanation: "Vets need to love animals!"},
    {question: "Can you stay calm if an animal is scared?", options: ["Yes, I'm gentle!", "I'll try", "I get nervous too"], correctIndex: 0, explanation: "Vets need to calm scared animals."},
    {question: "Are you okay with studying for many years?", options: ["Yes!", "Maybe", "That's too long"], correctIndex: 0, explanation: "Veterinary school takes about 5 years!"},
  ],
  programmer: [
    {question: "Do you like solving puzzles and problems?", options: ["Yes! I love puzzles!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Programmers solve problems every day with code!"},
    {question: "Are you patient when things don't work the first time?", options: ["Yes, I keep trying!", "Kind of", "I give up easily"], correctIndex: 0, explanation: "Coding often requires debugging and trying again!"},
    {question: "Do you like creating things?", options: ["Yes! I love building things!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Programmers create apps, games, and websites!"},
  ],
  cricketer: [
    {question: "Do you love playing cricket?", options: ["Yes! I practice daily!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Cricketers are passionate about the sport!"},
    {question: "Can you handle pressure in big matches?", options: ["Yes, I stay focused!", "I try to", "I get nervous"], correctIndex: 0, explanation: "Cricketers need to perform under pressure!"},
    {question: "Are you willing to train hard every day?", options: ["Yes!", "Maybe", "That's too much"], correctIndex: 0, explanation: "Top cricketers train for hours daily!"},
  ],
  entrepreneur: [
    {question: "Do you have lots of ideas?", options: ["Yes! Ideas everywhere!", "Sometimes", "Not really"], correctIndex: 0, explanation: "Entrepreneurs turn ideas into businesses!"},
    {question: "Are you okay with taking risks?", options: ["Yes, calculated risks!", "Sometimes", "I avoid risks"], correctIndex: 0, explanation: "Starting a business involves risks!"},
    {question: "Do you want to be your own boss?", options: ["Yes!", "Maybe", "I prefer job security"], correctIndex: 0, explanation: "Entrepreneurs run their own businesses!"},
  ],
};

// Category definitions with emojis
const CAREER_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'service', label: 'Service', emoji: '🤝' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'business', label: 'Business', emoji: '💼' },
];

// Floating decoration component
const FloatingDecoration = ({ emoji, delay, startX, startY }: { emoji: string; delay: number; startX: number; startY: number }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      startAnimation();
    }, delay);
  }, [delay, floatAnim, fadeAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        fontSize: 20,
        opacity: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }),
        transform: [{ translateY }, { rotate }],
      }}>
      {emoji}
    </Animated.Text>
  );
};

// Animated category chip component
const AnimatedCategoryChip = ({ 
  category, 
  isSelected, 
  index, 
  onPress, 
  colors 
}: { 
  category: typeof CAREER_CATEGORIES[0]; 
  isSelected: boolean; 
  index: number; 
  onPress: () => void; 
  colors: any 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [index, scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(bounceAnim, {
      toValue: 0.9,
      tension: 150,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      tension: 150,
      friction: 10,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scaleAnim, bounceAnim) }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}>
        <Text style={{ fontSize: 14, marginRight: 4 }}>{category.emoji}</Text>
        <Text
          style={[
            styles.categoryChipText,
            { color: isSelected ? colors.white : colors.text },
          ]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CareerExplorerKidsScreen = () => {
  const {colors, isDark} = useTheme();
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Header animations
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleRotateAnim = useRef(new Animated.Value(0)).current;

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);

  // Header entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle rotation loop
    Animated.loop(
      Animated.timing(sparkleRotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [headerScaleAnim, headerFadeAnim, sparkleRotateAnim]);

  // Filter careers by category
  const filteredCareers = useMemo(() => {
    if (selectedCategory === 'all') return KIDS_CAREERS;
    return KIDS_CAREERS.filter(career => career.category === selectedCategory);
  }, [selectedCategory]);

  const sparkleRotation = sparkleRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
    setSelectedAnswerIndex(null);
    setShowAnswerFeedback(false);
    setShowQuiz(true);
    Haptics.light();
  };

  // Handle quiz answer
  const handleAnswer = (answerIndex: number) => {
    if (!selectedCareer || showAnswerFeedback) return; // Prevent multiple selections
    const questions = CAREER_QUIZ_QUESTIONS[selectedCareer.id] || [];
    const currentQ = questions[currentQuestion];
    
    setSelectedAnswerIndex(answerIndex);
    setShowAnswerFeedback(true);
    
    if (answerIndex === currentQ.correctIndex) {
      setScore(prev => prev + 1);
      Haptics.success();
    } else {
      Haptics.light();
    }
    
    // Move to next question after a short delay to show feedback
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswerIndex(null);
        setShowAnswerFeedback(false);
      } else {
        setQuizCompleted(true);
        setShowAnswerFeedback(false);
      }
    }, 800);
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

  const handleCareerPress = (career: Career) => {
    setSelectedCareer(career);
    setShowDetail(true);
  };

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

        {/* Famous Pakistanis Role Models */}
        {selectedCareer.famousPakistanis && selectedCareer.famousPakistanis.length > 0 && (
          <View style={[styles.section, {backgroundColor: colors.card}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm}}>
              <Icon name="people-outline" family="Ionicons" size={18} color={colors.text} />
              <Text style={[styles.sectionTitle, {color: colors.text, marginBottom: 0, marginLeft: 6}]}>Pakistani Role Models 🇵🇰</Text>
            </View>
            <View style={styles.roleModelsContainer}>
              {selectedCareer.famousPakistanis.map((person, idx) => (
                <View key={idx} style={[styles.roleModelCard, {backgroundColor: selectedCareer.color + '15', borderColor: selectedCareer.color + '30'}]}>
                  <View style={[styles.roleModelIcon, {backgroundColor: selectedCareer.color + '20'}]}>
                    <Icon name="star" family="Ionicons" size={16} color={selectedCareer.color} />
                  </View>
                  <Text style={[styles.roleModelText, {color: colors.text}]}>{person}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.inspirationText, {color: colors.textSecondary}]}>
              🌟 You can be like them too! Dream big!
            </Text>
          </View>
        )}

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
                    {currentQ?.options.map((option, index) => {
                      const isSelected = selectedAnswerIndex === index;
                      const isCorrect = currentQ.correctIndex === index;
                      const showCorrectHighlight = showAnswerFeedback && isCorrect;
                      const showWrongHighlight = showAnswerFeedback && isSelected && !isCorrect;
                      
                      let backgroundColor = colors.background;
                      let borderColor = colors.border;
                      let textColor = colors.text;
                      
                      if (showCorrectHighlight) {
                        backgroundColor = '#10B98120';
                        borderColor = '#10B981';
                        textColor = '#10B981';
                      } else if (showWrongHighlight) {
                        backgroundColor = '#EF444420';
                        borderColor = '#EF4444';
                        textColor = '#EF4444';
                      } else if (isSelected) {
                        backgroundColor = selectedCareer.color + '15';
                        borderColor = selectedCareer.color;
                        textColor = selectedCareer.color;
                      }
                      
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.quizOption,
                            {backgroundColor, borderColor},
                          ]}
                          disabled={showAnswerFeedback}
                          onPress={() => handleAnswer(index)}>
                          <Text style={[styles.quizOptionText, {color: textColor}]}>
                            {option}
                          </Text>
                          {showCorrectHighlight && (
                            <Icon name="checkmark-circle" family="Ionicons" size={20} color="#10B981" />
                          )}
                          {showWrongHighlight && (
                            <Icon name="close-circle" family="Ionicons" size={20} color="#EF4444" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
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
          {/* Fun Header with Floating Decorations */}
          <Animated.View 
            style={[
              styles.header, 
              {
                backgroundColor: colors.primary,
                opacity: headerFadeAnim,
                transform: [{ scale: headerScaleAnim }],
              }
            ]}>
            {/* Floating Career Emojis */}
            <FloatingDecoration emoji="👨‍⚕️" delay={0} startX={20} startY={5} />
            <FloatingDecoration emoji="👩‍💻" delay={200} startX={width - 60} startY={10} />
            <FloatingDecoration emoji="🎨" delay={400} startX={50} startY={60} />
            <FloatingDecoration emoji="🚀" delay={600} startX={width - 90} startY={55} />
            <FloatingDecoration emoji="⭐" delay={800} startX={width / 2 - 80} startY={8} />
            <FloatingDecoration emoji="🌟" delay={1000} startX={width / 2 + 40} startY={65} />

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Animated.View style={{ marginRight: 8, transform: [{ rotate: sparkleRotation }] }}>
                <Icon name="sparkles-outline" family="Ionicons" size={24} color={colors.white} />
              </Animated.View>
              <Text style={[styles.headerTitle, {color: colors.white}]}>Career Explorer for Kids</Text>
            </View>
            <Text style={[styles.headerSubtitle, {color: colors.white}]}>
              Discover {KIDS_CAREERS.length} amazing careers! 🎯
            </Text>
          </Animated.View>

          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}>
              {CAREER_CATEGORIES.map((category, index) => (
                <AnimatedCategoryChip
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  index={index}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    Haptics.light();
                  }}
                  colors={colors}
                />
              ))}
            </ScrollView>
            <Text style={[styles.careerCount, { color: colors.textSecondary }]}>
              Showing {filteredCareers.length} career{filteredCareers.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Career Cards */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {filteredCareers.map((career, index) => (
              <AnimatedCareerCard
                key={career.id}
                career={career}
                index={index}
                colors={colors}
                isDark={isDark}
                getDifficultyColor={getDifficultyColor}
                onPress={() => handleCareerPress(career)}
              />
            ))}
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
    paddingTop: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    minHeight: 100,
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
  // Category Filter
  categoryContainer: {
    paddingVertical: SPACING.sm,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  careerCount: {
    fontSize: FONTS.sizes.xs,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  // Career Cards
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  careerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  categoryBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    textTransform: 'capitalize',
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
  // Role Models Section
  roleModelsContainer: {
    gap: SPACING.sm,
  },
  roleModelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  roleModelIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  roleModelText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
  },
  inspirationText: {
    fontSize: FONTS.sizes.xs,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
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
    fontWeight: TYPOGRAPHY.weight.semibold,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizOptionText: {
    fontSize: FONTS.sizes.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    flex: 1,
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
