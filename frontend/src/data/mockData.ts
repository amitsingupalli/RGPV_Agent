import { Unit, PYQQuestion, DaySchedule, StudentProfile, LangGraphTraceNode } from '../types';

export const initialStudentProfile: StudentProfile = {
  program: 'B.Tech',
  branch: 'Computer Science & Engineering',
  semester: '4th Semester (IV)',
  subjectCode: 'CS-403',
  subjectName: 'Database Management Systems (DBMS)',
  targetScore: 82,
  dailyHoursCap: 2.5,
  examDate: '2026-10-12',
  language: 'en',
  planApproved: false,
  hitlInterruptActive: true,
  hitlInterruptReason: 'Study Plan Generated — Awaiting Your Review & Constraint Approval',
};

export const pyqQuestions: PYQQuestion[] = [
  {
    id: 'pyq-1',
    year: 2024,
    season: 'May/June',
    questionNumber: 'Q.3(a)',
    text: 'What do you understand by Functional Dependency? Explain 1NF, 2NF and 3NF with suitable example relations. Differentiate between 3NF and BCNF.',
    marks: 10,
    unitId: 'unit-3',
    topicId: 'topic-3-1',
    confidence: 96,
    historicalAppearanceCount: 5,
    pageRef: 'Doc: PYQ-2024-May, Page 2',
  },
  {
    id: 'pyq-2',
    year: 2024,
    season: 'May/June',
    questionNumber: 'Q.4(b)',
    text: 'Consider relation R(A, B, C, D, E) with FDs { A->B, BC->E, ED->A }. Find all candidate keys of R and check if decomposition is lossless.',
    marks: 7,
    unitId: 'unit-3',
    topicId: 'topic-3-2',
    confidence: 93,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2024-May, Page 3',
  },
  {
    id: 'pyq-3',
    year: 2023,
    season: 'Nov/Dec',
    questionNumber: 'Q.5(a)',
    text: 'Define ACID properties of transaction. Explain Conflict Serializability and View Serializability with non-trivial precedence graph examples.',
    marks: 10,
    unitId: 'unit-4',
    topicId: 'topic-4-1',
    confidence: 95,
    historicalAppearanceCount: 5,
    pageRef: 'Doc: PYQ-2023-Dec, Page 2',
  },
  {
    id: 'pyq-4',
    year: 2023,
    season: 'Nov/Dec',
    questionNumber: 'Q.5(b)',
    text: 'What is Two-Phase Locking (2PL) protocol? How does strict 2PL prevent cascading aborts in concurrent transactions?',
    marks: 7,
    unitId: 'unit-4',
    topicId: 'topic-4-2',
    confidence: 91,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2023-Dec, Page 3',
  },
  {
    id: 'pyq-5',
    year: 2023,
    season: 'May/June',
    questionNumber: 'Q.2(a)',
    text: 'Explain ER model concepts: Strong vs Weak Entity sets, Total vs Partial Participation, with a University Course Registration ER diagram.',
    marks: 10,
    unitId: 'unit-1',
    topicId: 'topic-1-1',
    confidence: 92,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2023-May, Page 1',
  },
  {
    id: 'pyq-6',
    year: 2022,
    season: 'Nov/Dec',
    questionNumber: 'Q.1(b)',
    text: 'Describe Three-Schema Architecture of DBMS. How does it ensure physical and logical data independence?',
    marks: 7,
    unitId: 'unit-1',
    topicId: 'topic-1-2',
    confidence: 89,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2022-Dec, Page 1',
  },
  {
    id: 'pyq-7',
    year: 2022,
    season: 'May/June',
    questionNumber: 'Q.3(b)',
    text: 'Write SQL queries using GROUP BY, HAVING and aggregate functions to find departments where average salary exceeds 60,000.',
    marks: 7,
    unitId: 'unit-2',
    topicId: 'topic-2-1',
    confidence: 94,
    historicalAppearanceCount: 5,
    pageRef: 'Doc: PYQ-2022-May, Page 2',
  },
  {
    id: 'pyq-8',
    year: 2022,
    season: 'May/June',
    questionNumber: 'Q.4(a)',
    text: 'Compare Relational Algebra fundamental operations (Select, Project, Union, Set Difference, Cartesian Product, Rename) with SQL syntax.',
    marks: 10,
    unitId: 'unit-2',
    topicId: 'topic-2-2',
    confidence: 88,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2022-May, Page 2',
  },
  {
    id: 'pyq-9',
    year: 2021,
    season: 'Nov/Dec',
    questionNumber: 'Q.6(a)',
    text: 'Explain B-Tree and B+ Tree indexing structures. Why are B+ Trees preferred over B-Trees for database file organization on secondary disks?',
    marks: 10,
    unitId: 'unit-5',
    topicId: 'topic-5-1',
    confidence: 95,
    historicalAppearanceCount: 5,
    pageRef: 'Doc: PYQ-2021-Dec, Page 3',
  },
  {
    id: 'pyq-10',
    year: 2021,
    season: 'May/June',
    questionNumber: 'Q.7(a)',
    text: 'Explain RAID architectures (RAID 0, 1, 5, 10). Discuss redundancy, striping, and fault-tolerance trade-offs.',
    marks: 7,
    unitId: 'unit-5',
    topicId: 'topic-5-2',
    confidence: 87,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2021-May, Page 4',
  },
  {
    id: 'pyq-11',
    year: 2021,
    season: 'May/June',
    questionNumber: 'Q.3(a)',
    text: 'State and prove Armstrong’s Axioms for functional dependencies. Define attribute closure algorithm with sample execution.',
    marks: 7,
    unitId: 'unit-3',
    topicId: 'topic-3-1',
    confidence: 90,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2021-May, Page 2',
  },
  {
    id: 'pyq-12',
    year: 2020,
    season: 'Nov/Dec',
    questionNumber: 'Q.4(a)',
    text: 'How are deadlocks detected in database concurrency control using Wait-For Graphs (WFG)? Explain Wait-Die and Wound-Wait schemes.',
    marks: 10,
    unitId: 'unit-4',
    topicId: 'topic-4-2',
    confidence: 92,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2020-Dec, Page 3',
  },
  {
    id: 'pyq-13',
    year: 2020,
    season: 'May/June',
    questionNumber: 'Q.2(b)',
    text: 'Explain Specialization, Generalization and Aggregation in Extended ER (EER) modeling with appropriate diagrammatic examples.',
    marks: 7,
    unitId: 'unit-1',
    topicId: 'topic-1-1',
    confidence: 88,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2020-May, Page 1',
  },
  {
    id: 'pyq-14',
    year: 2020,
    season: 'May/June',
    questionNumber: 'Q.3(c)',
    text: 'Explain Correlated vs Nested Subqueries in SQL with an employee department query example.',
    marks: 7,
    unitId: 'unit-2',
    topicId: 'topic-2-1',
    confidence: 89,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2020-May, Page 2',
  },
  {
    id: 'pyq-15',
    year: 2024,
    season: 'May/June',
    questionNumber: 'Q.1(a)',
    text: 'What are database users and DBMS storage managers? Differentiate between file processing systems and DBMS.',
    marks: 7,
    unitId: 'unit-1',
    topicId: 'topic-1-2',
    confidence: 90,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2024-May, Page 1',
  },
  {
    id: 'pyq-16',
    year: 2023,
    season: 'Nov/Dec',
    questionNumber: 'Q.3(b)',
    text: 'Explain Lossless Join Decomposition and Dependency Preserving Decomposition with formal mathematical definitions.',
    marks: 10,
    unitId: 'unit-3',
    topicId: 'topic-3-2',
    confidence: 93,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2023-Dec, Page 2',
  },
  {
    id: 'pyq-17',
    year: 2022,
    season: 'Nov/Dec',
    questionNumber: 'Q.5(a)',
    text: 'Explain Recovery Management in DBMS. Contrast Log-Based Recovery (Deferred vs Immediate database modification) and Checkpoints.',
    marks: 10,
    unitId: 'unit-4',
    topicId: 'topic-4-1',
    confidence: 91,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2022-Dec, Page 3',
  },
  {
    id: 'pyq-18',
    year: 2022,
    season: 'May/June',
    questionNumber: 'Q.6(b)',
    text: 'Explain Static Hashing vs Dynamic Hashing (Extendible Hashing). How does Extendible Hashing handle bucket overflows?',
    marks: 7,
    unitId: 'unit-5',
    topicId: 'topic-5-2',
    confidence: 86,
    historicalAppearanceCount: 2,
    pageRef: 'Doc: PYQ-2022-May, Page 3',
  },
  {
    id: 'pyq-19',
    year: 2021,
    season: 'Nov/Dec',
    questionNumber: 'Q.2(a)',
    text: 'How to convert ER diagram schemas into Relational Tables? Explain mapping of 1:1, 1:N, M:N and weak entities.',
    marks: 10,
    unitId: 'unit-1',
    topicId: 'topic-1-1',
    confidence: 94,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2021-Dec, Page 1',
  },
  {
    id: 'pyq-20',
    year: 2020,
    season: 'Nov/Dec',
    questionNumber: 'Q.3(a)',
    text: 'Write relational algebra expressions for Natural Join, Theta Join, Outer Joins (Left, Right, Full) with schemas.',
    marks: 7,
    unitId: 'unit-2',
    topicId: 'topic-2-2',
    confidence: 89,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2020-Dec, Page 2',
  },
  {
    id: 'pyq-21',
    year: 2024,
    season: 'May/June',
    questionNumber: 'Q.5(b)',
    text: 'Explain timestamp-based concurrency control protocol and Thomas’s Write Rule with scheduling table.',
    marks: 7,
    unitId: 'unit-4',
    topicId: 'topic-4-2',
    confidence: 88,
    historicalAppearanceCount: 3,
    pageRef: 'Doc: PYQ-2024-May, Page 3',
  },
  {
    id: 'pyq-22',
    year: 2023,
    season: 'May/June',
    questionNumber: 'Q.6(a)',
    text: 'Explain Dense Index vs Sparse Index and Primary Index vs Clustering Index with physical memory disk block sketches.',
    marks: 7,
    unitId: 'unit-5',
    topicId: 'topic-5-1',
    confidence: 92,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2023-May, Page 3',
  },
  {
    id: 'pyq-23',
    year: 2021,
    season: 'May/June',
    questionNumber: 'Q.4(b)',
    text: 'What are SQL Integrity Constraints? Explain Primary Key, Foreign Key (Referential Integrity), UNIQUE, CHECK, and ON DELETE CASCADE.',
    marks: 7,
    unitId: 'unit-2',
    topicId: 'topic-2-1',
    confidence: 91,
    historicalAppearanceCount: 4,
    pageRef: 'Doc: PYQ-2021-May, Page 2',
  },
  {
    id: 'pyq-24',
    year: 2020,
    season: 'May/June',
    questionNumber: 'Q.5(a)',
    text: 'Discuss Boyce-Codd Normal Form (BCNF). Give a practical relation schema that satisfies 3NF but violates BCNF, and decompose it.',
    marks: 10,
    unitId: 'unit-3',
    topicId: 'topic-3-1',
    confidence: 97,
    historicalAppearanceCount: 5,
    pageRef: 'Doc: PYQ-2020-May, Page 2',
  },
];

