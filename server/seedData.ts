import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  MentorProfile,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  LessonProgress,
  Internship,
  InternshipApplication,
  Project,
  ProjectSubmission,
  Certificate,
  Announcement,
  Notification,
  AuditLog,
} from './types.js';

// Pre-hash password 'Password123!'
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

export const initialUsers: User[] = [
  {
    id: 'user-student-1',
    name: 'Alex Rivera',
    email: 'student@skillbridge.edu',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Aspiring Full-Stack Software Engineer with a passion for high-performance React architectures and cloud backends.',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-03-01T14:30:00Z',
  },
  {
    id: 'user-mentor-1',
    name: 'Sarah Chen',
    email: 'mentor@skillbridge.edu',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Platform Architect at Nordic Cloud Systems. Over 10 years experience scaling Node.js, distributed databases, and guiding career transitions.',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'user-admin-1',
    name: 'Dr. Marcus Vance',
    email: 'admin@skillbridge.edu',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Dean of Technology and Industrial Partnerships at SkillBridge Academy.',
    createdAt: '2025-08-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
];

export const initialStudentProfiles: StudentProfile[] = [
  {
    userId: 'user-student-1',
    university: 'University of Oslo / Technology Institute',
    major: 'Computer Science & Software Systems',
    graduationYear: 2026,
    phone: '+47 480 12 345',
    githubUrl: 'https://github.com/alexrivera-dev',
    linkedinUrl: 'https://linkedin.com/in/alex-rivera-bridge',
    portfolioUrl: 'https://alexrivera.dev',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'REST APIs'],
    resumeFileName: 'Alex_Rivera_Software_Engineer_CV.pdf',
    resumeDataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp...',
    assignedMentorId: 'user-mentor-1',
  },
];

export const initialMentorProfiles: MentorProfile[] = [
  {
    userId: 'user-mentor-1',
    company: 'Nordic Cloud Solutions',
    jobTitle: 'Principal Systems Architect',
    expertise: ['TypeScript', 'Express', 'Distributed Architecture', 'Prisma / SQL', 'Cloud DevOps'],
    yearsExperience: 11,
    assignedStudentIds: ['user-student-1'],
    bio: 'Guiding next-generation engineers through realistic engineering practices and code reviews.',
  },
];

