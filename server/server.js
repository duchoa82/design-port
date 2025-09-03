import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import promptSheet from './prompt-sheet.js';
import UserTracker from './userTracking.js';
import { WebCrawler } from './crawler.js';
import AIService from './ai-service.js';
import WebAnalyzerStorage from './web-analyzer-storage.js';
import simpleCrawl from './simple-crawler.js';
import demoAnalyze from './demo-analyzer.js';
import tokenApi from './token-api.js';
import adminApi from './admin-api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini (optional)
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Initialize User Tracker
const userTracker = new UserTracker();

// Initialize Web Analyzer Services
const webCrawler = new WebCrawler();
const aiService = new AIService();
const webAnalyzerStorage = new WebAnalyzerStorage();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
  'http://localhost:8085',
  'http://localhost:8086',
  'http://localhost:8087'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// In-memory storage for conversations (replace with database in production)
const conversations = new Map();
let conversationCounter = 1; // Counter for numbered conversation IDs

// Portfolio information for AI responses (keeping for fallback)
const PORTFOLIO_INFO = {
  name: "Truong Duc Hoa",
  role: "Product Owner & Associate PM",
  skills: [
    "Product Management", "Agile", "Web3", "AI/ML", "Blockchain",
    "User Research", "Data Analysis", "Stakeholder Management"
  ],
  experience: [
    "5+ years in tech industry",
    "Built 4 Web3 products in 6 months",
    "Developed 8 AI agents in 3 months",
    "End-to-end product operations"
  ],
  projects: [
    "Web3 products and NFT platforms",
    "AI agents for various use cases",
    "Product management and agile processes"
  ],
  education: "Tech industry experience",
  interests: ["Product thinking", "Tech execution", "AI/ML", "Web3"]
};

// Local decision-making prompt for analyzing user input
const LOCAL_ANALYSIS_PROMPT = `### Role Definition
You are a **Smart AI's Assistance** with a strong understanding of user requests to map with the right context.

Your task is to analyze this message from the user, make a decision to answer the question based on the trained knowledge, or send the request to the AI's API

---
**Your task:**
Your task is to analyze the user request based on the context, to decide to answer the question yourself or send the request to AI.

---

### Workflow

#### Step 1: Analyze Context
Analyze the user's request via \`{{USER_INPUT}}\`  and to define what users want, and filter this into 2 cases:

**Case 1:** User wants to know about Hoà Trương's information
**Case 2:** User wants you to write the **User Stories** with their new function description.
**Case 3:** Other Cases.

#### Step 2: Process as a user story in 2 cases below:
**Case 1:** User wants to know about Hoà Trương's information.
- Respond to the questions based on the system knowledge with the following format
- 
**Case 2:** User wants you to write the **User Stories** with their new function description.
- Input the variant \`{{USER_INPUT}}\`  and \`{{LAST_AI_RESPONSE}}\` (if has) to the prompt-1, or prompt-2

**Case 3:** Other Cases.
Tell users this is out of your scope, you'll update with Hoà, let's try with the funny voice.

### Output Format
Respond with ONLY one of these exact phrases:
- "CASE_1" - if user wants to know about Hoà Trương's information
- "CASE_2" - if user wants to write User Stories
- "CASE_3" - if request is out of scope

### Examples
User: "Hello" → CASE_1
User: "Who are you?" → CASE_1  
User: "Write user story for login" → CASE_2
User: "What projects have you worked on?" → CASE_1
User: "Modify the last response" → CASE_2
User: "Tell me about blockchain technology" → CASE_3

{{USER_INPUT}}: {{MESSAGE}}`;

// Generate AI response based on local decision-making
async function generateAIResponse(userMessage, conversationContext = null) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check if it's a user story or sprint planning request
  const isUserStoryRequest = lowerMessage.includes('generate user stories') || 
                            lowerMessage.includes('target user') || 
                            lowerMessage.includes('task description');
  
  const isSprintRequest = lowerMessage.includes('create sprint plan') || 
                         lowerMessage.includes('sprint plan');
  
  if (isUserStoryRequest || isSprintRequest) {
    return await handleUserStoryRequest(userMessage, conversationContext);
  }
  
  // For general chat questions, provide portfolio information
  return await generateLocalResponse(userMessage);
}

// Function to handle general chat questions about Hoà Trương's portfolio
async function generateLocalResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm Truong Duc Hoa, a Product Owner & Associate PM. What would you like to know about my experience?`;
  }
  
  // About me
  if (lowerMessage.includes('who are you') || lowerMessage.includes('tell me about yourself')) {
    return `My name is **Trương Đức Hoà** -  a Product Owner & Associate PM with over 3 years of experience in the tech industry.

My goal is to drive meaningful impact through the synergy of product thinking, tech execution, and speed.

I'm known for my ability to **learn fast** and adapt to emerging technologies, having **built 4 Web3 products and 8 AI agents** from scratch in a short period.`;
  }
  
  // Projects
  if (lowerMessage.includes('project') || lowerMessage.includes('work on') || lowerMessage.includes('built')) {
    return `I've led and delivered multiple impactful projects, but highlighted:

**4 Web3 products**: Built within 6 months, including NFT platforms and token-gated apps—fully self-taught.

**8 AI agents**: Shipped in 3 months, covering livestream summarization, Q&A bots, and internal chat assistants.`;
  }
  
  // Skills
  if (lowerMessage.includes('skill') || lowerMessage.includes('expertise') || lowerMessage.includes('specialize')) {
    return `My key skills and expertise include:

**Core Skills:**
• Product Management
• Agile methodologies
• User Research
• Data Analysis
• Stakeholder Management

**Technical Skills:**
• Web3 development
• AI/ML systems
• Blockchain technology
• Product thinking
• Tech execution

**Experience:**
• 5+ years in tech industry
• Built 4 Web3 products in 6 months
• Developed 8 AI agents in 3 months
• End-to-end product operations

What specific skills would you like to know more about?`;
  }
  
  // Experience
  if (lowerMessage.includes('experience') || lowerMessage.includes('background') || lowerMessage.includes('years')) {
    return `I have over 5 years of experience in the tech industry with a focus on:

**Key Achievements:**
• Built 4 Web3 products in 6 months
• Developed 8 AI agents in 3 months
• Led end-to-end product operations

**Areas of Expertise:**
• Product Management & Agile
• Web3 & Blockchain
• AI/ML & Machine Learning
• User Research & Data Analysis

**Education & Background:**
• Tech industry experience
• Strong focus on product thinking and tech execution
• Passion for AI/ML and Web3 technologies

Would you like to know more about my specific projects or methodologies?`;
  }
  
  // Strengths and Weaknesses
  if (lowerMessage.includes('strength') || lowerMessage.includes('weakness') || lowerMessage.includes('strengths') || lowerMessage.includes('weaknesses')) {
    return `### **Strengths**
-   **Fast learner, hands-on**: Built 4 Web3 products in 6 months, 8 AI agents in 3 months—all self-taught.
-   **Structured thinker**: Good at turning vague ideas into clear workflows and bridging tech & business.
-   **Self-aware & adaptive**: Understands own limits, prefers long-term growth over chasing hype.
    

### **Weaknesses**
-   **Overdrive mode**: Tends to go too fast, risking burnout—learning to pace better.
-   **Team instability**: Past failed teams taught the importance of choosing the right people and missions.
-   **FOMO-driven**: Used to chase trends—now shifting focus to long-term impact.
-   **Perfectionist**: Sometimes over-polishes—learning to ship when it's "good enough."`;
  }
  
  // Career Goals
  if (lowerMessage.includes('career goal') || lowerMessage.includes('goal') || lowerMessage.includes('future') || lowerMessage.includes('moving forward')) {
    return `I'm looking to join a **vision-driven team**, working on products that **create real impact**, where I can bridge the gap between product, engineering, and business.

I want to continue **exploring the potential of AI**, **shipping** products that are not just **feature-complete but user-validated**, outcome-oriented, and market-ready—from idea to production.`;
  }
  
  // Working Workflow
  if (lowerMessage.includes('workflow') || lowerMessage.includes('process') || lowerMessage.includes('methodology') || lowerMessage.includes('approach')) {
    return `## My Working Process
### 1. Requirement Collection
Gather inputs from multiple sources: chats, direct discussions, Figma files (for business/technical changes), and written feedback. Focus on identifying core needs and clarifying business goals.

### 2. Technical Research & Estimation
Run technical feasibility checks in parallel with wireframe discussions. Collaborate with the dev lead and designer to estimate total effort and refine implementation direction.

### 3. Release Planning
Prioritize key and blocking features first, followed by low-effort quick wins. Group features by epic and align them with the current sitemap for structured releases.

### 4. Design – Development – QC
Once stakeholders approve, the team proceeds with design, development, and QA on the dev environment. I write the release notes and define key tracking metrics.

### 5. Demo & Release
Conduct a staging demo when the system is stable and bug-free. Final fixes and prioritized feedback are applied before deploying to production and closing the sprint.

----
### Internal Feedback Loop
**With stakeholders:** I organize focused Q&A sessions (critical questioning) to clarify expectations and align features with business value.

**With DEVs, QC & Design:** Translate requirements into technical terms, gather feedback, and run solution brainstorms across roles.`;
  }
  
  // Default response for other questions
  return `I'm Truong Duc Hoa, a Product Owner & Associate PM with expertise in Web3, AI/ML, and Product Management. I've built 4 Web3 products and developed 8 AI agents. 

You can ask me about:
• My projects and experience
• My skills and expertise
• My background and achievements
• Or use the Recruiter Playground for user story generation and sprint planning

What would you like to know?`;
}

