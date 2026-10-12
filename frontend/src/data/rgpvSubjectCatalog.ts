export interface RGPVSubjectOption {
  code: string;
  name: string;
}

// Common 1st Year (1st & 2nd Semester) RGPV B.Tech Subjects
const FIRST_SEM_SUBJECTS: RGPVSubjectOption[] = [
  { code: 'BT-101', name: 'Engineering Chemistry' },
  { code: 'BT-102', name: 'Mathematics-I' },
  { code: 'BT-103', name: 'English for Communication' },
  { code: 'BT-104', name: 'Basic Electrical & Electronics Engineering' },
  { code: 'BT-105', name: 'Engineering Graphics' },
];

const SECOND_SEM_SUBJECTS: RGPVSubjectOption[] = [
  { code: 'BT-201', name: 'Engineering Physics' },
  { code: 'BT-202', name: 'Mathematics-II' },
  { code: 'BT-203', name: 'Basic Mechanical Engineering' },
  { code: 'BT-204', name: 'Basic Civil Engineering & Mechanics' },
  { code: 'BT-205', name: 'Basic Computer Engineering' },
];

export const RGPV_SUBJECT_CATALOG: Record<
  string,
  Record<string, RGPVSubjectOption[]>
> = {
  'Computer Science & Engineering (CSE)': {
    '1st Semester (I)': FIRST_SEM_SUBJECTS,
    '2nd Semester (II)': SECOND_SEM_SUBJECTS,
    '3rd Semester (III)': [
      { code: 'ES-301', name: 'Energy & Environmental Engineering' },
      { code: 'CS-302', name: 'Discrete Structure' },
      { code: 'CS-303', name: 'Data Structure' },
      { code: 'CS-304', name: 'Digital Systems' },
      { code: 'CS-305', name: 'Object Oriented Programming & Methodology' },
    ],
    '4th Semester (IV)': [
      { code: 'BT-401', name: 'Mathematics-III' },
      { code: 'CS-402', name: 'Analysis Design of Algorithm' },
      { code: 'CS-403', name: 'Software Engineering' },
      { code: 'CS-404', name: 'Computer Org. & Architecture' },
      { code: 'CS-405', name: 'Operating Systems' },
    ],
    '5th Semester (V)': [
      { code: 'CS-501', name: 'Theory of Computation' },
      { code: 'CS-502', name: 'Database Management Systems' },
      { code: 'CS-503(A)', name: 'Data Analytics' },
      { code: 'CS-503(B)', name: 'Pattern Recognition' },
      { code: 'CS-503(C)', name: 'Cyber Security' },
      { code: 'CS-504(A)', name: 'Internet and Web Technology' },
    ],
    '6th Semester (VI)': [
      { code: 'CS-601', name: 'Machine Learning' },
      { code: 'CS-602', name: 'Computer Networks' },
      { code: 'CS-603(A)', name: 'Advanced Computer Architecture' },
      { code: 'CS-603(B)', name: 'Computer Graphics & Visualization' },
      { code: 'CS-603(C)', name: 'Compiler Design' },
      { code: 'CS-604(A)', name: 'Knowledge Management' },
      { code: 'CS-604(B)', name: 'Project Management' },
    ],
    '7th Semester (VII)': [
      { code: 'CS-701', name: 'Software Architectures' },
      { code: 'CS-702(A)', name: 'Computational Intelligence' },
      { code: 'CS-702(B)', name: 'Deep & Reinforcement Learning' },
      { code: 'CS-702(C)', name: 'Wireless & Mobile Computing' },
      { code: 'CS-702(D)', name: 'Big Data' },
      { code: 'CS-703(A)', name: 'Cryptography & Information Security' },
      { code: 'CS-703(B)', name: 'Data Mining and Warehousing' },
    ],
    '8th Semester (VIII)': [
      { code: 'CS-801', name: 'Internet of Things' },
      { code: 'CS-802(A)', name: 'Block Chain Technologies' },
      { code: 'CS-802(B)', name: 'Cloud Computing' },
      { code: 'CS-802(C)', name: 'High Performance Computing' },
      { code: 'CS-803(A)', name: 'Image Processing and Computer Vision' },
    ],
  },

  'CSE (AI & Machine Learning)': {
    '1st Semester (I)': FIRST_SEM_SUBJECTS,
    '2nd Semester (II)': SECOND_SEM_SUBJECTS,
    '3rd Semester (III)': [
      { code: 'AL-301', name: 'Technical Communication' },
      { code: 'AL-302', name: 'Introduction to Probability and Statistics' },
      { code: 'AL-303', name: 'Data Structures' },
      { code: 'AL-304', name: 'Artificial Intelligence' },
      { code: 'AL-305', name: 'Object Oriented Programming & Methodology' },
    ],
    '4th Semester (IV)': [
      { code: 'BT-401', name: 'Mathematics-III' },
      { code: 'AL-402', name: 'Analysis and Design of Algorithms' },
      { code: 'AL-403', name: 'Software Engineering' },
      { code: 'AL-404', name: 'Computer Organization & Architecture' },
      { code: 'AL-405', name: 'Machine Learning' },
    ],
    '5th Semester (V)': [
      { code: 'AL-501', name: 'Operating Systems' },
      { code: 'AL-502', name: 'Database Management Systems' },
      { code: 'AL-503(A)', name: 'Deep Learning' },
      { code: 'AL-503(B)', name: 'Natural Language Processing' },
      { code: 'AL-504(A)', name: 'Data Mining and Warehousing' },
    ],
    '6th Semester (VI)': [
      { code: 'AL-601', name: 'Computer Networks' },
      { code: 'AL-602', name: 'Computer Vision' },
      { code: 'AL-603(A)', name: 'Intelligent Systems for Robotics' },
      { code: 'AL-603(B)', name: 'Reinforcement Learning' },
      { code: 'AL-604(A)', name: 'Cloud Computing' },
    ],
    '7th Semester (VII)': [
      { code: 'AL-701', name: 'AI in Healthcare & Applications' },
      { code: 'AL-702(A)', name: 'Big Data Analytics' },
      { code: 'AL-702(B)', name: 'Speech & Audio Processing' },
      { code: 'AL-703(A)', name: 'Recommender Systems' },
    ],
    '8th Semester (VIII)': [
      { code: 'AL-801', name: 'Internet of Things & Edge AI' },
      { code: 'AL-802(A)', name: 'AI Ethics & Governance' },
      { code: 'AL-802(B)', name: 'Autonomous Systems' },
    ],
  },

  'CSE (Data Science)': {
    '1st Semester (I)': FIRST_SEM_SUBJECTS,
    '2nd Semester (II)': SECOND_SEM_SUBJECTS,
    '3rd Semester (III)': [
      { code: 'CD-301', name: 'Technical Communication' },
      { code: 'CD-302', name: 'Probability and Statistics for Data Science' },
      { code: 'CD-303', name: 'Data Structures' },
      { code: 'CD-304', name: 'Database Management Systems' },
      { code: 'CD-305', name: 'Object Oriented Programming & Methodology' },
    ],
    '4th Semester (IV)': [
      { code: 'BT-401', name: 'Mathematics-III' },
      { code: 'CD-402', name: 'Introduction to Data Science' },
      { code: 'CD-403', name: 'Analysis and Design of Algorithms' },
      { code: 'CD-404', name: 'Software Engineering' },
      { code: 'CD-405', name: 'Operating Systems' },
    ],
    '5th Semester (V)': [
      { code: 'CD-501', name: 'Theory of Computation' },
      { code: 'CD-502', name: 'Machine Learning for Data Science' },
      { code: 'CD-503(A)', name: 'Data Visualization & Analytics' },
      { code: 'CD-503(B)', name: 'NoSQL & Distributed Databases' },
      { code: 'CD-504(A)', name: 'Web & Social Media Analytics' },
    ],
    '6th Semester (VI)': [
      { code: 'CD-601', name: 'Big Data Engineering' },
      { code: 'CD-602', name: 'Computer Networks' },
      { code: 'CD-603(A)', name: 'Deep Learning' },
      { code: 'CD-603(B)', name: 'Time Series Analysis & Forecasting' },
      { code: 'CD-604(A)', name: 'Cloud Data Platforms' },
    ],
    '7th Semester (VII)': [
      { code: 'CD-701', name: 'Natural Language Processing & Text Mining' },
      { code: 'CD-702(A)', name: 'Business Intelligence & Decision Systems' },
      { code: 'CD-703(A)', name: 'Data Security & Privacy' },
    ],
    '8th Semester (VIII)': [
      { code: 'CD-801', name: 'Internet of Things & Sensor Data Analytics' },
      { code: 'CD-802(A)', name: 'Real-Time Streaming Systems' },
      { code: 'CD-802(B)', name: 'MLOps & Data Engineering' },
    ],
  },

  'Electronics & Communication Engineering (ECE)': {
    '1st Semester (I)': FIRST_SEM_SUBJECTS,
    '2nd Semester (II)': SECOND_SEM_SUBJECTS,
    '3rd Semester (III)': [
      { code: 'BT-301', name: 'Mathematics-III' },
      { code: 'EC-302', name: 'Electronic Measurement and Instrumentation' },
      { code: 'EC-303', name: 'Digital System Design' },
      { code: 'EC-304', name: 'Electronic Devices' },
      { code: 'EC-305', name: 'Network Analysis' },
    ],
    '4th Semester (IV)': [
      { code: 'ES-401', name: 'Energy & Environmental Engineering' },
      { code: 'EC-402', name: 'Signals & Systems' },
      { code: 'EC-403', name: 'Analog Communication' },
      { code: 'EC-404', name: 'Control System' },
      { code: 'EC-405', name: 'Analog Circuits' },
    ],
    '5th Semester (V)': [
      { code: 'EC-501', name: 'Microprocessor & Its Applications' },
      { code: 'EC-502', name: 'Digital Communication' },
      { code: 'EC-503(A)', name: 'Mobile Communication' },
      { code: 'EC-503(B)', name: 'CMOS Design' },
      { code: 'EC-504(A)', name: 'Computer System Organization' },
    ],
    '6th Semester (VI)': [
      { code: 'EC-601', name: 'Digital Signal Processing' },
      { code: 'EC-602', name: 'Antenna & Wave Propagation' },
      { code: 'EC-603(A)', name: 'Data Communication Networks' },
      { code: 'EC-603(B)', name: 'VLSI Design' },
      { code: 'EC-604(A)', name: 'Microcontroller & Embedded Systems' },
    ],
    '7th Semester (VII)': [
      { code: 'EC-701', name: 'Microwave Engineering' },
      { code: 'EC-702(A)', name: 'Information Theory & Coding' },
      { code: 'EC-702(B)', name: 'Wireless Networks' },
      { code: 'EC-703(A)', name: 'Optical Fiber Communication' },
      { code: 'EC-703(B)', name: 'Internet of Things (IoT)' },
    ],
    '8th Semester (VIII)': [
      { code: 'EC-801', name: 'Optical Networks' },
      { code: 'EC-802(A)', name: 'AI & Signal Processing' },
      { code: 'EC-802(B)', name: 'Satellite Communication' },
      { code: 'EC-803(A)', name: 'Radar & Navigation Aids' },
    ],
  },
};

export function getSubjectsForBranchAndSemester(
  branch: string,
  semester: string
): RGPVSubjectOption[] {
  if (!branch || !semester) return [];
  return RGPV_SUBJECT_CATALOG[branch]?.[semester] || [];
}