export const initialCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Full-Stack Web Engineering: Production Architecture',
    slug: 'full-stack-web-engineering',
    shortDescription: 'Master modern full-stack development with React, TypeScript, Express, Prisma ORM, and enterprise testing patterns.',
    description: `SkillBridge Academy's flagship engineering program designed to transform ambitious learners into industry-ready software engineers. You will learn how modern engineering teams architect, test, deploy, and monitor robust web applications. From reactive UI composition and state management in React 19 to database normalization, indexing, JWT sessions, and Docker containerization, every module mirrors actual enterprise workflows.`,
    category: 'Software Engineering',
    difficulty: 'Intermediate',
    instructor: 'Sarah Chen (Nordic Cloud Solutions)',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    instructorBio: 'Principal Architect with 11+ years leading high-throughput distributed systems in Scandinavia.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    durationHours: 48,
    learningOutcomes: [
      'Architect robust React TypeScript single page and fullstack applications',
      'Design normalized PostgreSQL database schemas with Prisma and migrations',
      'Implement secure role-based access control (RBAC), bcrypt hashing, and JWT tokens',
      'Build end-to-end RESTful APIs with structured validation and error handling',
      'Deploy containerized applications with automated CI/CD pipelines',
    ],
    prerequisites: ['Foundational JavaScript (ES6+)', 'Basic understanding of HTML & CSS', 'Git fundamentals'],
    published: true,
    featured: true,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-02-10T12:00:00Z',
  },
  {
    id: 'course-2',
    title: 'Applied Cloud Systems & Enterprise DevOps',
    slug: 'cloud-systems-devops',
    shortDescription: 'Learn Docker, Kubernetes, Terraform, CI/CD automated deployment, and scalable cloud infrastructure.',
    description: `Modern companies require engineers who understand the entire delivery lifecycle. This comprehensive program covers infrastructure-as-code, multi-stage Docker builds, Kubernetes cluster management, automated GitHub Actions pipelines, and zero-downtime blue/green deployments. Gain practical hands-on experience by creating production environments.`,
    category: 'Cloud & DevOps',
    difficulty: 'Advanced',
    instructor: 'Henrik Lindqvist (Viken Scalable Systems)',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    instructorBio: 'Senior DevOps Director and CNCF contributor with extensive enterprise infrastructure experience.',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
    durationHours: 40,
    learningOutcomes: [
      'Containerize multi-tier applications using hardened multi-stage Dockerfiles',
      'Manage container workloads and orchestrate services using Kubernetes manifests',
      'Configure automated CI/CD testing and deployment pipelines with GitHub Actions',
      'Implement Prometheus and Grafana telemetry monitoring and alerting',
    ],
    prerequisites: ['Linux command line comfort', 'Basic backend scripting', 'Networking fundamentals'],
    published: true,
    featured: true,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'course-3',
    title: 'Modern UI/UX Design Systems & High-Fidelity Prototyping',
    slug: 'design-systems-prototyping',
    shortDescription: 'From user research and accessibility (WCAG AAA) to scalable Figma design tokens and component architecture.',
    description: `Elevate your product design capabilities with rigorous systems thinking. Build design tokens, reusable atomic component libraries, interactive user flows, and responsive layouts that bridge the gap between Figma designs and frontend code.`,
    category: 'Product Design',
    difficulty: 'Beginner',
    instructor: 'Astrid Møller (Nordic Design Works)',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    instructorBio: 'Head of Product Design with 9+ years creating award-winning design systems across Europe.',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    durationHours: 32,
    learningOutcomes: [
      'Structure accessible design systems with standardized color palettes and typography scales',
      'Conduct user interviews, journey mapping, and wireframe iterations',
      'Deliver developer-ready Figma specifications, variables, and interaction guidelines',
      'Test for WCAG accessibility compliance across touch, keyboard, and screen-readers',
    ],
    prerequisites: ['Basic familiarity with digital product concepts'],
    published: true,
    featured: false,
    createdAt: '2026-01-18T14:00:00Z',
    updatedAt: '2026-02-15T16:00:00Z',
  },
  {
    id: 'course-4',
    title: 'Practical AI Engineering & LLM Application Development',
    slug: 'practical-ai-engineering',
    shortDescription: 'Integrate generative AI, embeddings, vector databases, and agentic workflows into production web applications.',
    description: `A hands-on engineering guide to building real AI-augmented software. Learn how to construct context-aware retrieval pipelines (RAG), orchestrate multi-step agents, evaluate model outputs, and safely integrate frontier language models into web stacks.`,
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    instructor: 'Dr. Johan Berg (Fjord Intelligence)',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    instructorBio: 'Lead AI Researcher and consultant specializing in applied language models and search grounding.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    durationHours: 36,
    learningOutcomes: [
      'Integrate LLM SDKs with structured JSON schemas and function calling',
      'Build semantic vector search with embeddings and similarity scoring',
      'Implement guardrails, rate limiting, and cost-efficient streaming responses',
      'Deploy autonomous tools and conversational memory systems',
    ],
    prerequisites: ['Python or TypeScript proficiency', 'REST API basics'],
    published: true,
    featured: false,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
];

export const initialModules: CourseModule[] = [
  // Course 1 Modules
  {
    id: 'mod-1-1',
    courseId: 'course-1',
    title: 'Module 1: Foundations of Full-Stack Architecture',
    description: 'Deconstruct modern client-server communication, TypeScript typing discipline, and project scaffolding.',
    orderIndex: 1,
  },
  {
    id: 'mod-1-2',
    courseId: 'course-1',
    title: 'Module 2: Advanced React & State Synchronization',
    description: 'Component architecture, custom hooks, performant data fetching, and accessible UI primitives.',
    orderIndex: 2,
  },
  {
    id: 'mod-1-3',
    courseId: 'course-1',
    title: 'Module 3: Relational Databases, Express & Security',
    description: 'Database design, schema migrations, password hashing with bcrypt, JWT authorization, and input validation.',
    orderIndex: 3,
  },
  // Course 2 Modules
  {
    id: 'mod-2-1',
    courseId: 'course-2',
    title: 'Module 1: Containerization & Docker Hardening',
    description: 'Writing minimal multi-stage Dockerfiles and container networking.',
    orderIndex: 1,
  },
  {
    id: 'mod-2-2',
    courseId: 'course-2',
    title: 'Module 2: CI/CD Pipeline Automation',
    description: 'Automated test suites, security scanning, and deployment workflows with GitHub Actions.',
    orderIndex: 2,
  },
];