// Removed old isUserStoryRequest function - detection is now handled directly in generateAIResponse

// Function to handle user story requests
async function handleUserStoryRequest(userMessage, conversationContext) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Simple workflow based on message content
  console.log('🔍 Workflow check:', {
    message: userMessage,
    hasSprintPlan: userMessage.includes('Create sprint plan for Team Member:'),
    hasContext: !!conversationContext,
    hasLastResponse: !!conversationContext?.lastUserStoryResponse,
    contextPreview: conversationContext?.lastUserStoryResponse?.substring(0, 100) + '...'
  });
  
  if (userMessage.includes('Create sprint plan for Team Member:')) {
    // Sprint planning - use prompt-2 with previous user stories
    console.log('🎯 Routing to sprint planning');
    return await generateUserStoryModification(userMessage, conversationContext);
  } else if (userMessage.includes('Generate user stories for Target User:') || 
             userMessage.includes('Please generate user stories and epics') ||
             userMessage.includes('Target User:') && userMessage.includes('Task Description:') ||
             userMessage.includes('Write Another User Story') ||
             userMessage.includes('Write Me The User Stories')) {
    // New user story generation - use prompt-1
    console.log('🎯 Routing to new user story generation');
    return await generateNewUserStories(userMessage);
  } else {
    // Default to new user story generation
    console.log('🎯 Defaulting to new user story generation');
    return await generateNewUserStories(userMessage);
  }
}

// Function to generate user story modifications (prompt-2)
async function generateUserStoryModification(userMessage, conversationContext) {
  // This function now only handles sprint planning
  const sprintMatch = userMessage.match(/Create sprint plan for Team Member: (.+), Project Timeline: (.+)/);
  if (sprintMatch) {
    const teamMember = sprintMatch[1];
    const projectTimeline = sprintMatch[2];
    
    const userStoriesContent = conversationContext?.lastUserStoryResponse || 'Sample User Stories:\n\nEpic 1: Login Flow\n\nUser Story 1: As a customer, I want to login to my account, so that I can access my personalized dashboard.\n\nAcceptance Criteria:\n- A/C 1: Given I am on the login page, when I enter valid credentials, then I should be redirected to my dashboard.\n- A/C 2: Given I enter invalid credentials, when I submit the form, then I should see an error message.\n\nUser Story 2: As a customer, I want to reset my password, so that I can regain access if I forget it.\n\nAcceptance Criteria:\n- A/C 1: Given I click forgot password, when I enter my email, then I should receive a reset link.\n- A/C 2: Given I click the reset link, when I enter a new password, then my password should be updated.';
    
    const sprintPrompt = `---
### Role Definition
You are a **Product Owner and Agile Business Analyst**, an expert in making the sprint planning based on user input for {{Team_Member}}, User Stories, and {{Project_Timeline}}

---
**Your task:**
Your task is to analyze the {{User_Stories}} and with the {{Team_Member}}. You create the sprint plan based on the knowledge of Scrum and Agile methodology.

---

### Workflow

#### Step 1: Analyze the scope of work
Analyze the {{User_Stories}} and {{Team_Member}}, and {{Time_Line}} to define the scope of work for each team. Some scope of work requires a specific role, but if user input is lacking, please assume that we have at least one team member in charge for this.

#### Step 2: Process as a sprint
Based on the analysis of the scope of work for the team, gen the Sprint plan to ensure that it meets the timeline of the projects following the rule:

1. One Sprint always follows at least 1-2 weeks for a sprint
2. A Sprint always includes: 4 days for developing, 4 days for QC, and 2 days for fixing bugs. For the scope of Design, it should run before the sprint starts.
3. Key functions should be run first, and functions that block the other functions should be run first.

### Other Rule:
1. Print the output exactly the format below, and nothing else.
2. Merge more than one user story into one sprint if possible
3. Don't duplicate the user stories in output.
4. Generate result following the output format only, and nothing else.
5. Do not add any additional explanations, comments, or content outside the specified format.

### Output Format (Markdown)
\`\`\`markdown
## Sprint 1 (number of weeks)
\`\`\`

#### User Story Included
\`\`\`markdown
- **User Story 1:** As a [role], I want to [do something], so that [desired benefit]
- **User Story 2:** As a [role], I want to [do something], so that [desired benefit]
...
\`\`\`
\`\`\`markdown
#### Team Allocation:
- **BE:** their scope of work
- **FE:** their scope of work
- **QC:** their scope of work

repeat for sprint 2,..n
\`\`\`
\`\`\`markdown
#### Summary of work:
- **Development (days needed):**
(bullet points of dev work)
- **QC (days needed):**
(bullet points of QC work)
\`\`\`

**CRITICAL:** Generate a SPRINT PLAN, not user stories. Use the user stories from the previous conversation to create the sprint plan.

Team Member: ${teamMember}
Project Timeline: ${projectTimeline}

**USER STORIES FROM PREVIOUS CONVERSATION:**
${userStoriesContent}

**CRITICAL:** Use ALL of the user stories content above to create your sprint plan.`;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const generationConfig = {
          temperature: 1.0,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4000,
        };
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: sprintPrompt }] }],
          generationConfig
        });
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('Gemini API error for sprint planning:', error);
        return generateFallbackSprintPlan(teamMember, projectTimeline);
      }
    }
    return generateFallbackSprintPlan(teamMember, projectTimeline);
  }

  // If not a sprint plan request, return error
  return "This function is only for sprint planning. Please use the appropriate workflow.";
}