export const curriculumUnits: Unit[] = [
  {
    id: 'unit-1',
    number: 1,
    title: 'Introduction & Entity-Relationship (ER) Modeling',
    code: 'UNIT-I',
    description: 'DBMS Architecture, Data Independence, Entity-Relationship Models, Weak Entities, Extended ER (Generalization/Specialization), and Relational Schema Mapping.',
    weightMarks: 14,
    topics: [
      {
        id: 'topic-1-1',
        unitId: 'unit-1',
        title: 'ER Modeling & Relational Schema Mapping',
        syllabusWeight: 55,
        frequencyScore: 88,
        appearancesCount: 5,
        totalMarksInPast5Years: 37,
        difficultyScore: 60,
        difficultyLabel: 'Moderate',
        masteryPercentage: 65,
        mappedPYQIds: ['pyq-5', 'pyq-13', 'pyq-19'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'An Entity-Relationship (ER) diagram is a conceptual data modeling tool representing real-world entities, their attributes, and relationships. Relational schema mapping converts entities into relations (tables), where keys and foreign key constraints enforce cardinalities and entity integrity.',
            hi: 'ER Model ek conceptual design tool hai jo real-world entities aur unke aapas ke relationships ko represent karta hai. Schema mapping ke dauran hum entities ko tables me convert karte hain, aur 1:1, 1:N, ya M:N cardinalities ko foreign keys ke through implement karte hain.'
          },
          analogy: {
            title: 'College Fest Management System',
            en: 'Think of an Event (Entity) having multiple Registered Students. A 1:N relationship means a student can register for multiple events, but each registration ticket belongs to exactly one student. The Ticket is like a weak entity that cannot exist without the Student ID.',
            hi: 'Maan lijiye college fest ka portal hai. "Student" ek strong entity hai (RollNo primary key). "Event Ticket" ek weak entity hai—agar student hi nahi hoga toh ticket ka akele koi matlab nahi banta!'
          },
          workedExample: {
            problemStatement: 'Convert Weak Entity "DEPENDENT" linked to "EMPLOYEE" via 1:N identifying relationship "HAS_DEPENDENT" into relational schema.',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Identify Strong Entity Schema',
                content: 'EMPLOYEE(EmpId [PK], EmpName, Department, Salary)'
              },
              {
                step: 2,
                title: 'Identify Discriminator and Foreign Key for Weak Entity',
                content: 'DEPENDENT has partial key (DepName) and requires identifying parent EmpId.',
                codeSnippet: 'CREATE TABLE Dependent (\n  EmpId INT,\n  DepName VARCHAR(50),\n  Relationship VARCHAR(30),\n  PRIMARY KEY (EmpId, DepName),\n  FOREIGN KEY (EmpId) REFERENCES Employee(EmpId) ON DELETE CASCADE\n);'
              },
              {
                step: 3,
                title: 'Verify Primary Key Composition',
                content: 'The combined key {EmpId, DepName} guarantees uniqueness across all dependents in the firm.'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Forgetting double rectangle notation for Weak Entity in RGPV exam diagrams',
              penalty: 'Deduction of 2 marks out of 7',
              remedy: 'Always draw weak entity with double rectangular border and partial key with dashed underline.'
            },
            {
              mistake: 'Failing to include parent Primary Key in Weak Entity relation schema',
              penalty: 'Deduction of 3 marks',
              remedy: 'A weak entity table MUST include the identifying strong entity PK as part of its composite PK.'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.2(a) Draw an ER diagram for a Hospital Management System showing weak entity and ternary relationship. Map it into relational tables. [10 Marks]',
            standardMarks: 10,
            gradingRubricHighlight: 'Diagram (4M) + Cardinality notations (2M) + Table schemas with PK/FK identified (4M).'
          },
          diagnosticCheck: {
            question: 'In mapping an M:N relationship between Student and Course into relational schema, what is required?',
            options: [
              'Add CourseId as foreign key into Student table',
              'Create a separate junction table containing {StudentId, CourseId} as composite primary key',
              'Add StudentId into Course table',
              'Merge Student and Course into a single relation'
            ],
            correctAnswerIndex: 1,
            explanation: 'M:N relationships cannot be represented by adding foreign keys to existing tables without violating 1NF; a new relationship table with both primary keys is mandatory.'
          },
          citations: [
            {
              id: 'cite-1-1',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 1,
              excerpt: 'Unit I: Data modeling using the Entity-Relationship (ER) model. Entity types, entity sets, attributes and keys. Weak entity sets, ER-to-relational mapping.',
              context: 'Section 1.3: Relational Database Schema Design'
            },
            {
              id: 'cite-1-2',
              docName: 'RGPV Exam Paper June 2023',
              page: 1,
              excerpt: 'Question 2(a): Explain ER model concepts: Strong vs Weak Entity sets, Total vs Partial Participation with example.',
              context: '10-Mark Core Analytical Question'
            }
          ]
        }
      },
      {
        id: 'topic-1-2',
        unitId: 'unit-1',
        title: 'Three-Schema Architecture & Data Independence',
        syllabusWeight: 45,
        frequencyScore: 72,
        appearancesCount: 4,
        totalMarksInPast5Years: 24,
        difficultyScore: 40,
        difficultyLabel: 'Low',
        masteryPercentage: 78,
        mappedPYQIds: ['pyq-6', 'pyq-15'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'The ANSI/SPARC Three-Schema Architecture partitions a DBMS into Physical (Internal), Conceptual (Logical), and External (View) levels. It separates user views from physical disk storage to achieve logical and physical data independence.',
            hi: 'Three-Schema architecture database ko 3 levels me divide karta hai: Internal level (physical storage), Conceptual level (logical tables aur constraints), aur External level (end-user views). Iska main objective data independence provide karna hai.'
          },
          analogy: {
            title: 'Car Driving Interface vs Engine Mechanics',
            en: 'External level is the steering wheel and speedometer. Conceptual level is the transmission logic and wiring diagram. Physical level is the internal combustion cylinders and spark plug arrangement. Upgrading spark plugs does not change how you turn the steering wheel!',
            hi: 'External level user ka dashboard hai. Conceptual level engine ka blueprint hai. Internal level actual metal pistons aur petrol injection hai. Mechanic engine upgrade kare tab bhi steering chalaane ka tareeka nahi badalta (Physical Data Independence)!'
          },
          workedExample: {
            problemStatement: 'Differentiate between Physical and Logical Data Independence with concrete DBMS alteration scenarios.',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Physical Data Independence',
                content: 'Capacity to alter internal schema (e.g., adding B+ tree index or moving to SSD) without modifying conceptual schema or existing application queries.'
              },
              {
                step: 2,
                title: 'Logical Data Independence',
                content: 'Capacity to modify conceptual schema (e.g., adding a new attribute or splitting a table) without forcing changes on existing external views.'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Confusing logical independence with physical independence',
              penalty: 'Loss of 3 marks in 7-mark question',
              remedy: 'Remember: Logical = Conceptual level changes without affecting Views. Physical = Storage level changes without affecting Conceptual level.'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.1(b) Describe Three-Schema Architecture of DBMS with a neat diagram. How does it achieve physical and logical data independence? [7 Marks]',
            standardMarks: 7,
            gradingRubricHighlight: 'Neat 3-tier diagram (3M) + Physical independence explanation (2M) + Logical independence explanation (2M).'
          },
          diagnosticCheck: {
            question: 'Changing the storage structure from sequential file to B+ Tree index without altering existing SQL queries is an example of:',
            options: [
              'Logical Data Independence',
              'Physical Data Independence',
              'View Independence',
              'Schema Decomposition'
            ],
            correctAnswerIndex: 1,
            explanation: 'Internal physical storage structure alteration without changing conceptual schema demonstrates Physical Data Independence.'
          },
          citations: [
            {
              id: 'cite-1-3',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 1,
              excerpt: 'Unit I: Three-tier schema architecture and data independence (physical and logical). Storage management.',
              context: 'Section 1.1: Foundational Database Architecture'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'unit-2',
    number: 2,
    title: 'Relational Model, Relational Algebra & SQL',
    code: 'UNIT-II',
    description: 'Relational Algebra (Select, Project, Cartesian Product, Joins), SQL DDL/DML, GROUP BY / HAVING, Subqueries, and Integrity Constraints.',
    weightMarks: 14,
    topics: [
      {
        id: 'topic-2-1',
        unitId: 'unit-2',
        title: 'SQL Complex Queries (GROUP BY, HAVING, Subqueries)',
        syllabusWeight: 50,
        frequencyScore: 92,
        appearancesCount: 5,
        totalMarksInPast5Years: 35,
        difficultyScore: 68,
        difficultyLabel: 'Moderate',
        masteryPercentage: 58,
        mappedPYQIds: ['pyq-7', 'pyq-14', 'pyq-23'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'GROUP BY groups rows sharing identical values into summary rows. HAVING filters aggregated groups (post-aggregation), whereas WHERE filters individual tuples before grouping occurs. Correlated subqueries execute once for each candidate row evaluated by the outer query.',
            hi: 'GROUP BY rows ko aggregate karne ke liye use hota hai (jaise department wise count ya sum). HAVING clause aggregated groups par filter lagata hai, jabki WHERE individual rows par kaam karta hai. WHERE me aggregate functions (SUM, AVG) allowed nahi hote!'
          },
          analogy: {
            title: 'College Cricket Team Selection',
            en: 'WHERE clause is like selecting only students taller than 5\'8" to try out. GROUP BY forms teams by Department. HAVING is filtering only those departments that managed to assemble at least 11 players!',
            hi: 'WHERE clause se hum pehle un players ko chhaantte hain jo eligible hain. Fir GROUP BY se Branch-wise team banate hain. Fir HAVING lagate hain ki sirf wahi branches select ho jinke paas kam se kam 11 players ready hon!'
          },
          workedExample: {
            problemStatement: 'Given schema Employee(EmpId, Name, DeptId, Salary), write query to find DeptId and AvgSalary for departments having more than 5 employees and average salary > 50,000.',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Formulate Aggregation Query',
                content: 'Use AVG(Salary) and COUNT(EmpId) grouped by DeptId.',
                codeSnippet: 'SELECT DeptId, AVG(Salary) AS AvgSalary\nFROM Employee\nGROUP BY DeptId\nHAVING COUNT(EmpId) > 5 AND AVG(Salary) > 50000;'
              },
              {
                step: 2,
                title: 'Explain Execution Order',
                content: 'FROM Employee -> GROUP BY DeptId -> HAVING filter applied -> SELECT projections evaluated.'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Using aggregate function inside WHERE clause (e.g. WHERE AVG(Salary) > 50000)',
              penalty: 'Zero marks for the SQL query portion (3-4 marks lost)',
              remedy: 'WHERE executes before grouping. Aggregate filtering MUST ALWAYS go into HAVING clause.'
            },
            {
              mistake: 'Selecting un-aggregated columns not present in GROUP BY clause',
              penalty: 'Deduction of 2 marks',
              remedy: 'Every column in SELECT must either be listed in GROUP BY or enclosed inside an aggregate function.'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.3(b) Consider Employee(EmpNo, EName, Job, Sal, DeptNo). Write SQL query to list jobs where maximum salary exceeds 40,000. [7 Marks]',
            standardMarks: 7,
            gradingRubricHighlight: 'Correct GROUP BY (3M) + HAVING MAX(Sal) > 40000 (3M) + Syntactic correctness (1M).'
          },
          diagnosticCheck: {
            question: 'Which SQL statement will trigger an execution error?',
            options: [
              'SELECT DeptId, COUNT(*) FROM Employee GROUP BY DeptId;',
              'SELECT DeptId, AVG(Salary) FROM Employee WHERE AVG(Salary) > 30000 GROUP BY DeptId;',
              'SELECT DeptId, AVG(Salary) FROM Employee GROUP BY DeptId HAVING AVG(Salary) > 30000;',
              'SELECT DeptId, MAX(Salary) FROM Employee WHERE Salary > 20000 GROUP BY DeptId;'
            ],
            correctAnswerIndex: 1,
            explanation: 'WHERE clause cannot contain aggregate functions like AVG(Salary); this must be placed in HAVING.'
          },
          citations: [
            {
              id: 'cite-2-1',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 2,
              excerpt: 'Unit II: SQL data definition and data manipulation. Complex queries, nested subqueries, grouping and aggregation functions, integrity constraints.',
              context: 'Section 2.2: Advanced SQL Query Formulation'
            }
          ]
        }
      },
      {
        id: 'topic-2-2',
        unitId: 'unit-2',
        title: 'Relational Algebra & Set Operators',
        syllabusWeight: 50,
        frequencyScore: 80,
        appearancesCount: 4,
        totalMarksInPast5Years: 27,
        difficultyScore: 55,
        difficultyLabel: 'Moderate',
        masteryPercentage: 62,
        mappedPYQIds: ['pyq-8', 'pyq-20'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'Relational algebra is a procedural query language consisting of fundamental operators: Selection (σ), Projection (π), Union (∪), Set Difference (-), Cartesian Product (×), and Rename (ρ). Derived operators include Joins (⋈) and Division (÷).',
            hi: 'Relational Algebra ek procedural query language hai jo input me relations le kar output me naya relation deti hai. 6 basic operators hote hain: Selection (sigma), Projection (pi), Union, Set Difference, Cartesian Product, aur Rename.'
          },
          analogy: {
            title: 'Spreadsheet Filter and Column Hide',
            en: 'Selection (σ) is filtering rows that meet criteria. Projection (π) is hiding unneeded columns to keep only the ones you want. Join (⋈) is VLOOKUP connecting two sheets on a common ID.',
            hi: 'Selection (sigma) horizontal slicing hai (rows filter karna). Projection (pi) vertical slicing hai (sirf selected columns rakhna). Join do alag tables ko common key par merge karta hai.'
          },
          workedExample: {
            problemStatement: 'Express query in Relational Algebra: Find names of employees working in department "Research". Given Employee(EId, EName, DNo) and Department(DNo, DName).',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Filter Research Department',
                content: 'σ_{DName = "Research"} (Department)'
              },
              {
                step: 2,
                title: 'Natural Join with Employee',
                content: 'Employee ⋈ (σ_{DName = "Research"} (Department))'
              },
              {
                step: 3,
                title: 'Project Employee Name',
                content: 'π_{EName} (Employee ⋈ (σ_{DName = "Research"} (Department)))'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Using Selection (σ) to select columns instead of rows',
              penalty: 'Immediate deduction of 3 marks',
              remedy: 'Remember: σ (Sigma) is for Rows (Horizontal condition), π (Pi) is for Columns (Vertical attributes).'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.4(a) State and explain fundamental operators of Relational Algebra with suitable schema and examples. [10 Marks]',
            standardMarks: 10,
            gradingRubricHighlight: '6 fundamental operators with symbols and formulas (6M) + Worked examples (4M).'
          },
          diagnosticCheck: {
            question: 'Which of the following is NOT a fundamental operator in relational algebra?',
            options: [
              'Selection (σ)',
              'Projection (π)',
              'Natural Join (⋈)',
              'Cartesian Product (×)'
            ],
            correctAnswerIndex: 2,
            explanation: 'Natural Join (⋈) is a derived operator defined as a composition of Cartesian Product, Selection, and Projection.'
          },
          citations: [
            {
              id: 'cite-2-2',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 2,
              excerpt: 'Unit II: Relational Algebra: fundamental operations, additional operations, tuple relational calculus.',
              context: 'Section 2.1: Formal Relational Query Languages'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'unit-3',
    number: 3,
    title: 'Relational Database Design & Normalization',
    code: 'UNIT-III',
    description: 'Functional Dependencies, Attribute Closure, Armstrong\'s Axioms, 1NF, 2NF, 3NF, BCNF, Lossless Join & Dependency Preservation.',
    weightMarks: 16,
    topics: [
      {
        id: 'topic-3-1',
        unitId: 'unit-3',
        title: 'Normalization (1NF, 2NF, 3NF vs BCNF)',
        syllabusWeight: 60,
        frequencyScore: 98,
        appearancesCount: 5,
        totalMarksInPast5Years: 42,
        difficultyScore: 78,
        difficultyLabel: 'High Cognitive Load',
        masteryPercentage: 42, // Weak topic for student!
        mappedPYQIds: ['pyq-1', 'pyq-11', 'pyq-24'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'Normalization systematically eliminates data redundancy, insertion anomalies, update anomalies, and deletion anomalies. 1NF eliminates repeating groups/arrays; 2NF eliminates partial dependencies (non-prime attributes depending on subset of candidate key); 3NF eliminates transitive dependencies (X->Y where X is superkey OR Y is prime attribute); BCNF strictly mandates that for every non-trivial FD X->Y, X must be a superkey.',
            hi: 'Normalization database tables ko aise divide karta hai taaki redundancy aur anomalies (Insert, Update, Delete) khatam ho sakein. 1NF: Atomic values. 2NF: No partial dependency (non-prime attribute candidate key ke part par depend na kare). 3NF: No transitive dependency. BCNF me rule strict hai: Har functional dependency X->A me LHS (X) Super Key hi hona chahiye.'
          },
          analogy: {
            title: 'Hostel Room Allotment Register',
            en: 'Imagine storing StudentName, RoomNumber, and HostelWardenName all in one table. If a warden resigns, you have to update 500 rows (Update anomaly). If a room is empty for renovation, you cannot insert the new warden without a student roll number (Insert anomaly). Normalizing splits it into StudentRoom and HostelWarden tables!',
            hi: 'Agar ek hi sheet me Student ka naam, uski Fees, aur uske HOD ka phone number likha ho: Jab HOD badlega toh poore 1000 bacchon ke records update karne padenge! Agar table tod do (Student table alag, Department HOD table alag), toh ek hi jagah HOD update hoga.'
          },
          workedExample: {
            problemStatement: 'Consider R(Student, Subject, Teacher) with FDs { (Student, Subject) -> Teacher, Teacher -> Subject }. Show that R is in 3NF but not in BCNF, and decompose.',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Find Candidate Keys',
                content: 'Compute closure: (Student, Teacher)+ = {Student, Teacher, Subject}. (Student, Subject)+ = {Student, Subject, Teacher}. Candidate keys are {Student, Subject} and {Student, Teacher}. Prime attributes are {Student, Subject, Teacher}.'
              },
              {
                step: 2,
                title: 'Test 3NF Condition',
                content: 'For (Student, Subject)->Teacher: LHS is candidate key (superkey) -> Valid.\nFor Teacher->Subject: LHS (Teacher) is NOT superkey, BUT RHS (Subject) is a prime attribute! Hence, 3NF holds.'
              },
              {
                step: 3,
                title: 'Test BCNF Condition & Decompose',
                content: 'For Teacher->Subject, Teacher is not a superkey. Violates BCNF!\nDecompose into R1(Teacher, Subject) [Teacher is PK] and R2(Student, Teacher) [PK: (Student, Teacher)]. Note: Dependency (Student, Subject)->Teacher is lost!',
                codeSnippet: '-- Decomposed Relations:\nR1(Teacher, Subject) -- BCNF verified\nR2(Student, Teacher) -- BCNF verified'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Claiming 3NF requires LHS to be superkey ONLY',
              penalty: 'Loss of 4 marks out of 10 in RGPV theory answers',
              remedy: 'In 3NF, X->Y is valid if X is superkey OR Y is prime attribute. The prime attribute escape hatch is what separates 3NF from BCNF.'
            },
            {
              mistake: 'Failing to mention that BCNF decomposition does not always preserve functional dependencies',
              penalty: 'Deduction of 2 marks in comparative questions',
              remedy: 'Always emphasize: 3NF guarantees dependency preservation and lossless join; BCNF guarantees lossless join but may sacrifice dependency preservation.'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.3(a) What is Functional Dependency? Differentiate between 3NF and BCNF with a counter-example where 3NF holds but BCNF fails. [10 Marks]',
            standardMarks: 10,
            gradingRubricHighlight: 'FD definition (2M) + 3NF conditions (2M) + BCNF strict superkey rule (2M) + Worked counter example showing lost dependency (4M).'
          },
          diagnosticCheck: {
            question: 'Relation R(A, B, C, D) has candidate key {A, B} and FD C -> D. In which normal form is R guaranteed to NOT be?',
            options: [
              '1NF',
              '2NF',
              '3NF',
              'Both 2NF and 3NF'
            ],
            correctAnswerIndex: 2,
            explanation: 'Since C is non-prime and D is non-prime, C->D is a transitive dependency between non-prime attributes, violating 3NF.'
          },
          citations: [
            {
              id: 'cite-3-1',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 2,
              excerpt: 'Unit III: Relational database design: Features of good relational design. Functional dependencies, normal forms: 1NF, 2NF, 3NF, BCNF. Lossless-join and dependency preservation.',
              context: 'Section 3.1: Normalization and Normal Forms'
            },
            {
              id: 'cite-3-2',
              docName: 'RGPV Exam Paper May 2024',
              page: 2,
              excerpt: 'Question 3(a): What do you understand by Functional Dependency? Explain 1NF, 2NF and 3NF with suitable example relations. Differentiate between 3NF and BCNF. [10 Marks]',
              context: 'High-Frequency Exam Pillar Question'
            }
          ]
        }
      },
      {
        id: 'topic-3-2',
        unitId: 'unit-3',
        title: 'Decomposition Properties (Lossless Join & Dependency Preservation)',
        syllabusWeight: 40,
        frequencyScore: 84,
        appearancesCount: 4,
        totalMarksInPast5Years: 31,
        difficultyScore: 72,
        difficultyLabel: 'High Cognitive Load',
        masteryPercentage: 38, // Weak topic
        mappedPYQIds: ['pyq-2', 'pyq-16'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'A decomposition of R into R1 and R2 is Lossless Join if and only if R1 ∩ R2 -> R1 or R1 ∩ R2 -> R2 (i.e., their common attribute is a superkey of at least one sub-relation). Dependency preservation requires that the union of FDs enforceable on R1 and R2 equals F+.',
            hi: 'Lossless Join ka matlab hai ki jab R1 aur R2 ka natural join karein, toh na koi spurious tuple generate ho aur na koi data lose ho. Iska rule simple hai: Common attributes (R1 ∩ R2) kam se kam kisi ek sub-relation ke superkey hone chahiye.'
          },
          analogy: {
            title: 'Ripping a Paper Ticket in Half',
            en: 'If you tear a train ticket in half, both halves must have the PNR Number printed on them. If only one side has the PNR, you cannot verify who owns the other half when recombining!',
            hi: 'Agar aap cinema ticket ko do tukdon me faadte hain, dono tukdon par Seat Number likha hona chahiye, warna baad me dono hisse jodte waqt confusion ho jayega (spurious tuples ban jaayenge)!'
          },
          workedExample: {
            problemStatement: 'Relation R(A, B, C) with FDs { A->B }. Is decomposition into R1(A, B) and R2(B, C) lossless?',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Find Common Attribute',
                content: 'R1 ∩ R2 = {B}'
              },
              {
                step: 2,
                title: 'Check Closure of Common Attribute',
                content: 'B+ = {B}. B does not determine A (R1) nor does B determine C (R2).'
              },
              {
                step: 3,
                title: 'Conclusion',
                content: 'Since B is not a superkey in R1 or R2, joining R1 and R2 produces SPURIOUS TUPLES. Hence, the decomposition is LOSSY (Not Lossless).'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Assuming R1 ∪ R2 = R is sufficient for lossless join',
              penalty: 'Immediate 4 marks deduction out of 7',
              remedy: 'Attribute preservation (R1 ∪ R2 = R) is trivial; lossless join strictly requires R1 ∩ R2 -> R1 or R1 ∩ R2 -> R2.'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.4(b) Consider R(A,B,C,D,E) with FDs { A->B, BC->E, ED->A }. Find candidate keys and test lossless join condition. [7 Marks]',
            standardMarks: 7,
            gradingRubricHighlight: 'Candidate key computation (3M) + Lossless join mathematical proof (4M).'
          },
          diagnosticCheck: {
            question: 'For a decomposition of R into R1 and R2 to be lossless join, which condition is necessary and sufficient?',
            options: [
              'R1 ∩ R2 must contain all prime attributes',
              '(R1 ∩ R2 -> R1) OR (R1 ∩ R2 -> R2) in F+',
              'R1 and R2 must have no common attributes',
              'Both R1 and R2 must be in BCNF'
            ],
            correctAnswerIndex: 1,
            explanation: 'The common attributes must form a superkey of at least one of the decomposed relations to prevent false cartesian combinations.'
          },
          citations: [
            {
              id: 'cite-3-3',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 2,
              excerpt: 'Unit III: Testing for lossless join decomposition and testing for dependency preservation algorithm.',
              context: 'Section 3.3: Relational Design Algorithms'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'unit-4',
    number: 4,
    title: 'Transaction Management & Concurrency Control',
    code: 'UNIT-IV',
    description: 'Transaction concepts, ACID Properties, Conflict and View Serializability, 2PL Protocol, Deadlock Handling (WFG, Wait-Die, Wound-Wait), and Recovery.',
    weightMarks: 14,
    topics: [
      {
        id: 'topic-4-1',
        unitId: 'unit-4',
        title: 'ACID Properties & Serializability (Conflict vs View)',
        syllabusWeight: 50,
        frequencyScore: 94,
        appearancesCount: 5,
        totalMarksInPast5Years: 37,
        difficultyScore: 70,
        difficultyLabel: 'High Cognitive Load',
        masteryPercentage: 70,
        mappedPYQIds: ['pyq-3', 'pyq-17'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'ACID stands for Atomicity (all or nothing), Consistency (preserves database integrity constraints), Isolation (concurrent execution equivalent to serial), and Durability (committed changes persist across crashes). A concurrent schedule is Conflict Serializable if it can be transformed into a serial schedule by swapping non-conflicting instructions (where conflict requires two operations on same data item and at least one is a write).',
            hi: 'ACID properties transaction ki reliability guarantee karti hain: Atomicity (poora execute hoga ya bilkul nahi), Consistency (rules valid rahenge), Isolation (do transactions ek dusre ko disturb na karein), Durability (commit ke baad power cut ho tab bhi data save rahega). Conflict serializability check karne ke liye Precedence Graph (Testing Graph) banate hain—agar graph me cycle nahi hai toh schedule conflict serializable hai!'
          },
          analogy: {
            title: 'ATM Cash Withdrawal System',
            en: 'If you withdraw ₹5,000, two things happen: account balance deducted, cash dispenser ejects notes. If dispenser jams after balance deduction, Atomicity rolls back the balance deduction! Durability guarantees that even if bank server crashes 1 second after "Transaction Successful", your balance stays updated.',
            hi: 'ATM se paise nikaalte waqt agar account se paise kat gaye par machine se cash nahi nikla, toh Atomicity ki wajah se transaction rollback ho jata hai aur paise wapas account me credit ho jaate hain!'
          },
          workedExample: {
            problemStatement: 'Schedule S: R1(A), W1(A), R2(A), W2(A), R1(B), W1(B). Draw precedence graph and test conflict serializability.',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Identify Conflicting Operations',
                content: 'On item A: W1(A) precedes R2(A) [T1 -> T2]. W1(A) precedes W2(A) [T1 -> T2].\nOn item B: None between T1 and T2.'
              },
              {
                step: 2,
                title: 'Construct Precedence Graph',
                content: 'Nodes: {T1, T2}. Directed edge: T1 -> T2.'
              },
              {
                step: 3,
                title: 'Analyze Cycle & Determine Serial Order',
                content: 'The graph has NO cycle. Therefore, schedule S is Conflict Serializable. Equivalent serial order is T1 followed by T2.'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Drawing precedence graph edges between two Read operations (R1(A) and R2(A))',
              penalty: 'Zero marks on precedence graph (3 marks lost)',
              remedy: 'Two READ operations NEVER conflict! Conflict requires at least one WRITE operation on the same data item.'
            },
            {
              mistake: 'Failing to state equivalent serial schedule order when schedule is serializable',
              penalty: 'Deduction of 2 marks',
              remedy: 'Always perform topological sort on the acyclic graph and write: "Equivalent serial schedule: T1 -> T2".'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.5(a) Define ACID properties. Test whether the following schedule is conflict serializable using precedence graph. [10 Marks]',
            standardMarks: 10,
            gradingRubricHighlight: 'ACID definitions (3M) + Conflict pairs identification (3M) + Precedence graph drawing & cycle check (4M).'
          },
          diagnosticCheck: {
            question: 'Which of the following pair of concurrent transaction operations is NON-CONFLICTING?',
            options: [
              'T1: Read(X), T2: Write(X)',
              'T1: Write(X), T2: Write(X)',
              'T1: Read(X), T2: Read(X)',
              'T1: Write(X), T2: Read(X)'
            ],
            correctAnswerIndex: 2,
            explanation: 'Concurrent reads on the same data item do not conflict because reading does not modify data state.'
          },
          citations: [
            {
              id: 'cite-4-1',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 3,
              excerpt: 'Unit IV: Transaction concept, transaction state, ACID properties, serializability, testing for serializability, conflict serializability, view serializability.',
              context: 'Section 4.1: Transaction Processing Principles'
            }
          ]
        }
      },
      {
        id: 'topic-4-2',
        unitId: 'unit-4',
        title: 'Two-Phase Locking (2PL) & Deadlock Management',
        syllabusWeight: 50,
        frequencyScore: 88,
        appearancesCount: 4,
        totalMarksInPast5Years: 31,
        difficultyScore: 65,
        difficultyLabel: 'Moderate',
        masteryPercentage: 55,
        mappedPYQIds: ['pyq-4', 'pyq-12', 'pyq-21'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'Two-Phase Locking (2PL) requires transactions to acquire locks in a Growing Phase and release locks in a Shrinking Phase, guaranteeing conflict serializability. Strict 2PL holds all Exclusive locks until commit/abort, preventing cascading aborts. Deadlocks are resolved using Wait-For Graphs (cycle detection) or timestamp schemes: Wait-Die (non-preemptive) and Wound-Wait (preemptive).',
            hi: '2PL me transaction do phases me kaam karta hai: Growing phase (sirf locks acquire kar sakta hai, release nahi) aur Shrinking phase (sirf locks release kar sakta hai, naya lock nahi le sakta). Strict 2PL me saare exclusive locks commit ke baad hi release hote hain taaki cascading aborts na hon.'
          },
          analogy: {
            title: 'Library Reserved Research Cubicle',
            en: 'Growing phase: You gather all the books you need from shelves and lock your cubicle door. Shrinking phase: You begin returning books one by one. Once you return the first book, the librarian forbids you from picking up any new books!',
            hi: 'Growing Phase: Aap exam hall me entry lete waqt calculator, pen, admit card sab ikattha karte hain. Shrinking Phase: Paper submit hone par cheezein pack karte hain. Ek baar desk chhod di toh wapas nayi cheez lene ki permission nahi hoti.'
          },
          workedExample: {
            problemStatement: 'Compare Wait-Die and Wound-Wait deadlock prevention protocols when older transaction T1 requests a resource held by younger transaction T2.',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Wait-Die Protocol (Non-preemptive)',
                content: 'Older T1 requests lock held by younger T2 -> T1 is allowed to WAIT. If younger T2 requests lock held by older T1 -> Younger T2 DIES (rolls back).'
              },
              {
                step: 2,
                title: 'Wound-Wait Protocol (Preemptive)',
                content: 'Older T1 requests lock held by younger T2 -> Older T1 WOUNDS younger T2 (forces T2 to abort & rollback). If younger T2 requests lock held by older T1 -> Younger T2 WAITS.'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Claiming that basic 2PL prevents deadlocks',
              penalty: 'Immediate deduction of 3 marks',
              remedy: 'Basic 2PL guarantees serializability, but DOES NOT prevent deadlocks! Two transactions can easily enter a cyclic wait while growing.'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.4(b) What is 2PL? Differentiate between Strict 2PL and Rigorous 2PL. How does Strict 2PL prevent cascading aborts? [7 Marks]',
            standardMarks: 7,
            gradingRubricHighlight: '2PL phases explanation (3M) + Lock point definition (1M) + Strict 2PL cascading abort prevention (3M).'
          },
          diagnosticCheck: {
            question: 'Under the Wound-Wait deadlock prevention scheme, what happens when an older transaction requests a lock held by a younger transaction?',
            options: [
              'The older transaction dies and rolls back',
              'The older transaction is forced to wait indefinitely',
              'The older transaction wounds (aborts and rolls back) the younger transaction',
              'Both transactions proceed simultaneously without locks'
            ],
            correctAnswerIndex: 2,
            explanation: 'In Wound-Wait (preemptive), the older transaction wounds the younger transaction to seize the required lock immediately.'
          },
          citations: [
            {
              id: 'cite-4-2',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 3,
              excerpt: 'Unit IV: Concurrency control: Lock-based protocols, two-phase locking protocols. Deadlock handling: prevention, detection and recovery.',
              context: 'Section 4.2: Concurrency Protocols'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'unit-5',
    number: 5,
    title: 'Storage Structures, File Organization & Indexing',
    code: 'UNIT-V',
    description: 'Physical Storage Media, RAID Levels, Ordered Indexing, Primary vs Secondary Index, B-Tree vs B+ Tree Index Files, and Hashing.',
    weightMarks: 14,
    topics: [
      {
        id: 'topic-5-1',
        unitId: 'unit-5',
        title: 'B-Tree & B+ Tree Indexing Structures',
        syllabusWeight: 55,
        frequencyScore: 92,
        appearancesCount: 5,
        totalMarksInPast5Years: 34,
        difficultyScore: 74,
        difficultyLabel: 'High Cognitive Load',
        masteryPercentage: 48, // Weak topic (<50%)
        mappedPYQIds: ['pyq-9', 'pyq-22'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'A B+ Tree is a self-balancing search tree where internal nodes store search keys and tree pointers for navigation, while ALL actual data pointers and records reside exclusively in leaf nodes. Leaf nodes are linked sequentially via a doubly-linked list, enabling O(log N) random search and extremely fast range queries without tree traversals.',
            hi: 'B+ Tree ek self-balancing m-way search tree hai. B-Tree aur B+ Tree me sabse bada farq ye hai ki B-Tree me internal nodes par bhi data pointers hote hain, jabki B+ Tree me saara data sirf aur sirf LEAF nodes par hota hai. Saari leaf nodes aapas me linked list ke through judi hoti hain jisse range queries (jaise BETWEEN 10 AND 50) bohot fast hoti hain!'
          },
          analogy: {
            title: 'Encyclopaedia Index & Book Chapters',
            en: 'Internal nodes are like the Table of Contents at the front of a book listing page ranges. The leaf nodes are the actual content pages at the back. You can flip directly from Page 120 to 121 without checking the Table of Contents again!',
            hi: 'Internal nodes book ke index page jaise hain jo sirf rasta dikhaate hain. Leaf nodes actual pages hain. Leaf nodes ke beech me linked list hone ki wajah se ek page padhne ke baad agla page turant padha ja sakta hai bina index wapas khole!'
          },
          workedExample: {
            problemStatement: 'Construct a B+ Tree of order p=4 (max 3 keys, max 4 pointers per node) inserting keys 10, 20, 30, 40.',
            stepByStepSolution: [
              {
                step: 1,
                title: 'Insert 10, 20, 30',
                content: 'All fit into a single leaf root node: [10 | 20 | 30].'
              },
              {
                step: 2,
                title: 'Insert 40 and Split',
                content: 'Node overflows with 4 keys. Split at median key 30. Left leaf: [10 | 20], Right leaf: [30 | 40]. A copy of 30 is pushed to new root internal node [30]. Leaf [10 | 20] links to [30 | 40].'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Putting record data pointers in internal nodes of a B+ Tree',
              penalty: 'Deduction of 3 marks out of 10 in RGPV structural diagrams',
              remedy: 'In a B+ Tree, internal nodes ONLY contain search keys and child node pointers. Data pointers are STRICTLY in leaf nodes.'
            },
            {
              mistake: 'Forgetting the horizontal linked-list pointer between leaf nodes',
              penalty: 'Deduction of 2 marks',
              remedy: 'Always draw horizontal directional arrows connecting sibling leaf nodes from left to right.'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.6(a) Compare B-Tree and B+ Tree with structural diagrams. Why are B+ Trees predominantly preferred over B-Trees for database indexes on secondary storage? [10 Marks]',
            standardMarks: 10,
            gradingRubricHighlight: 'Comparative table with 6 parameters (4M) + Structural block diagrams (3M) + Justification for disk page utilization and range queries (3M).'
          },
          diagnosticCheck: {
            question: 'Why does a B+ Tree support range queries much faster than a standard B-Tree?',
            options: [
              'Because B+ Tree has smaller depth than B-Tree',
              'Because all leaf nodes are connected via a linked list, eliminating the need to traverse up and down internal nodes',
              'Because internal nodes store duplicate keys',
              'Because B+ Trees don\'t use secondary storage'
            ],
            correctAnswerIndex: 1,
            explanation: 'The linked list chaining all leaf nodes enables linear sequential scans for range queries without repeated vertical tree traversals.'
          },
          citations: [
            {
              id: 'cite-5-1',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 3,
              excerpt: 'Unit V: Indexing and Hashing: Basic concepts, ordered indices, B+ tree index files, B-tree index files, static hashing, dynamic hashing.',
              context: 'Section 5.1: Indexing File Structures'
            },
            {
              id: 'cite-5-2',
              docName: 'RGPV Exam Paper Dec 2021',
              page: 3,
              excerpt: 'Question 6(a): Explain B-Tree and B+ Tree indexing structures. Why are B+ Trees preferred over B-Trees for database file organization? [10 Marks]',
              context: 'University Core Indexing Exam Problem'
            }
          ]
        }
      },
      {
        id: 'topic-5-2',
        unitId: 'unit-5',
        title: 'RAID Architectures & Storage Organization',
        syllabusWeight: 45,
        frequencyScore: 76,
        appearancesCount: 3,
        totalMarksInPast5Years: 21,
        difficultyScore: 50,
        difficultyLabel: 'Moderate',
        masteryPercentage: 64,
        mappedPYQIds: ['pyq-10', 'pyq-18'],
        pedagogicalContent: {
          coreDefinition: {
            en: 'Redundant Array of Independent Disks (RAID) organizes multiple physical hard drives into a single logical storage unit to achieve performance enhancement (striping) and fault tolerance (mirroring/parity). RAID 0 strips data for speed (no redundancy); RAID 1 mirrors data; RAID 5 distributes block-level data and parity across disks; RAID 10 stripes across mirrored sets.',
            hi: 'RAID multiple hard disks ko combine karke ek single storage banata hai taaki speed (data striping) aur reliability (mirroring aur parity) dono mil sakein. RAID 0 me zero fault tolerance hai; RAID 1 me disk duplicate hoti hai; RAID 5 me parity calculate hoti hai jisse agar 1 disk crash ho tab bhi data recover ho jata hai.'
          },
          analogy: {
            title: 'Multiple Notebooks with Backup Carbon Copies',
            en: 'RAID 0 is writing odd chapters in Notebook A and even chapters in Notebook B—writing is twice as fast, but losing one notebook ruins the book. RAID 1 is writing every page twice with carbon copy paper. RAID 5 is writing summary checksums so you can re-calculate any missing page!',
            hi: 'RAID 0 me aap aadha kaam dost ko aur aadha khud karte hain taaki jaldi ho, par agar dost notebook kho de toh poora kaam gaya. RAID 1 me aap hamesha photostat copy rakhte hain.'
          },
          workedExample: {
            problemStatement: 'Calculate effective storage capacity of an array of 5 disks of 2TB each under RAID 0, RAID 1, and RAID 5.',
            stepByStepSolution: [
              {
                step: 1,
                title: 'RAID 0 (Striping Only)',
                content: 'Capacity = N * C = 5 * 2TB = 10TB usable space. No fault tolerance.'
              },
              {
                step: 2,
                title: 'RAID 1 (Mirroring with 5 disks, e.g. 1 primary + 4 mirrors or pair setup)',
                content: 'True mirroring of all disks yields 2TB usable (or 4TB in paired mirrored setup).'
              },
              {
                step: 3,
                title: 'RAID 5 (Distributed Parity)',
                content: 'Capacity = (N - 1) * C = (5 - 1) * 2TB = 8TB usable space. Can withstand 1 single disk failure.'
              }
            ]
          },
          commonMistakes: [
            {
              mistake: 'Stating RAID 0 provides fault tolerance or backup',
              penalty: 'Immediate deduction of 3 marks',
              remedy: 'RAID 0 has ZERO redundancy! If any disk fails, all data across the array is permanently destroyed.'
            }
          ],
          examPattern: {
            typicalQuestion: 'Q.7(a) Explain RAID levels 0, 1, 5 and 10 with diagrams. Compare them in terms of space overhead, read/write performance, and fault tolerance. [7 Marks]',
            standardMarks: 7,
            gradingRubricHighlight: 'Diagrams for 4 RAID levels (4M) + Comparison metrics table (3M).'
          },
          diagnosticCheck: {
            question: 'How many disk failures can a RAID 5 array withstand without losing data?',
            options: [
              'Zero (no fault tolerance)',
              'Exactly 1 disk failure',
              'Up to 2 concurrent disk failures',
              'Any number of failures'
            ],
            correctAnswerIndex: 1,
            explanation: 'RAID 5 uses distributed single parity, enabling exact mathematical reconstruction of any 1 failed disk.'
          },
          citations: [
            {
              id: 'cite-5-3',
              docName: 'Official RGPV CS-403 Syllabus',
              page: 4,
              excerpt: 'Unit V: Physical storage media: RAID levels 0 through 10, performance and reliability trade-offs.',
              context: 'Section 5.3: Secondary Storage Subsystems'
            }
          ]
        }
      }
    ]
  }
];

export const initialScheduleDays: DaySchedule[] = [
  {
    dayNumber: 1,
    date: 'Day 1 • Oct 01',
    totalMinutes: 145, // 2.4 hrs (strictly <= 2.5 hrs cap)
    isBufferDay: false,
    priorityMetrics: {
      frequency: 98,
      difficulty: 78,
      syllabusWeight: 60,
      masteryDeficit: 58, // 100 - 42
      calculatedPriority: 81.3,
      justification: [
        'Highest frequency topic across 2020-2024 papers (42 marks total)',
        'High cognitive load (Difficulty 78%) with current mastery deficit of 58%',
        'Critical exam pillar: 10-mark compulsory question in 4 out of 5 exams'
      ]
    },
    sessions: [
      {
        id: 's-1-1',
        type: 'concept_learning',
        title: '3NF vs BCNF Mathematical Proofs & Superkey Rules',
        topicId: 'topic-3-1',
        durationMinutes: 45,
        completed: true,
        notes: 'Cover prime attribute exemption in 3NF and dependency preservation tradeoffs.'
      },
      {
        id: 's-1-2',
        type: 'pyq_practice',
        title: 'Solve RGPV 2024 & 2020 10-Mark Normalization Problems',
        topicId: 'topic-3-1',
        durationMinutes: 35,
        completed: true,
        notes: 'Hand-derive candidate keys for R(A,B,C,D,E).'
      },
      {
        id: 's-1-3',
        type: 'active_recall',
        title: 'Diagnostic Rubric Quiz on Transitive Dependencies',
        topicId: 'topic-3-1',
        durationMinutes: 25,
        completed: true,
        notes: 'Scored 4.5/5.0 with verifier agent approval.'
      },
      {
        id: 's-1-4',
        type: 'spaced_revision',
        title: 'Armstrong Axioms & Attribute Closure Quick Drill',
        topicId: 'topic-3-1',
        durationMinutes: 40,
        completed: false,
        notes: 'Review reflexivity, augmentation, and transitivity rules.'
      }
    ]
  },
  {
    dayNumber: 2,
    date: 'Day 2 • Oct 02',
    totalMinutes: 140, // 2.33 hrs
    isBufferDay: false,
    priorityMetrics: {
      frequency: 84,
      difficulty: 72,
      syllabusWeight: 40,
      masteryDeficit: 62, // 100 - 38
      calculatedPriority: 76.2,
      justification: [
        'High mastery deficit (62% gap) on Lossless Decomposition',
        'Direct 7-mark question in 2023 Dec & 2024 May papers',
        'Prerequisite for relational normalization mastery'
      ]
    },
    sessions: [
      {
        id: 's-2-1',
        type: 'concept_learning',
        title: 'Lossless Join and Dependency Preserving Decomposition',
        topicId: 'topic-3-2',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-2-2',
        type: 'pyq_practice',
        title: 'RGPV 2023 Dec Q.3(b) Lossless Testing Algorithms',
        topicId: 'topic-3-2',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-2-3',
        type: 'active_recall',
        title: 'Table-Chase Method for Lossless Decomposition',
        topicId: 'topic-3-2',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-2-4',
        type: 'spaced_revision',
        title: 'Spaced Flashcard Review: 1NF through BCNF',
        topicId: 'topic-3-1',
        durationMinutes: 35,
        completed: false
      }
    ]
  },
  {
    dayNumber: 3,
    date: 'Day 3 • Oct 03',
    totalMinutes: 145,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 94,
      difficulty: 70,
      syllabusWeight: 50,
      masteryDeficit: 30,
      calculatedPriority: 75.4,
      justification: [
        'Appeared in all 5 recent exam papers (37 marks total)',
        'Precedence graphs and conflict equivalence are guaranteed marks',
        'Moderate deficit requires targeted practice on view serializability'
      ]
    },
    sessions: [
      {
        id: 's-3-1',
        type: 'concept_learning',
        title: 'Conflict vs View Serializability & Precedence Graphs',
        topicId: 'topic-4-1',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-3-2',
        type: 'pyq_practice',
        title: 'RGPV 2023 Dec Q.5(a) 10-Mark Schedule Verification',
        topicId: 'topic-4-1',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-3-3',
        type: 'active_recall',
        title: 'Blind Precedence Graph Construction Quiz',
        topicId: 'topic-4-1',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-3-4',
        type: 'spaced_revision',
        title: 'ACID Properties in Banking Transaction Examples',
        topicId: 'topic-4-1',
        durationMinutes: 40,
        completed: false
      }
    ]
  },
  {
    dayNumber: 4,
    date: 'Day 4 • Oct 04',
    totalMinutes: 140,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 88,
      difficulty: 65,
      syllabusWeight: 50,
      masteryDeficit: 45,
      calculatedPriority: 73.1,
      justification: [
        'Frequent RGPV 7-mark question on 2PL and Deadlocks',
        'Strict 2PL cascading abort prevention frequently tested',
        'Wait-Die vs Wound-Wait matrix requires quick recall'
      ]
    },
    sessions: [
      {
        id: 's-4-1',
        type: 'concept_learning',
        title: '2PL Protocol: Strict vs Rigorous & Cascading Aborts',
        topicId: 'topic-4-2',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-4-2',
        type: 'pyq_practice',
        title: 'Deadlock Detection: Wait-For Graphs & Wait-Die Schemes',
        topicId: 'topic-4-2',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-4-3',
        type: 'active_recall',
        title: 'Timed Diagnostic: Concurrency Anomalies',
        topicId: 'topic-4-2',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-4-4',
        type: 'spaced_revision',
        title: 'Cumulative Review: Unit 3 & Unit 4 Core Formulas',
        topicId: 'topic-3-1',
        durationMinutes: 35,
        completed: false
      }
    ]
  },
  {
    dayNumber: 5,
    date: 'Day 5 • Oct 05',
    totalMinutes: 140,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 92,
      difficulty: 74,
      syllabusWeight: 55,
      masteryDeficit: 52, // 100 - 48
      calculatedPriority: 77.8,
      justification: [
        'High deficit (52%) on B+ Tree node split and range queries',
        'Appeared 5 times in past 5 years (34 marks total)',
        'Crucial for scoring full marks in Unit 5'
      ]
    },
    sessions: [
      {
        id: 's-5-1',
        type: 'concept_learning',
        title: 'B+ Tree Indexing vs B-Tree Node Pointer Structures',
        topicId: 'topic-5-1',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-5-2',
        type: 'pyq_practice',
        title: 'RGPV 2021 Dec Q.6(a) 10-Mark B+ Tree Insertion',
        topicId: 'topic-5-1',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-5-3',
        type: 'active_recall',
        title: 'B+ Tree Leaf Node Chaining & Search Time Complexity',
        topicId: 'topic-5-1',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-5-4',
        type: 'spaced_revision',
        title: 'Primary vs Secondary & Dense vs Sparse Indexes',
        topicId: 'topic-5-1',
        durationMinutes: 35,
        completed: false
      }
    ]
  },
  {
    dayNumber: 6,
    date: 'Day 6 • Oct 06',
    totalMinutes: 135,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 76,
      difficulty: 50,
      syllabusWeight: 45,
      masteryDeficit: 36,
      calculatedPriority: 65.1,
      justification: [
        'Straightforward theoretical topic with high scoring probability',
        'RAID levels 0, 1, 5 diagrams and formula memorization',
        'Low cognitive load allows catch-up'
      ]
    },
    sessions: [
      {
        id: 's-6-1',
        type: 'concept_learning',
        title: 'RAID 0, 1, 5, 10 Architectural Diagrams & Parity',
        topicId: 'topic-5-2',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-6-2',
        type: 'pyq_practice',
        title: 'RGPV 2021 May Q.7(a) RAID Trade-Off Matrix',
        topicId: 'topic-5-2',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-6-3',
        type: 'active_recall',
        title: 'Dynamic Hashing vs Static Hashing Overflow Solutions',
        topicId: 'topic-5-2',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-6-4',
        type: 'spaced_revision',
        title: 'Unit 5 Storage & Indexing Fast Summary Drill',
        topicId: 'topic-5-1',
        durationMinutes: 30,
        completed: false
      }
    ]
  },
  {
    dayNumber: 7,
    date: 'Day 7 • Oct 07',
    totalMinutes: 120,
    isBufferDay: true,
    priorityMetrics: {
      frequency: 0,
      difficulty: 0,
      syllabusWeight: 0,
      masteryDeficit: 0,
      calculatedPriority: 0,
      justification: [
        'Scheduled mid-plan buffer day strictly enforced by constraint engine',
        'Accommodates unexpected college lab submissions or revision backlogs',
        'No new topics scheduled; focus on high-yield self-testing'
      ]
    },
    sessions: [
      {
        id: 's-7-1',
        type: 'buffer_rest',
        title: 'Mid-Plan Buffer & Weak-Topic Remediation Window',
        topicId: 'topic-3-1',
        durationMinutes: 60,
        completed: false,
        notes: 'Catch-up block for any incomplete sessions from Days 1-6.'
      },
      {
        id: 's-7-2',
        type: 'spaced_revision',
        title: 'Comprehensive Unit 3 & 4 Diagnostic Self-Test',
        topicId: 'topic-3-2',
        durationMinutes: 60,
        completed: false,
        notes: 'Simulate 1-hour university paper segment under exam conditions.'
      }
    ]
  },
  {
    dayNumber: 8,
    date: 'Day 8 • Oct 08',
    totalMinutes: 145,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 92,
      difficulty: 68,
      syllabusWeight: 50,
      masteryDeficit: 42,
      calculatedPriority: 74.3,
      justification: [
        'SQL queries appear every year (35 marks across 5 years)',
        'WHERE vs HAVING clause distinction is an examiner favorite',
        'Correlated subqueries demand precise syntax execution'
      ]
    },
    sessions: [
      {
        id: 's-8-1',
        type: 'concept_learning',
        title: 'SQL GROUP BY, HAVING, and Correlated Subqueries',
        topicId: 'topic-2-1',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-8-2',
        type: 'pyq_practice',
        title: 'RGPV 2022 May Q.3(b) Complex Employee SQL Queries',
        topicId: 'topic-2-1',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-8-3',
        type: 'active_recall',
        title: 'Live SQL Query Editor Code Runner Drills',
        topicId: 'topic-2-1',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-8-4',
        type: 'spaced_revision',
        title: 'Integrity Constraints (ON DELETE CASCADE, Foreign Keys)',
        topicId: 'topic-2-1',
        durationMinutes: 40,
        completed: false
      }
    ]
  },
  {
    dayNumber: 9,
    date: 'Day 9 • Oct 09',
    totalMinutes: 140,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 80,
      difficulty: 55,
      syllabusWeight: 50,
      masteryDeficit: 38,
      calculatedPriority: 67.9,
      justification: [
        'Relational Algebra formal notation tested frequently in 10-mark sets',
        'High transferability between SQL and relational algebra expressions',
        'Natural join vs theta join mathematical formulation review'
      ]
    },
    sessions: [
      {
        id: 's-9-1',
        type: 'concept_learning',
        title: 'Relational Algebra Operators: Selection, Projection, Joins',
        topicId: 'topic-2-2',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-9-2',
        type: 'pyq_practice',
        title: 'RGPV 2022 May Q.4(a) Formal Algebraic Expressions',
        topicId: 'topic-2-2',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-9-3',
        type: 'active_recall',
        title: 'Relational Algebra to SQL Direct Translation Quiz',
        topicId: 'topic-2-2',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-9-4',
        type: 'spaced_revision',
        title: 'Division Operator (÷) in Relational Algebra Practice',
        topicId: 'topic-2-2',
        durationMinutes: 35,
        completed: false
      }
    ]
  },
  {
    dayNumber: 10,
    date: 'Day 10 • Oct 10',
    totalMinutes: 140,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 88,
      difficulty: 60,
      syllabusWeight: 55,
      masteryDeficit: 35,
      calculatedPriority: 70.8,
      justification: [
        'ER modeling is the guaranteed Question 2 in RGPV exam papers',
        'Schema mapping rules (1:1, 1:N, M:N) provide clean, fast marks',
        'Weak entity representation notation review'
      ]
    },
    sessions: [
      {
        id: 's-10-1',
        type: 'concept_learning',
        title: 'ER Modeling: Cardinality, Weak Entities, and Extended ER',
        topicId: 'topic-1-1',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-10-2',
        type: 'pyq_practice',
        title: 'RGPV 2023 May Q.2(a) University Course Registration ER',
        topicId: 'topic-1-1',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-10-3',
        type: 'active_recall',
        title: 'ER-to-Relational Table Conversion Rules Quiz',
        topicId: 'topic-1-1',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-10-4',
        type: 'spaced_revision',
        title: 'Three-Schema Architecture & Data Independence Drill',
        topicId: 'topic-1-2',
        durationMinutes: 35,
        completed: false
      }
    ]
  },
  {
    dayNumber: 11,
    date: 'Day 11 • Oct 11',
    totalMinutes: 135,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 72,
      difficulty: 40,
      syllabusWeight: 45,
      masteryDeficit: 22,
      calculatedPriority: 59.7,
      justification: [
        'Foundational theoretical question appearing in Part (a) of Question 1',
        'High student mastery (78%); quick targeted refresher required'
      ]
    },
    sessions: [
      {
        id: 's-11-1',
        type: 'concept_learning',
        title: 'Three-Tier Architecture Diagram & Storage Managers',
        topicId: 'topic-1-2',
        durationMinutes: 40,
        completed: false
      },
      {
        id: 's-11-2',
        type: 'pyq_practice',
        title: 'RGPV 2024 May Q.1(a) File Processing vs DBMS Comparison',
        topicId: 'topic-1-2',
        durationMinutes: 35,
        completed: false
      },
      {
        id: 's-11-3',
        type: 'active_recall',
        title: 'Physical vs Logical Independence Boundary Testing',
        topicId: 'topic-1-2',
        durationMinutes: 25,
        completed: false
      },
      {
        id: 's-11-4',
        type: 'spaced_revision',
        title: 'Flashcard Drill: Unit 1 Definitions and Diagrams',
        topicId: 'topic-1-1',
        durationMinutes: 35,
        completed: false
      }
    ]
  },
  {
    dayNumber: 12,
    date: 'Day 12 • Oct 12',
    totalMinutes: 145,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 95,
      difficulty: 75,
      syllabusWeight: 58,
      masteryDeficit: 45,
      calculatedPriority: 77.2,
      justification: [
        'High-stakes synthesis day targeting student weak spots across units',
        'Focused on Normalization + Serializability + B+ Trees'
      ]
    },
    sessions: [
      {
        id: 's-12-1',
        type: 'spaced_revision',
        title: 'Speed Drill: 3NF vs BCNF Decomposition Problems',
        topicId: 'topic-3-1',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-12-2',
        type: 'pyq_practice',
        title: 'Full 14-Mark Question Solving: Transactions & Locks',
        topicId: 'topic-4-1',
        durationMinutes: 45,
        completed: false
      },
      {
        id: 's-12-3',
        type: 'active_recall',
        title: 'B+ Tree Node Split & Merge Rapid Fire Rubric',
        topicId: 'topic-5-1',
        durationMinutes: 30,
        completed: false
      },
      {
        id: 's-12-4',
        type: 'concept_learning',
        title: 'High-Yield Formula Sheet Revision (Armstrong, RAID, FDs)',
        topicId: 'topic-3-2',
        durationMinutes: 25,
        completed: false
      }
    ]
  },
  {
    dayNumber: 13,
    date: 'Day 13 • Oct 13',
    totalMinutes: 140,
    isBufferDay: false,
    priorityMetrics: {
      frequency: 90,
      difficulty: 65,
      syllabusWeight: 55,
      masteryDeficit: 35,
      calculatedPriority: 72.3,
      justification: [
        'Full Mock University Exam Paper Simulation (CS-403 DBMS)',
        'Strictly timed conditions to evaluate speed and rubric adherence'
      ]
    },
    sessions: [
      {
        id: 's-13-1',
        type: 'pyq_practice',
        title: 'Full Length RGPV Mock Exam Section A (Units 1-3)',
        topicId: 'topic-3-1',
        durationMinutes: 70,
        completed: false
      },
      {
        id: 's-13-2',
        type: 'pyq_practice',
        title: 'Full Length RGPV Mock Exam Section B (Units 4-5)',
        topicId: 'topic-4-1',
        durationMinutes: 70,
        completed: false
      }
    ]
  },
  {
    dayNumber: 14,
    date: 'Day 14 • Oct 14',
    totalMinutes: 90,
    isBufferDay: true,
    priorityMetrics: {
      frequency: 0,
      difficulty: 0,
      syllabusWeight: 0,
      masteryDeficit: 0,
      calculatedPriority: 0,
      justification: [
        'Final Pre-Exam Buffer & Rest Day',
        'Mental decompression and quick formula sheet scanning only'
      ]
    },
    sessions: [
      {
        id: 's-14-1',
        type: 'buffer_rest',
        title: 'Final Pre-Exam Rest & High-Yield Summary Review',
        topicId: 'topic-1-1',
        durationMinutes: 50,
        completed: false
      },
      {
        id: 's-14-2',
        type: 'spaced_revision',
        title: 'Examiner Common Mistake Checklist Review',
        topicId: 'topic-3-1',
        durationMinutes: 40,
        completed: false
      }
    ]
  }
];

export const traceNodes: LangGraphTraceNode[] = [
  {
    id: 'node-1',
    nodeName: 'PyMuPDF Parser & Text Extractor',
    status: 'completed',
    latencyMs: 45,
    inputTokens: 0,
    outputTokens: 14200,
    confidenceScore: 99.4,
    description: 'Extracted 32 pages from RGPV CS-403 Syllabus & 5 Past Year Question Papers (2020-2024) preserving bounding box coordinates and question boundaries.',
    details: {
      pagesProcessed: 32,
      tablesPreserved: 18,
      parserEngine: 'PyMuPDF (fitz) v1.23',
      fileChecksum: 'sha256:7f9b8c2e1d0a...'
    }
  },
  {
    id: 'node-2',
    nodeName: 'Curriculum Classifier & Unit Mapper',
    status: 'completed',
    latencyMs: 182,
    inputTokens: 4850,
    outputTokens: 890,
    confidenceScore: 94.2,
    description: 'Mapped 24 past exam questions against 5 core RGPV syllabus units with semantic similarity scoring and question mark weight identification.',
    details: {
      unitsIdentified: 5,
      topicsSegmented: 10,
      pyqsMapped: 24,
      avgConfidence: '92.4%',
      reassignmentTriggers: 0
    }
  },
  {
    id: 'node-3',
    nodeName: 'Deterministic Priority Scheduler',
    status: 'completed',
    latencyMs: 38,
    inputTokens: 1200,
    outputTokens: 640,
    confidenceScore: 100.0,
    description: 'Executed linear priority equation: P_i = 0.35(Freq) + 0.20(Diff) + 0.25(Syllabus) + 0.20(1 - Mastery) enforcing daily 2.5 hrs cap and 2 buffer days.',
    details: {
      dailyCapConstraint: '2.5 hrs/day max strictly enforced',
      bufferDaysAllocated: 2,
      totalPlanDays: 14,
      highestPriorityTopic: 'topic-3-1 (Normalization: 81.3 P_i)'
    }
  },
  {
    id: 'node-4',
    nodeName: 'Pedagogical Content Grounder',
    status: 'completed',
    latencyMs: 215,
    inputTokens: 3400,
    outputTokens: 1850,
    confidenceScore: 96.8,
    description: 'Synthesized 7-section grounded reading materials with bilingual English/Hinglish analogies, worked step-by-step examples, and exact PDF citations.',
    details: {
      sectionsGenerated: 7,
      languagesSupported: ['en', 'hi'],
      citationsVerified: 12,
      hallucinationRate: '0.00% (Strict Source Grounding)'
    }
  },
  {
    id: 'node-5',
    nodeName: 'Rubric Evaluator & Verifier Agent',
    status: 'completed',
    latencyMs: 228,
    inputTokens: 2100,
    outputTokens: 540,
    confidenceScore: 97.1,
    description: 'Evaluated student quiz responses against RGPV marking schemes, awarded criterion-level marks, flagged misconceptions, and computed mastery delta.',
    details: {
      verifierMode: 'Dual-Pass Guardrail',
      rubricsEvaluated: 4,
      misconceptionDetection: 'Active',
      invariantCheck: 'PASSED'
    }
  }
];