export const initialLessons: Lesson[] = [
  // Course 1 - Module 1
  {
    id: 'lesson-1-1-1',
    moduleId: 'mod-1-1',
    courseId: 'course-1',
    title: '1.1 Principles of Modern Web Application Architecture',
    type: 'text',
    durationMinutes: 25,
    orderIndex: 1,
    content: `## Principles of Modern Web Application Architecture

In this lesson, we explore how contemporary high-growth engineering teams design software that is maintainable, scalable, and resilient.

### 1. Separation of Concerns & Client-Server Contract
Modern web architectures clearly demarcate client rendering from backend authority:
- **Client Responsibilities:** Presenting reactive user interfaces, managing ephemeral form states, handling client-side routing, and rendering accessible views.
- **Server Responsibilities:** Authoritative authentication, transactional database operations, rate limiting, data integrity enforcement, and business logic execution.

### 2. Type-Driven Development with TypeScript
By sharing interfaces across the stack or rigorously validating boundaries with libraries like Zod, we eliminate runtime bugs at compile time:
\`\`\`typescript
interface UserProfile {
  id: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
}
\`\`\`

### 3. Key Architectural Patterns
1. **Repository Pattern:** Isolating database queries from HTTP controller logic.
2. **Stateless Authentication:** Employing signed JWT tokens or cryptographically secure session IDs stored in HTTP-only cookies.
3. **Optimistic Updates:** Improving perceived user performance while guaranteeing server rollback on network failure.

Take a few moments to review the architectural diagram in your supplementary resources before continuing to the hands-on video demonstration.`,
    resources: [
      {
        id: 'res-1',
        title: 'Fullstack-Architecture-CheatSheet.pdf',
        type: 'pdf',
        url: '#',
        size: '1.4 MB',
      },
    ],
  },
  {
    id: 'lesson-1-1-2',
    moduleId: 'mod-1-1',
    courseId: 'course-1',
    title: '1.2 Video Walkthrough: Structuring Monorepos & TypeScript Tooling',
    type: 'video',
    durationMinutes: 35,
    orderIndex: 2,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder embed
    content: `### Video Walkthrough: Structuring Monorepos & TypeScript Tooling

Join Lead Architect Sarah Chen as she demonstrates the setup of a professional workspace with Vite, Express, and shared type definitions.

**Key Topics Covered in Video:**
- Scaffolding a clean separation between client and server code
- Configuring \`tsconfig.json\` path aliases for rapid importing
- Setting up ESLint and formatting standards
- Structuring environment variable injection with fallback safety`,
  },
  {
    id: 'lesson-1-1-3',
    moduleId: 'mod-1-1',
    courseId: 'course-1',
    title: '1.3 Knowledge Assessment: Core Architecture Quiz',
    type: 'quiz',
    durationMinutes: 15,
    orderIndex: 3,
    content: 'Test your understanding of full-stack architectural principles, data flow, and separation of concerns.',
    quiz: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'q1',
          question: 'Where should authoritative role authorization checks always take place?',
          options: [
            'Solely in the frontend router by hiding UI buttons',
            'On the backend server API middleware or controller',
            'In the client local storage token payload',
            'In the CSS display rules',
          ],
          correctAnswerIndex: 1,
          explanation: 'Client-side UI changes are purely cosmetic for user experience. True security must be enforced by backend middleware.',
        },
        {
          id: 'q2',
          question: 'Why is bcrypt preferred for password storage over simple SHA-256 hashes?',
          options: [
            'Bcrypt is faster and uses less CPU',
            'Bcrypt includes automatic salting and a configurable work factor (key derivation)',
            'SHA-256 cannot be hashed in Node.js',
            'Bcrypt encrypts passwords reversibly',
          ],
          correctAnswerIndex: 1,
          explanation: 'Bcrypt incorporates salting to prevent rainbow table attacks and an adjustable work factor (cost) to defend against brute-force attacks.',
        },
        {
          id: 'q3',
          question: 'What is the primary benefit of defining data transfer objects (DTOs) with Zod or TypeScript?',
          options: [
            'It prevents unauthorized network requests before they reach the router',
            'It guarantees runtime validation and compile-time type safety across client-server boundaries',
            'It compresses JSON payloads automatically',
            'It replaces the need for a database schema',
          ],
          correctAnswerIndex: 1,
          explanation: 'Schema validators guarantee incoming payloads strictly conform to expectations before being handled by controllers.',
        },
      ],
    },
  },
  // Course 1 - Module 2
  {
    id: 'lesson-1-2-1',
    moduleId: 'mod-1-2',
    courseId: 'course-1',
    title: '2.1 Advanced React 19 State Patterns & Custom Hooks',
    type: 'text',
    durationMinutes: 30,
    orderIndex: 1,
    content: `## Advanced React 19 State Patterns & Custom Hooks

In production enterprise frontends, unstructured state leads to difficult bugs, unnecessary rerenders, and race conditions.

### 1. Controlled vs Uncontrolled Components
When managing complex multi-step forms (such as internship application flows), consider when to hold state in React memory versus leveraging native FormData.

### 2. Writing Resilient Custom Hooks
Extracting business logic into isolated hooks keeps UI components declarative:
\`\`\`typescript
export function useInternshipApplication(internshipId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: ApplicationData) => {
    setLoading(true);
    try {
      const res = await api.post(\`/internships/\${internshipId}/apply\`, payload);
      return res.data;
    } catch (err) {
      setError('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
\`\`\`

Review the practical coding assignment in the next lesson to implement this pattern.`,
  },
  {
    id: 'lesson-1-2-2',
    moduleId: 'mod-1-2',
    courseId: 'course-1',
    title: '2.2 Practical Assignment: Building a Reusable Data Table Component',
    type: 'assignment',
    durationMinutes: 45,
    orderIndex: 2,
    assignmentPrompt: `### Assignment Prompt: Reusable Filterable Table Primitive

**Objective:**
Build an accessible, responsive data table in React with TypeScript that handles:
1. Column sorting (ascending/descending)
2. Filter by status badge
3. Pagination controls with page size selector
4. Accessible keyboard navigation

**Submission Requirements:**
Submit a link to your GitHub repository or Gist containing the component code, along with unit test coverage.`,
    content: 'Complete the hands-on data table assignment to solidify your understanding of generic components in TypeScript.',
  },
  // Course 1 - Module 3
  {
    id: 'lesson-1-3-1',
    moduleId: 'mod-1-3',
    courseId: 'course-1',
    title: '3.1 Database Schema Modeling with Prisma & PostgreSQL',
    type: 'text',
    durationMinutes: 30,
    orderIndex: 1,
    content: `## Database Schema Modeling with Prisma & PostgreSQL

Normalized relational databases remain the backbone of transactional web platforms.

### 1. Modeling One-to-Many and Many-to-Many Relations
- An \`Internship\` can have many \`InternshipApplications\`.
- A \`User\` has one \`StudentProfile\` and many \`Enrollments\`.
- Each \`Enrollment\` references one \`Course\`.

### 2. Adding Indexes for Query Performance
Always add indexes to fields frequently queried in WHERE clauses or JOIN operations, such as \`userId\`, \`courseId\`, and status tags.`,
  },
];