// Function to generate specific epics
async function generateSpecificEpics(epics) {
  const epicList = epics.join(', ');
  
  const specificEpicPrompt = `### Role Definition
You are a **Product Owner and Agile Business Analyst** with a strong understanding of user story mapping and stakeholder value. Your job is to generate detailed, realistic user stories for specific software epics.

---
**Your task:**
Generate comprehensive user stories for the following specific epics: **${epicList}**

---

### CRITICAL INSTRUCTIONS
- **PARSE THE INPUT:** The epics are: ${epics.map((epic, index) => `${index + 1}. ${epic}`).join(', ')}
- **Generate separate epics:** Create Epic 1: ${epics[0]}, Epic 2: ${epics[1]}, Epic 3: ${epics[2]}
- **Generate 2 detailed user stories** for each epic
- **Make the stories realistic and specific** to each epic
- **Include detailed acceptance criteria** that are testable
- **Focus on business value** and user experience

### Output Format (Markdown)

\`\`\`markdown
## Epic 1: ${epics[0]}
## Epic 2: ${epics[1]}
## Epic 3: ${epics[2]}
\`\`\`

#### User Story Format
\`\`\`markdown
**User Story 1:** As a [specific role], I want to [specific action], so that [specific business value]
\`\`\`

#### Acceptance Criteria Format
\`\`\`markdown
### Acceptance Criteria:
- **A/C 1:** Given [specific context], when [specific action], then [specific outcome].
- **A/C 2:** Given [specific context], when [specific action], then [specific outcome].
- **A/C 3:** Given [specific context], when [specific action], then [specific outcome].
- **A/C 4:** Given [specific context], when [specific action], then [specific outcome].
\`\`\`

### Notes
- **CRITICAL:** Generate exactly these epics: Epic 1: ${epics[0]}, Epic 2: ${epics[1]}, Epic 3: ${epics[2]}
- Make stories **specific and realistic** for each epic
- Focus on **user value** and **business outcomes**
- Write in clear business terms
- Always use markdown bullet points for A/C
- No emojis or icons in output
- End with: "This is for the demo content. There are 3 more Epics (e.g., Advanced Features, Integration, Analytics) and about 8 additional User Stories. But in the scope of the demo, I would like to make it simple."

Generate user stories for these specific epics: Epic 1: ${epics[0]}, Epic 2: ${epics[1]}, Epic 3: ${epics[2]}`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const generationConfig = {
        temperature: 1.0,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 65536,
      };
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: specificEpicPrompt }] }],
        generationConfig
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error for specific epics:', error);
      return generateFallbackSpecificEpics(epics);
    }
  }

  return generateFallbackSpecificEpics(epics);
}

// Function to generate new user stories (prompt-1)
async function generateNewUserStories(userMessage) {
  // Extract Target User and Task Description from user message
  let featureMatch = userMessage.match(/Generate user stories for Target User: (.+), Task Description: (.+)/);
  
  // If not found, try the frontend format
  if (!featureMatch) {
    featureMatch = userMessage.match(/Target User: (.+), Task Description: (.+)/);
  }
  
  // If still not found, try with "Please generate user stories and epics" prefix
  if (!featureMatch) {
    featureMatch = userMessage.match(/Please generate user stories and epics\. Target User: (.+), Task Description: (.+)/);
  }
  
  if (!featureMatch) {
    return "Please provide both Target User and Task Description in the format: 'Generate user stories for Target User: [user], Task Description: [description]' or 'Target User: [user], Task Description: [description]'";
  }
  
  const targetUser = featureMatch[1];
  const taskDescription = featureMatch[2];
  const feature = `${targetUser} - ${taskDescription}`;
  


  const prompt1 = `---
## Your Role:
You are a **Product Owner and Agile Business Analyst** with a strong understanding of user story mapping and stakeholder value. Based on user input  {{Target_User}}, and {{Task_Description}} 

Your task is to analyze this message from a stakeholder or user and generate structured epics and user stories accordingly.

---

### Workflow

1. Analyze the {{Target_User}}, and {{Task_Description}} to get the insight, and be ready to turn into user stories.
2. Break it down into Epics. 
3. For each user story, include **acceptance criteria (A/C)** using the Given/When/Then format. Separate the A/C into happy cases and negative cases for this Task Description as one of the A/C.
4. Always print the introduction and closing sentences 
5. Print the content following the output format only, nothing else.
6. Generate result following the output format only, and nothing else.
7. Do not add any additional explanations, comments, or content outside the specified format.
---

### Output Format (Markdown)

There are **{{number of epics generated}} Epics**, **{{number of user stories generated}} User Stories**, and acceptance criteria cases based on your input.

#### Epic Format
\`\`\`markdown
## Epic 1: [Function or Feature Name]
\`\`\`

#### User Story Format
\`\`\`markdown
### **User Story 1:**
As a **[role of target user]**, I want to **[do something - a kind of task description]**, so that **[desired benefit]**

#### Acceptance Criteria (Happy Cases)
- **A/C 1:** Given [context], when [event occurs], then [expected outcome].
- **A/C 2:** Given [another context], when [event occurs], then [expected outcome].

#### Acceptance Criteria (Negative Cases)
- **A/C 1:** Given [context], when [event occurs], then [expected outcome].
- **A/C 2:** Given [another context], when [event occurs], then [expected outcome].

---

### **User Story 2:**
As a **[role of target user]**, I want to **[do something - a kind of task description]**, so that **[desired benefit]**

#### Acceptance Criteria (Happy Cases)
- **A/C 1:** Given [context], when [event occurs], then [expected outcome].
- **A/C 2:** Given [another context], when [event occurs], then [expected outcome].

#### Acceptance Criteria (Negative Cases)
- **A/C 1:** Given [context], when [event occurs], then [expected outcome].
- **A/C 2:** Given [another context], when [event occurs], then [expected outcome].
\`\`\`

#### Epic Separation Format
\`\`\`markdown
---

## Epic 2: [Function or Feature Name]
\`\`\`

Repeat the same User Story Format for Epic 2, Epic 3, etc.

This result is generated with AI based on system thinking and user story training by Hoà Trương.

Generate user stories for: **${feature}**

Target User: ${targetUser}
Task Description: ${taskDescription}`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const generationConfig = {
        temperature: 1.0,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 65536,
      };
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt1 }] }],
        generationConfig
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error for new user stories (prompt-1):', error);
      return generateFallbackNewUserStories(feature);
    }
  }

  return generateFallbackNewUserStories(feature);
}

