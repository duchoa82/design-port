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

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
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
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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