export const initialEnrollments: Enrollment[] = [
  {
    id: 'enr-1',
    userId: 'user-student-1',
    courseId: 'course-1',
    enrolledAt: '2026-02-01T10:00:00Z',
    progressPercent: 40,
    status: 'active',
  },
];

export const initialLessonProgress: LessonProgress[] = [
  {
    id: 'prog-1',
    userId: 'user-student-1',
    courseId: 'course-1',
    lessonId: 'lesson-1-1-1',
    completed: true,
    completedAt: '2026-02-05T11:20:00Z',
  },
  {
    id: 'prog-2',
    userId: 'user-student-1',
    courseId: 'course-1',
    lessonId: 'lesson-1-1-2',
    completed: true,
    completedAt: '2026-02-08T15:00:00Z',
  },
];

export const initialInternships: Internship[] = [
  {
    id: 'intern-1',
    title: 'Junior Full-Stack Software Engineering Intern',
    organization: 'Nordic Cloud Solutions',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
    location: 'Oslo, Norway (Remote options available)',
    workMode: 'hybrid',
    durationMonths: 6,
    stipend: '€2,600 / month',
    description: `Nordic Cloud Solutions is partnering directly with SkillBridge Academy to provide high-performing software engineering students with an immersive 6-month paid internship. You will be embedded into our Core Infrastructure & Frontend Platform squad, working alongside senior architects on production cloud services.`,
    responsibilities: [
      'Contribute clean, well-tested TypeScript and React code to client-facing web applications',
      'Assist in designing normalized PostgreSQL database schemas and Prisma ORM migrations',
      'Participate in daily agile standups, code reviews, and architectural design sessions',
      'Optimize API response latencies and audit web accessibility (WCAG 2.1 AA)',
    ],
    requiredSkills: ['TypeScript', 'React', 'Node.js or Express', 'Git & GitHub Collaboration', 'SQL fundamentals'],
    eligibilityCriteria: [
      'Enrolled in or graduated from SkillBridge Academy Full-Stack Program or equivalent CS degree',
      'Completed at least 1 verified end-to-end full-stack capstone project',
      'Available for 30-40 hours per week for the 6-month duration',
    ],
    deadline: '2026-11-30T23:59:59Z',
    availablePositions: 4,
    status: 'published',
    featured: true,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'intern-2',
    title: 'Frontend React & Design Systems Intern',
    organization: 'Aurora Digital Labs',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    location: 'Copenhagen, Denmark (Fully Remote)',
    workMode: 'remote',
    durationMonths: 4,
    stipend: '€2,300 / month',
    description: `Aurora Digital Labs crafts bespoke digital experiences for Scandinavian tech startups. In this internship, you will translate Figma prototypes into production Tailwind CSS and React component libraries with animations and accessibility.`,
    responsibilities: [
      'Build reusable UI components compliant with design token specifications',
      'Implement smooth micro-interactions and animations using Framer Motion',
      'Conduct cross-browser and mobile device compatibility testing',
      'Collaborate with product designers to refine interaction models',
    ],
    requiredSkills: ['React', 'Tailwind CSS', 'Figma inspection', 'HTML/CSS Semantics', 'JavaScript (ES6+)'],
    eligibilityCriteria: [
      'Strong eye for visual design and attention to typographic detail',
      'Active portfolio showcasing at least 2 web design implementations',
      'Self-driven remote communication skills',
    ],
    deadline: '2026-12-15T23:59:59Z',
    availablePositions: 3,
    status: 'published',
    featured: true,
    createdAt: '2026-01-25T11:00:00Z',
  },
  {
    id: 'intern-3',
    title: 'Cloud DevOps & Infrastructure Intern',
    organization: 'Viken Scalable Systems',
    logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&auto=format&fit=crop&q=80',
    location: 'Stockholm, Sweden (Hybrid)',
    workMode: 'hybrid',
    durationMonths: 6,
    stipend: '€2,800 / month',
    description: `Join Viken Scalable Systems to automate modern containerized environments. Work directly with our Site Reliability Engineering (SRE) team on Kubernetes clusters, CI/CD pipelines, and cloud monitoring.`,
    responsibilities: [
      'Write multi-stage Dockerfiles and Helm charts for microservices',
      'Maintain GitHub Actions workflows for continuous integration and automated testing',
      'Monitor application metrics using Prometheus, Grafana, and structured logs',
      'Participate in security audits and vulnerability remediation',
    ],
    requiredSkills: ['Linux/Unix command line', 'Docker basics', 'Git', 'Python or Bash scripting'],
    eligibilityCriteria: [
      'Completion of Cloud & DevOps coursework or relevant background',
      'Interest in site reliability, systems architecture, and distributed services',
    ],
    deadline: '2026-11-20T23:59:59Z',
    availablePositions: 2,
    status: 'published',
    featured: false,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'intern-4',
    title: 'Applied AI & Search Engineering Intern',
    organization: 'Fjord Intelligence',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    location: 'Bergen, Norway (Remote)',
    workMode: 'remote',
    durationMonths: 5,
    stipend: '€2,700 / month',
    description: `Fjord Intelligence builds enterprise intelligent document analysis systems. You will assist in developing retrieval-augmented generation (RAG) pipelines, semantic embeddings search, and model evaluation suites.`,
    responsibilities: [
      'Develop Python and Node.js connectors to vector databases',
      'Benchmark retrieval accuracy across different chunking strategies and embedding models',
      'Build internal test harnesses for hallucination detection',
    ],
    requiredSkills: ['Python or TypeScript', 'Basic Vector Database knowledge', 'REST APIs'],
    eligibilityCriteria: ['Demonstrated interest in LLMs and AI applications', 'Strong problem solving skills'],
    deadline: '2026-12-01T23:59:59Z',
    availablePositions: 2,
    status: 'published',
    featured: false,
    createdAt: '2026-02-10T14:00:00Z',
  },
];