// Fallback functions for when OpenAI is not available
function generateFallbackUserStoryModification(userMessage) {
  return `## Sprint 1 (Weeks 1-2)

**User Stories Included:**
- User Story 1: As a customer, I want to login to my account, so that I can access my personalized dashboard.

**Team Allocation:**
- Developer 1: Develop login functionality and session management
- Developer 2: Develop error handling and authentication services
- Designer: Design login page and error message UI
- QA: Test login functionality with valid and invalid credentials

**Sprint Breakdown:**
- Days 1-4: Development phase
- Days 5-8: Quality Control and testing
- Days 9-10: Bug fixes and final adjustments

## Sprint 2 (Weeks 3-4)

**User Stories Included:**
- User Story 2: As a customer, I want to reset my password, so that I can regain access if I forget it.

**Team Allocation:**
- Developer 1: Develop forgot password functionality
- Developer 2: Develop password reset process
- Designer: Design forgot password flow and email templates
- QA: Test password reset functionality and email delivery

**Sprint Breakdown:**
- Days 1-4: Development phase
- Days 5-8: Quality Control and testing
- Days 9-10: Bug fixes and final adjustments`;
}

function generateFallbackSprintPlan(teamMember, projectTimeline) {
  return `## Sprint 1

#### User Story Included
- **User Story 1:** As a developer, I want to implement the core functionality, so that I can deliver the basic features on time.
- **User Story 2:** As a QA engineer, I want to thoroughly test all features, so that I can ensure high quality delivery.

#### Team Allocation:
- **BE:** Implement backend APIs and database structure
- **FE:** Develop user interface components
- **QC:** Test core functionality and user flows

## Sprint 2

#### User Story Included
- **User Story 3:** As a system administrator, I want to monitor system performance, so that I can ensure optimal operation.

#### Team Allocation:
- **BE:** Implement remaining backend features
- **FE:** Complete frontend development
- **QC:** Comprehensive testing and validation

#### Summary of work:
**Development (days needed):**
• Backend API development (8 days)
• Frontend component development (8 days)
• Database schema implementation (4 days)
**QC (days needed):**
• Functional testing (8 days)
• Integration testing (4 days)
• User acceptance testing (4 days)

This sprint plan is designed for a ${projectTimeline} timeline with ${teamMember} team composition.`;
}

function generateFallbackNewUserStories(feature) {
  return `## Epic 1: ${feature.charAt(0).toUpperCase() + feature.slice(1)} Feature

**User Story 1:** As a user, I want to ${feature.toLowerCase()}, so that I can achieve my desired outcome efficiently.

### Acceptance Criteria:
- **A/C 1:** Given I am on the ${feature} page, when I perform the main action, then I should see the expected result.
- **A/C 2:** Given I encounter an error during ${feature}, when the system fails, then I should see a helpful error message.
- **A/C 3:** Given I want to customize my ${feature} experience, when I access settings, then I can modify preferences.
- **A/C 4:** Given I need help with ${feature}, when I look for assistance, then I can find relevant documentation or support.

**User Story 2:** As a system administrator, I want to monitor ${feature} usage, so that I can ensure optimal performance and user satisfaction.

### Acceptance Criteria:
- **A/C 1:** Given I am monitoring the system, when ${feature} is used, then I should see usage metrics.
- **A/C 2:** Given I need to troubleshoot issues, when problems occur with ${feature}, then I should receive alerts.
- **A/C 3:** Given I want to optimize performance, when I analyze ${feature} data, then I should see performance insights.
- **A/C 4:** Given I need to plan capacity, when I review ${feature} trends, then I should see growth patterns.

This is for the demo content. There are 3 more Epics (e.g., Advanced Features, Integration, Analytics) and about 8 additional User Stories. But in the scope of the demo, I would like to make it simple.`;
}

function generateFallbackSpecificEpics(epics) {
  const epicList = epics.join(', ');
  return `## Epic 1: ${epics[0]}

**User Story 1:** As a user, I want to access ${epics[0].toLowerCase()} functionality, so that I can benefit from advanced features.

### Acceptance Criteria:
- **A/C 1:** Given I am on the ${epics[0]} page, when I access the feature, then I should see the expected functionality.
- **A/C 2:** Given I encounter an error, when the system fails, then I should see a helpful error message.
- **A/C 3:** Given I want to customize settings, when I access preferences, then I can modify the configuration.
- **A/C 4:** Given I need help, when I look for assistance, then I can find relevant documentation.

**User Story 2:** As a system administrator, I want to monitor ${epics[0]} usage, so that I can ensure optimal performance.

### Acceptance Criteria:
- **A/C 1:** Given I am monitoring the system, when ${epics[0]} is used, then I should see usage metrics.
- **A/C 2:** Given I need to troubleshoot issues, when problems occur, then I should receive alerts.
- **A/C 3:** Given I want to optimize performance, when I analyze data, then I should see performance insights.
- **A/C 4:** Given I need to plan capacity, when I review trends, then I should see growth patterns.

## Epic 2: ${epics[1] || 'Integration'}

**User Story 3:** As a user, I want to integrate with external systems, so that I can streamline my workflow.

### Acceptance Criteria:
- **A/C 1:** Given I am setting up integration, when I configure the connection, then the system should establish a secure connection.
- **A/C 2:** Given the integration is active, when I perform actions, then data should sync between systems.
- **A/C 3:** Given there are sync issues, when errors occur, then I should receive clear error messages.
- **A/C 4:** Given I need to monitor integration health, when I check status, then I should see real-time metrics.

**User Story 4:** As a developer, I want to manage integration settings, so that I can maintain system connectivity.

### Acceptance Criteria:
- **A/C 1:** Given I am in the admin panel, when I access integration settings, then I should see all active connections.
- **A/C 2:** Given I need to update credentials, when I modify settings, then the changes should be applied securely.
- **A/C 3:** Given I want to test connectivity, when I run diagnostics, then I should see detailed status reports.
- **A/C 4:** Given I need to troubleshoot issues, when I view logs, then I should see comprehensive error details.

## Epic 3: ${epics[2] || 'Analytics'}

**User Story 5:** As a business analyst, I want to view comprehensive analytics, so that I can make data-driven decisions.

### Acceptance Criteria:
- **A/C 1:** Given I am on the analytics dashboard, when I load the page, then I should see relevant metrics and charts.
- **A/C 2:** Given I want to filter data, when I apply filters, then the dashboard should update with filtered results.
- **A/C 3:** Given I need to export data, when I request an export, then I should receive the data in the requested format.
- **A/C 4:** Given I want to schedule reports, when I set up automation, then reports should be generated and sent automatically.

**User Story 6:** As a manager, I want to track key performance indicators, so that I can monitor business performance.

### Acceptance Criteria:
- **A/C 1:** Given I am viewing KPIs, when I select a time period, then the metrics should update accordingly.
- **A/C 2:** Given I want to compare periods, when I select multiple timeframes, then I should see comparative analysis.
- **A/C 3:** Given I need to set alerts, when I configure thresholds, then I should receive notifications when thresholds are exceeded.
- **A/C 4:** Given I want to share insights, when I generate reports, then I should be able to share them with stakeholders.

This is for the demo content. There are 3 more Epics (e.g., Advanced Features, Integration, Analytics) and about 8 additional User Stories. But in the scope of the demo, I would like to make it simple.`;
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Chat API is running'
  });
});