export const initialApplications: InternshipApplication[] = [
  {
    id: 'app-1',
    internshipId: 'intern-1',
    studentId: 'user-student-1',
    coverLetter: `Dear Hiring Team at Nordic Cloud Solutions,\n\nI am writing to express my strong enthusiasm for the Junior Full-Stack Engineering Internship. Through my coursework at SkillBridge Academy, I have spent hundreds of hours architecting production-grade React frontends and Node.js REST services. Under mentor Sarah Chen's guidance, I have honed my discipline in TypeScript, relational schema modeling, and writing automated tests.\n\nI am eager to contribute to your core platform squad and learn directly from your experienced engineering leaders.\n\nWarm regards,\nAlex Rivera`,
    resumeFileName: 'Alex_Rivera_Software_Engineer_CV.pdf',
    resumeDataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp...',
    portfolioUrl: 'https://alexrivera.dev',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    additionalInfo: 'Available for full-time 40h/week during the internship period.',
    status: 'under_review',
    appliedAt: '2026-02-12T14:20:00Z',
    updatedAt: '2026-02-15T09:30:00Z',
    reviewNotes: 'Strong initial portfolio submission. Passed initial automated credential checks. Scheduled for technical mentor evaluation.',
    reviewedByUserId: 'user-admin-1',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    courseId: 'course-1',
    title: 'Enterprise Capstone: Multi-Tenant SaaS Workspace with RBAC',
    description: 'Design and implement a full-stack SaaS application with team workspaces, role-based authorization, REST API, and data visualizations.',
    instructions: `### Capstone Project Instructions

Build an end-to-end full-stack web application that satisfies production engineering criteria:
1. **Authentication & Security:** Register, login, password hashing with bcrypt, JWT token validation, and rate limiting.
2. **Role-Based Authorization:** Separate views and permissions for standard users, managers, and administrators.
3. **Database Architecture:** Normalized PostgreSQL tables with migrations and foreign key constraints.
4. **Interactive Dashboard:** Data analytics views utilizing responsive charts and filtered data tables.
5. **Deployment:** Hosted live URL with clean git commit history.`,
    requirements: [
      'Git repository with structured commits and comprehensive README.md',
      'Clean separation between frontend and backend services',
      'Integration testing suite covering authentication and core API endpoints',
      'Responsive design tested on mobile, tablet, and desktop viewports',
    ],
    deliverables: ['GitHub Repository URL', 'Live Production URL', 'System Architecture Diagram & Walkthrough Video'],
    deadline: '2026-11-15T23:59:59Z',
    milestones: [
      {
        id: 'ms-1',
        projectId: 'proj-1',
        title: 'Milestone 1: Database Schema & API Architecture Document',
        description: 'Submit entity relationship diagram (ERD) and documented REST route definitions.',
        orderIndex: 1,
        dueDate: '2026-03-01T23:59:59Z',
      },
      {
        id: 'ms-2',
        projectId: 'proj-1',
        title: 'Milestone 2: Functional Backend Core & Authentication Engine',
        description: 'Complete user registration, JWT authentication middleware, and RBAC controllers with unit tests.',
        orderIndex: 2,
        dueDate: '2026-04-15T23:59:59Z',
      },
      {
        id: 'ms-3',
        projectId: 'proj-1',
        title: 'Milestone 3: Complete UI Integration & Final Capstone Presentation',
        description: 'Integrate the React frontend with full responsive views, error states, and deployment.',
        orderIndex: 3,
        dueDate: '2026-05-30T23:59:59Z',
      },
    ],
    createdAt: '2026-01-15T10:00:00Z',
  },
];

export const initialSubmissions: ProjectSubmission[] = [
  {
    id: 'sub-1',
    projectId: 'proj-1',
    milestoneId: 'ms-1',
    studentId: 'user-student-1',
    repoUrl: 'https://github.com/alexrivera-dev/saas-capstone-spec',
    demoUrl: 'https://saas-spec-alex.vercel.app',
    notes: 'Here is Milestone 1 covering the normalized database schema, Prisma migrations file, and Postman API collection.',
    status: 'approved',
    grade: 96,
    mentorFeedback: 'Outstanding schema design, Alex! Your foreign key cascade rules and composite index on tenantId and email are spot on. Approved for Milestone 2.',
    mentorId: 'user-mentor-1',
    submittedAt: '2026-02-24T18:00:00Z',
    reviewedAt: '2026-02-26T10:15:00Z',
    version: 1,
  },
  {
    id: 'sub-2',
    projectId: 'proj-1',
    milestoneId: 'ms-2',
    studentId: 'user-student-1',
    repoUrl: 'https://github.com/alexrivera-dev/saas-capstone-api',
    demoUrl: 'https://saas-api-staging.railway.app',
    notes: 'Implemented the Express backend with bcrypt password hashing, JWT cookies, and rate limiting middleware. Waiting for your feedback!',
    status: 'under_review',
    submittedAt: '2026-03-05T19:30:00Z',
    version: 1,
  },
];