// Send message endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Create or get conversation
    let convId = conversationId;
    if (!convId) {
      // Generate numbered conversation ID
      convId = `conv-${conversationCounter}`;
      conversationCounter++;
    }
    if (!conversations.has(convId)) {
      conversations.set(convId, []);
    }

    const conversation = conversations.get(convId);

    // Track session start time if this is the first message
    if (conversation.length === 0) {
      conversation.sessionStartTime = new Date();
    }

    // Add user message
    const userMessage = {
      id: uuidv4(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    conversation.push(userMessage);

    // Get conversation context for user story tracking
    const conversationContext = getConversationContext(conversation);
    
    // Debug logging for conversation context
    console.log('🔍 Conversation Context Debug:');
    console.log('  - Conversation ID:', convId);
    console.log('  - Total messages:', conversation.length);
    console.log('  - Has user story context:', !!conversationContext.lastUserStoryResponse);
    if (conversationContext.lastUserStoryResponse) {
      console.log('  - Context preview:', conversationContext.lastUserStoryResponse.substring(0, 100) + '...');
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message, conversationContext);
    
    const aiMessage = {
      id: uuidv4(),
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
    conversation.push(aiMessage);

    // Track user interactions
    trackUserInteraction(convId, message, aiResponse, conversation);

    // Keep only last 50 messages to prevent memory issues
    if (conversation.length > 50) {
      conversation.splice(0, conversation.length - 50);
    }

    res.json({
      conversationId: convId,
      messages: conversation,
      lastMessage: aiMessage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to track user interactions
function trackUserInteraction(conversationId, userMessage, aiResponse, conversation) {
  try {
    const lowerMessage = userMessage.toLowerCase();
    
    // Track playground interactions
    if (lowerMessage.includes('generate user stories') || lowerMessage.includes('target user')) {
      const targetUserMatch = userMessage.match(/Target User:\s*([^,]+)/);
      const taskDescriptionMatch = userMessage.match(/Task Description:\s*([^,]+)/);
      
      if (targetUserMatch && taskDescriptionMatch) {
        conversation.playgroundData = {
          targetUser: targetUserMatch[1].trim(),
          taskDescription: taskDescriptionMatch[1].trim(),
          step1Completed: true
        };
      }
    }

    // Track sprint planning interactions
    if (lowerMessage.includes('create sprint plan') || lowerMessage.includes('team member')) {
      const teamMatch = userMessage.match(/Team Member:\s*([^,]+)/);
      const timelineMatch = userMessage.match(/Project Timeline:\s*([^,]+)/);
      
      if (teamMatch && timelineMatch) {
        conversation.sprintData = {
          team: teamMatch[1].trim(),
          timeline: timelineMatch[1].trim(),
          step2Completed: true
        };
      }
    }

    // Track chat bubble interactions (first 4 questions)
    const chatBubbleQuestions = [
      'who are you',
      'what projects',
      'career goals',
      'strengths',
      'working process',
      'hello',
      'hi',
      'hey'
    ];

    const questionIndex = chatBubbleQuestions.findIndex(q => lowerMessage.includes(q));
    if (questionIndex >= 0 && questionIndex < 4) {
      conversation[`chatBubble${questionIndex + 1}`] = userMessage;
    } else if (questionIndex >= 0) {
      conversation.chatBubbleFree = userMessage;
    }

    // Record session when conversation ends (after 10 messages or specific keywords)
    if (conversation.length >= 10 || 
        lowerMessage.includes('thank you') || 
        lowerMessage.includes('goodbye') ||
        lowerMessage.includes('bye')) {
      
      recordUserSession(conversationId, conversation);
    }

  } catch (error) {
    console.error('Error tracking user interaction:', error);
  }
}

// Function to record complete user session
function recordUserSession(conversationId, conversation) {
  try {
    const sessionData = {
      startTime: conversation.sessionStartTime || new Date(),
      endTime: new Date(),
      playgroundConvoId: conversationId,
      playgroundMessTarget: conversation.playgroundData?.targetUser || null,
      playgroundMessDescription: conversation.playgroundData?.taskDescription || null,
      playgroundStep1: conversation.playgroundData?.step1Completed ? 'Completed' : null,
      playgroundMessTeam: conversation.sprintData?.team || null,
      playgroundMessTimeline: conversation.sprintData?.timeline || null,
      playgroundStep2: conversation.sprintData?.step2Completed ? 'Completed' : null,
      chatBubble1: conversation.chatBubble1 || null,
      chatBubble2: conversation.chatBubble2 || null,
      chatBubble3: conversation.chatBubble3 || null,
      chatBubble4: conversation.chatBubble4 || null,
      chatBubbleFree: conversation.chatBubbleFree || null
    };

    userTracker.recordUserSession(sessionData);
    
    // Clear session data after recording
    delete conversation.sessionStartTime;
    delete conversation.playgroundData;
    delete conversation.sprintData;
    delete conversation.chatBubble1;
    delete conversation.chatBubble2;
    delete conversation.chatBubble3;
    delete conversation.chatBubble4;
    delete conversation.chatBubbleFree;

  } catch (error) {
    console.error('Error recording user session:', error);
  }
}

// Function to get conversation context for user story tracking
function getConversationContext(conversation) {
  // Find the last AI response that was a user story
  const lastUserStoryResponse = conversation
    .filter(msg => msg.sender === 'ai')
    .reverse()
    .find(msg => {
      const text = msg.text.toLowerCase();
      // Very specific check to ensure it's actually a user story response
      // Must contain both "epic" and "user story" AND "acceptance criteria"
      return text.includes('epic') && 
             text.includes('user story') && 
             text.includes('acceptance criteria') &&
             text.includes('a/c') &&
             text.includes('given') && 
             text.includes('when') && 
             text.includes('then');
    });

  return {
    lastUserStoryResponse: lastUserStoryResponse ? lastUserStoryResponse.text : null
  };
}

// Get conversation history
app.get('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  const conversation = conversations.get(id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json({ conversation });
});

// Manual session recording endpoint
app.post('/api/record-session/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = conversations.get(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    recordUserSession(conversationId, conversation);
    res.json({ success: true, message: 'Session recorded successfully' });
    
  } catch (error) {
    console.error('Error recording session:', error);
    res.status(500).json({ error: 'Failed to record session' });
  }
});

// Cleanup old sessions (run every hour)
setInterval(() => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  for (const [conversationId, conversation] of conversations.entries()) {
    if (conversation.sessionStartTime && conversation.sessionStartTime < oneHourAgo) {
      // Record session before cleanup
      recordUserSession(conversationId, conversation);
      conversations.delete(conversationId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Clear conversation
app.delete('/api/chat/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (conversations.has(conversationId)) {
      conversations.delete(conversationId);
    }

    res.json({ message: 'Conversation cleared successfully' });

  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Web Analyzer API endpoints
app.get('/api/web-analyzer/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Web Analyzer API is working!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/web-analyzer/simple-test', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const result = await simpleCrawl(url);
    res.json({ success: true, data: result });
    
  } catch (error) {
    console.error('Simple test error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/web-analyzer/demo', (req, res) => {
  try {
    const { url, userId } = req.body;
    
    if (!url || !userId) {
      return res.status(400).json({ error: 'URL and userId are required' });
    }
    
    const result = demoAnalyze(url);
    res.json({
      success: true,
      analysis: result.analysis,
      metaData: result.metaData,
      timestamp: result.timestamp
    });
    
  } catch (error) {
    console.error('Demo error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/web-analyzer/analyze', async (req, res) => {
  try {
    const { url, userId } = req.body;

    // Validate input
    if (!url || !userId) {
      return res.status(400).json({ 
        error: 'URL and userId are required' 
      });
    }

    // Check rate limit
    if (!webAnalyzerStorage.canAnalyze(userId)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Only 1 analysis per day allowed.' 
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        error: 'Invalid URL format' 
      });
    }

    // Crawl website
    const crawlData = await webCrawler.crawlWebsite(url);

    // Analyze with AI
    const analysis = await aiService.analyzeWebsite(crawlData);

    // Save to storage
    const savedEntry = webAnalyzerStorage.saveAnalysis(userId, url, analysis, crawlData);

    // Record rate limit
    webAnalyzerStorage.recordAnalysis(userId);

    res.json({
      success: true,
      analysis,
      metaData: crawlData.metaData,
      timestamp: savedEntry.timestamp
    });

  } catch (error) {
    console.error('Web analyzer error:', error);
    res.status(500).json({ 
      error: error.message || 'Analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/web-analyzer/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const history = webAnalyzerStorage.getHistory(userId, parseInt(limit));
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      error: 'Failed to get history' 
    });
  }
});

// Serve admin dashboard (must be before /api routes)
app.get('/admin', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Token Management Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in-out',
                        'slide-up': 'slideUp 0.3s ease-out',
                        'bounce-in': 'bounceIn 0.6s ease-out',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(10px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        bounceIn: {
                            '0%': { transform: 'scale(0.3)', opacity: '0' },
                            '50%': { transform: 'scale(1.05)' },
                            '70%': { transform: 'scale(0.9)' },
                            '100%': { transform: 'scale(1)', opacity: '1' },
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-7xl" x-data="adminDashboard()" x-init="loadData()">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold mb-2 text-gray-800">
                        Token Management Admin
                    </h1>
                    <p class="text-gray-600">Manage user token requests and system status</p>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-500">Last Updated</div>
                    <div class="text-gray-800 font-medium" x-text="new Date().toLocaleTimeString()"></div>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Total Users Card -->
            <div class="bg-white rounded-lg border border-gray-300 p-6">
                <div>
                    <p class="text-2xl font-bold text-gray-800" x-text="stats.totalUsers">0</p>
                    <p class="text-sm text-gray-500">Total Users</p>
                </div>
            </div>
            
            <!-- Pending Requests Card -->
            <div class="bg-white rounded-lg border border-gray-300 p-6">
                <div>
                    <p class="text-2xl font-bold text-gray-800" x-text="stats.pendingRequests">0</p>
                    <p class="text-sm text-gray-500">Pending Requests</p>
                </div>
            </div>
            
            <!-- Total Tokens Used Card -->
            <div class="bg-white rounded-lg border border-gray-300 p-6">
                <div>
                    <p class="text-2xl font-bold text-gray-800" x-text="stats.totalTokensUsed">0</p>
                    <p class="text-sm text-gray-500">Tokens Used</p>
                </div>
            </div>
        </div>

        <!-- Request Management Tabs -->
        <div class="bg-white rounded-lg border border-gray-300">
            <!-- Tab Navigation -->
            <div class="flex border-b border-gray-300">
                <button 
                    @click="activeTab = 'pending'"
                    :class="activeTab === 'pending' ? 'bg-gray-100 text-gray-800 border-b-2 border-gray-800' : 'text-gray-600 hover:text-gray-800'"
                    class="flex-1 px-6 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <i class="fas fa-clock"></i>
                    Pending Requests
                </button>
                <button 
                    @click="activeTab = 'approved'"
                    :class="activeTab === 'approved' ? 'bg-gray-100 text-gray-800 border-b-2 border-gray-800' : 'text-gray-600 hover:text-gray-800'"
                    class="flex-1 px-6 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <i class="fas fa-check-circle"></i>
                    Approved Requests
                </button>
                <button 
                    @click="activeTab = 'rejected'"
                    :class="activeTab === 'rejected' ? 'bg-gray-100 text-gray-800 border-b-2 border-gray-800' : 'text-gray-600 hover:text-gray-800'"
                    class="flex-1 px-6 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <i class="fas fa-times-circle"></i>
                    Rejected Requests
                </button>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
                <!-- Pending Requests Tab -->
                <div x-show="activeTab === 'pending'" class="space-y-4">
                    <div class="flex justify-end items-center mb-4">
                        <button @click="loadRequests()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border border-gray-300 transition-all duration-200 flex items-center gap-2">
                            <i class="fas fa-sync-alt"></i>
                            <span class="font-medium">Refresh</span>
                        </button>
                    </div>
                    
                    <div x-show="requests.length === 0" class="text-center py-8">
                        <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-inbox text-2xl text-gray-400"></i>
                        </div>
                        <p class="text-gray-500 text-lg font-medium">No pending requests</p>
                        <p class="text-gray-400 text-sm mt-1">All requests have been processed</p>
                    </div>
                    
                    <div x-show="requests.length > 0" class="space-y-4">
                        <template x-for="request in requests" :key="request.id">
                            <div class="bg-white rounded-lg border border-gray-300 p-4">
                                <div class="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p class="font-bold text-gray-800">Email:</p>
                                        <p class="text-gray-600" x-text="request.email"></p>
                                    </div>
                                    
                                    <div>
                                        <p class="font-bold text-gray-800">Reason:</p>
                                        <p class="text-gray-600" x-text="request.reason"></p>
                                    </div>
                                    
                                    <div>
                                        <p class="font-bold text-gray-800">Fingerprint:</p>
                                        <p class="text-gray-600 font-mono text-xs break-all" x-text="request.fingerprint"></p>
                                    </div>
                                </div>
                                
                                <div class="mb-4 pt-4 border-t border-gray-200">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <p class="font-bold text-gray-800 mb-2">Request ID:</p>
                                            <p class="text-gray-600 font-mono text-xs" x-text="request.id"></p>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-800 mb-2">Created:</p>
                                            <p class="text-gray-600 text-sm" x-text="new Date(request.createdAt).toLocaleString()"></p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="flex gap-2">
                                    <button 
                                        @click="approveRequest(request.id)"
                                        class="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded border border-green-300"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        @click="rejectRequest(request.id)"
                                        class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded border border-red-300"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- All Users Tab -->
                <!-- Approved Requests Tab -->
                <div x-show="activeTab === 'approved'" class="space-y-4">
                    <div class="flex justify-end items-center mb-4">
                        <button @click="loadRequests('approved')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border border-gray-300">
                            Refresh
                        </button>
                    </div>
                    
                    <div x-show="approvedRequests.length === 0" class="text-center py-8">
                        <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-check-circle text-2xl text-gray-400"></i>
                        </div>
                        <p class="text-gray-500 text-lg font-medium">No approved requests</p>
                    </div>
                    
                    <div x-show="approvedRequests.length > 0" class="space-y-4">
                        <template x-for="request in approvedRequests" :key="request.id">
                            <div class="bg-white rounded-lg border border-gray-300 p-4">
                                <div class="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p class="font-bold text-gray-800">Email:</p>
                                        <p class="text-gray-600" x-text="request.email"></p>
                                    </div>
                                    
                                    <div>
                                        <p class="font-bold text-gray-800">Reason:</p>
                                        <p class="text-gray-600" x-text="request.reason"></p>
                                    </div>
                                    
                                    <div>
                                        <p class="font-bold text-gray-800">Fingerprint:</p>
                                        <p class="text-gray-600 font-mono text-xs break-all" x-text="request.fingerprint"></p>
                                    </div>
                                </div>
                                
                                <div class="mb-4 pt-4 border-t border-gray-200">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <p class="font-bold text-gray-800 mb-2">Request ID:</p>
                                            <p class="text-gray-600 font-mono text-xs" x-text="request.id"></p>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-800 mb-2">Approved:</p>
                                            <p class="text-gray-600 text-sm" x-text="new Date(request.approvedAt).toLocaleString()"></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Rejected Requests Tab -->
                <div x-show="activeTab === 'rejected'" class="space-y-4">
                    <div class="flex justify-end items-center mb-4">
                        <button @click="loadRequests('rejected')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border border-gray-300">
                            Refresh
                        </button>
                    </div>
                    
                    <div x-show="rejectedRequests.length === 0" class="text-center py-8">
                        <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-times-circle text-2xl text-gray-400"></i>
                        </div>
                        <p class="text-gray-500 text-lg font-medium">No rejected requests</p>
                    </div>
                    
                    <div x-show="rejectedRequests.length > 0" class="space-y-4">
                        <template x-for="request in rejectedRequests" :key="request.id">
                            <div class="bg-white rounded-lg border border-gray-300 p-4">
                                <div class="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p class="font-bold text-gray-800">Email:</p>
                                        <p class="text-gray-600" x-text="request.email"></p>
                                    </div>
                                    
                                    <div>
                                        <p class="font-bold text-gray-800">Reason:</p>
                                        <p class="text-gray-600" x-text="request.reason"></p>
                                    </div>
                                    
                                    <div>
                                        <p class="font-bold text-gray-800">Fingerprint:</p>
                                        <p class="text-gray-600 font-mono text-xs break-all" x-text="request.fingerprint"></p>
                                    </div>
                                </div>
                                
                                <div class="mb-4 pt-4 border-t border-gray-200">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <p class="font-bold text-gray-800 mb-2">Request ID:</p>
                                            <p class="text-gray-600 font-mono text-xs" x-text="request.id"></p>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-800 mb-2">Rejected:</p>
                                            <p class="text-gray-600 text-sm" x-text="new Date(request.approvedAt).toLocaleString()"></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- All Users Section -->
        <div class="bg-white rounded-lg border border-gray-300 mt-6">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">All Users</h3>
                    <button @click="loadUsers()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border border-gray-300">
                        Refresh
                    </button>
                </div>
                
                <div x-show="users.length === 0" class="text-center py-8">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-users text-2xl text-gray-400"></i>
                    </div>
                    <p class="text-gray-500 text-lg font-medium">No users found</p>
                </div>
                
                <div x-show="users.length > 0" class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-300">
                                <th class="text-left py-3 px-4 font-semibold text-gray-800">
                                    <i class="fas fa-fingerprint text-gray-600 mr-2"></i>
                                    Fingerprint
                                </th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-800">
                                    <i class="fas fa-coins text-gray-600 mr-2"></i>
                                    Tokens
                                </th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-800">
                                    <i class="fas fa-chart-line text-gray-600 mr-2"></i>
                                    Used
                                </th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-800">
                                    <i class="fas fa-clock text-gray-600 mr-2"></i>
                                    Last Used
                                </th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-800">
                                    <i class="fas fa-calendar text-gray-600 mr-2"></i>
                                    Created
                                </th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-800">
                                    <i class="fas fa-inbox text-gray-600 mr-2"></i>
                                    Requests
                                </th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-800">
                                    <i class="fas fa-plus text-gray-600 mr-2"></i>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="user in users" :key="user.fingerprint">
                                <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                                    <td class="py-3 px-4 font-mono text-xs text-gray-600 break-all max-w-xs" x-text="user.fingerprint"></td>
                                    <td class="py-3 px-4 text-sm text-gray-600" x-text="user.tokensRemaining"></td>
                                    <td class="py-3 px-4 text-sm text-gray-600" x-text="user.totalUsed"></td>
                                    <td class="py-3 px-4 text-sm text-gray-600" x-text="user.lastUsed ? new Date(user.lastUsed).toLocaleDateString() : 'Never'"></td>
                                    <td class="py-3 px-4 text-sm text-gray-600" x-text="new Date(user.createdAt).toLocaleDateString()"></td>
                                    <td class="py-3 px-4 text-sm text-gray-600" x-text="user.requestCount"></td>
                                    <td class="py-3 px-4">
                                        <button 
                                            @click="addTokens(user.fingerprint)"
                                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                        >
                                            +10 Tokens
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        function adminDashboard() {
            return {
                activeTab: 'pending',
                requests: [],
                approvedRequests: [],
                rejectedRequests: [],
                users: [],
                stats: {
                    totalUsers: 0,
                    pendingRequests: 0,
                    totalTokensUsed: 0
                },

                async loadData() {
                    await Promise.all([
                        this.loadRequests('pending'),
                        this.loadRequests('approved'),
                        this.loadRequests('rejected'),
                        this.loadUsers()
                    ]);
                    this.calculateStats();
                },

                async loadAllRequests() {
                    await this.loadRequests('pending');
                    await this.loadRequests('approved');
                    await this.loadRequests('rejected');
                },

                async loadRequests(status = 'pending') {
                    try {
                        const response = await fetch('/api/admin/requests?status=' + status);
                        const data = await response.json();
                        if (data.success) {
                            if (status === 'pending') {
                                this.requests = data.requests;
                            } else if (status === 'approved') {
                                this.approvedRequests = data.requests;
                            } else if (status === 'rejected') {
                                this.rejectedRequests = data.requests;
                            }
                        }
                    } catch (error) {
                        console.error('Failed to load requests:', error);
                    }
                },

                async loadUsers() {
                    try {
                        const response = await fetch('/api/admin/users');
                        const data = await response.json();
                        if (data.success) {
                            this.users = data.users;
                        }
                    } catch (error) {
                        console.error('Failed to load users:', error);
                    }
                },

                async approveRequest(requestId) {
                    try {
                        const response = await fetch('/api/admin/requests/' + requestId + '/approve', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ approvedBy: 'admin' })
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                            this.showNotification('Request approved successfully!', 'success');
                            await this.loadAllRequests();
                            await this.loadUsers();
                            this.calculateStats();
                            // Auto switch to approved tab
                            this.activeTab = 'approved';
                        } else {
                            this.showNotification('Failed to approve request', 'error');
                        }
                    } catch (error) {
                        this.showNotification('Error approving request: ' + error.message, 'error');
                    }
                },

                async rejectRequest(requestId) {
                    try {
                        const response = await fetch('/api/admin/requests/' + requestId + '/reject', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ approvedBy: 'admin' })
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                            this.showNotification('Request rejected', 'success');
                            await this.loadAllRequests();
                            await this.loadUsers();
                            this.calculateStats();
                            // Auto switch to rejected tab
                            this.activeTab = 'rejected';
                        } else {
                            this.showNotification('Failed to reject request', 'error');
                        }
                    } catch (error) {
                        this.showNotification('Error rejecting request: ' + error.message, 'error');
                    }
                },

                async addTokens(fingerprint) {
                    try {
                        const response = await fetch('/api/admin/update-tokens', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                fingerprint: fingerprint,
                                tokens: 10
                            })
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                            this.showNotification('Added 10 tokens successfully!', 'success');
                            await this.loadUsers();
                            this.calculateStats();
                        } else {
                            this.showNotification('Failed to add tokens: ' + data.error, 'error');
                        }
                    } catch (error) {
                        this.showNotification('Error adding tokens: ' + error.message, 'error');
                    }
                },

                calculateStats() {
                    this.stats.totalUsers = this.users.length;
                    this.stats.pendingRequests = this.requests.length;
                    this.stats.totalTokensUsed = this.users.reduce((sum, user) => sum + user.totalUsed, 0);
                },

                showNotification(message, type) {
                    // Simple notification - in production, use a proper notification library
                    const notification = document.createElement('div');
                    notification.className = \`fixed top-4 right-4 p-4 rounded-lg text-white z-50 \${type === 'success' ? 'bg-green-500' : 'bg-red-500'}\`;
                    notification.textContent = message;
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 3000);
                }
            }
        }
    </script>
</body>
</html>
  `);
});

// Token management APIs
app.use('/api/token', tokenApi);

// Admin APIs
app.use('/api', adminApi);

// Crawl API endpoint
app.post('/api/crawl', async (req, res) => {
  try {
    const { url, tone, voice } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('🔍 Crawling website:', url);
    
    // Initialize crawler
    const crawler = new WebCrawler();
    
    // Crawl the website
    const crawlResult = await crawler.crawlWebsite(url);
    
    // Close crawler
    await crawler.close();
    
    console.log('✅ Website crawled successfully');
    
    // Return the crawl data
    res.json({
      success: true,
      url: url,
      tone: tone,
      voice: voice,
      timestamp: new Date().toISOString(),
      htmlComponents: crawlResult.htmlComponents,
      cssAnalysis: crawlResult.cssAnalysis,
      metaData: crawlResult.metaData
    });
    
  } catch (error) {
    console.error('❌ Crawl error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to crawl website';
    if (error.name === 'TimeoutError') {
      errorMessage = 'Website took too long to load. Please try again or check if the URL is accessible.';
    } else if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      errorMessage = 'Invalid URL or website not found. Please check the URL and try again.';
    } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      errorMessage = 'Website is not accessible. Please check if the URL is correct.';
    }
    
    res.status(500).json({ 
      error: 'Crawl failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// UX Audit with Gemini - build prompt and analyze
app.post('/api/ux-audit', async (req, res) => {
  try {
    const { url, tone, voice, targetAudience, crawlData } = req.body || {};

    if (!crawlData) {
      return res.status(400).json({ error: 'crawlData is required' });
    }

    // Helper: prune large arrays to keep prompt size manageable
    const pruneArray = (arr, limit = 50) => Array.isArray(arr) ? arr.slice(0, limit) : arr;
    const pruneSection = (section, limit = 50) => {
      if (!section) return section;
      if (Array.isArray(section)) return pruneArray(section, limit);
      // object with arrays
      const pruned = {};
      for (const key of Object.keys(section)) {
        pruned[key] = Array.isArray(section[key]) ? pruneArray(section[key], limit) : section[key];
      }
      return pruned;
    };

    const prunedHtml = {
      headings: pruneSection(crawlData.headings, 20),
      paragraphs: pruneArray(crawlData.paragraphs, 40),
      navigation: pruneSection(crawlData.navigation, 40),
      forms: pruneSection(crawlData.forms, 40),
      media: pruneSection(crawlData.media, 40),
      layout: pruneSection(crawlData.layout, 40),
      lists: pruneSection(crawlData.lists, 40),
      tables: pruneArray(crawlData.tables, 10),
    };

    const prunedCss = crawlData.cssAnalysis || {};

    const UX_AUDIT_PROMPT = `You are a UX auditor. Analyze the website data and provide a UX audit report.

INPUT DATA:
- URL: ${url}
- Tone: ${tone || 'N/A'}
- Voice: ${voice || 'N/A'}
- Target Audience: ${targetAudience || 'N/A'}

HTML DATA:
${JSON.stringify(prunedHtml, null, 2)}

CSS DATA:
${JSON.stringify(prunedCss, null, 2)}

REQUIRED OUTPUT FORMAT:
## Overall UX Quality: [Excellent / Good / Average / Poor]

#### 1. HTML Structure Analysis
[Your analysis here]

#### 2. CSS & Visual Design Analysis
[Your analysis here]

#### 3. Accessibility & Contrast Analysis
[Your analysis here]

#### 4. Interaction & Responsiveness Analysis
[Your analysis here]

#### 5. Visual Consistency Analysis
[Your analysis here]

#### 6. Performance & Load Analysis
[Your analysis here]

#### 7. Tone & Voice Analysis
[Your analysis here]

#### 8. Content Analysis
[Your analysis here]

#### 9. Final Recommendations
[Your analysis here]

CRITICAL INSTRUCTIONS:
- You MUST output exactly 9 sections numbered 1-9
- Do NOT skip any section
- Do NOT combine sections
- Follow the exact format above`;

    if (!genAI) {
      // Return error if Gemini not configured
      return res.status(502).json({
        error: 'Gemini API not configured',
        details: 'Set GEMINI_API_KEY environment variable to enable AI features'
      }
opp

    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const generationConfig = {
      temperature: 1.0,
      topP: 1.0,
      maxOutputTokens: 8192,
    };

    // Simple retry (up to 2 attempts)
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: UX_AUDIT_PROMPT }] }],
          generationConfig,
        });
        const resp = await result.response;
        return res.json({ analysis: resp.text() });
      } catch (err) {
        lastError = err;
        console.error(`Gemini UX audit attempt ${attempt} failed:`, err?.message || err);
        await new Promise(r => setTimeout(r, 400 * attempt));
      }
    }

    // If all attempts failed, return error without fallback
    return res.status(502).json({
      error: 'Model provider unavailable',
      details: process.env.NODE_ENV === 'development' ? (lastError?.message || 'provider error') : undefined,
    });
  } catch (error) {
    console.error('UX audit endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin API to update user tokens
app.post('/api/admin/update-tokens', (req, res) => {
  try {
    const { fingerprint, tokens } = req.body;
    
    if (!fingerprint || typeof tokens !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing fingerprint or invalid tokens count' 
      });
    }

    // Load current users
    const usersPath = path.join(__dirname, 'data', 'users.json');
    let users = [];
    
    if (fs.existsSync(usersPath)) {
      const usersData = fs.readFileSync(usersPath, 'utf8');
      users = JSON.parse(usersData);
    }

    // Find and update user
    const userIndex = users.findIndex(user => user.fingerprint === fingerprint);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Update tokens
    users[userIndex].tokensRemaining = tokens;
    users[userIndex].lastUpdated = new Date().toISOString();

    // Save back to file
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.json({ 
      success: true, 
      message: `Updated tokens for user ${fingerprint.substring(0, 8)}...`,
      user: users[userIndex]
    });

  } catch (error) {
    console.error('Error updating tokens:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chat API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (genAI) {
    console.log(`🤖 Gemini integration: Enabled`);
  } else {
    console.log(`🤖 Gemini integration: Disabled (set GEMINI_API_KEY to enable)`);
  }
});