export const initialCertificates: Certificate[] = [
  {
    id: 'cert-1',
    certificateCode: 'SKB-2026-FSD-892',
    studentId: 'user-student-1',
    studentName: 'Alex Rivera',
    title: 'Full-Stack Web Engineering: Production Architecture',
    type: 'course',
    completionDate: '2026-02-28',
    issuingOrg: 'SkillBridge Academy',
    verificationUrl: '/verify/SKB-2026-FSD-892',
    status: 'valid',
    grade: 'Excellence (96%)',
    issuedByUserId: 'user-admin-1',
  },
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Autumn 2026 Industry Internship Cohort Openings Announced',
    content: `We are thrilled to announce 11 new verified paid engineering internships in partnership with Nordic Cloud Solutions, Aurora Digital Labs, and Viken Scalable Systems. Eligible students who have completed at least 40% of their core technical modules are encouraged to submit applications before deadlines.`,
    targetRole: 'all',
    priority: 'important',
    createdAt: '2026-02-15T10:00:00Z',
    authorName: 'Dr. Marcus Vance (Admin)',
    authorId: 'user-admin-1',
  },
  {
    id: 'ann-2',
    title: 'Upcoming Tech Talk: Distributed Caching with Redis & High-Throughput Node.js',
    content: `Join us this Thursday at 18:00 CET for an interactive masterclass led by Mentor Sarah Chen. We will dive into cache invalidation strategies and production telemetry. Link will be posted in your student dashboard.`,
    targetRole: 'student',
    priority: 'normal',
    createdAt: '2026-02-22T14:30:00Z',
    authorName: 'Sarah Chen (Mentor)',
    authorId: 'user-mentor-1',
  },
];

export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-student-1',
    title: 'Milestone 1 Approved!',
    message: 'Mentor Sarah Chen reviewed and approved your Milestone 1 submission with a score of 96%.',
    read: false,
    link: '/dashboard/projects',
    createdAt: '2026-02-26T10:15:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-student-1',
    title: 'Internship Application Under Review',
    message: 'Your application for Junior Full-Stack Software Engineering Intern at Nordic Cloud Solutions has advanced to Under Review.',
    read: true,
    link: '/dashboard/internships',
    createdAt: '2026-02-15T09:30:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-mentor-1',
    title: 'New Milestone Submission',
    message: 'Alex Rivera submitted Milestone 2: Functional Backend Core & Authentication Engine for review.',
    read: false,
    link: '/mentor/submissions',
    createdAt: '2026-03-05T19:30:00Z',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    userId: 'user-admin-1',
    userEmail: 'admin@skillbridge.edu',
    action: 'COURSE_PUBLISHED',
    entityType: 'Course',
    entityId: 'course-1',
    details: 'Published course "Full-Stack Web Engineering: Production Architecture"',
    ipAddress: '192.168.1.1',
    timestamp: '2026-01-05T09:00:00Z',
  },
  {
    id: 'audit-2',
    userId: 'user-admin-1',
    userEmail: 'admin@skillbridge.edu',
    action: 'CERTIFICATE_ISSUED',
    entityType: 'Certificate',
    entityId: 'cert-1',
    details: 'Issued Certificate SKB-2026-FSD-892 to Alex Rivera',
    ipAddress: '192.168.1.1',
    timestamp: '2026-02-28T16:00:00Z',
  },
  {
    id: 'audit-3',
    userId: 'user-mentor-1',
    userEmail: 'mentor@skillbridge.edu',
    action: 'SUBMISSION_GRADED',
    entityType: 'ProjectSubmission',
    entityId: 'sub-1',
    details: 'Graded Milestone 1 for Alex Rivera (Score: 96)',
    ipAddress: '192.168.1.42',
    timestamp: '2026-02-26T10:15:00Z',
  },
];
