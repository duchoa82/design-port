import React, { useState, useRef, useEffect } from "react";
import { Bot, User, ArrowLeft, Send, Brain, RotateCcw, X, StopCircle, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";

const presetQuestions = [
  "Who are you and what do you do?",
  "What projects have you worked on?",
  "What are you most proud of?",
  "What are your career goals moving forward?",
  "Write me the user stories."
];

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function RecruiterPlayground() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWelcome, setIsWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [streamingIndex, setStreamingIndex] = useState<number>(0);
  const [awaitingUserStory, setAwaitingUserStory] = useState(false);
  // Add new state for streaming the system prompt
  const [streamingSystemPrompt, setStreamingSystemPrompt] = useState<string | null>(null);
  const [systemPromptIndex, setSystemPromptIndex] = useState<number>(0);
  // Add a ref to keep track of the streaming timeout
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldStopStreamingRef = useRef<boolean>(false);
  const [pendingStrengthsOrWeakness, setPendingStrengthsOrWeakness] = useState<null | 'strengths' | 'weaknesses'>(null);
  const [pendingCVDownload, setPendingCVDownload] = useState<boolean>(false);

  const userStoryKeywords = [
    'flow', 'feature', 'function', 'screen', 'module', 'checkout', 'login', 'dashboard', 'onboarding',
    'password', 'forgot', 'reset', 'signup', 'register', 'profile', 'settings', 'payment', 'order',
    'search', 'filter', 'upload', 'download', 'share', 'comment', 'like', 'follow', 'notification',
    'message', 'chat', 'email', 'report', 'analytics', 'admin', 'user management', 'permission',
    'authentication', 'authorization', 'security', 'privacy', 'data', 'export', 'import', 'sync',
    'backup', 'restore', 'migration', 'integration', 'api', 'webhook', 'cron', 'scheduler', 'queue',
    'workflow', 'process', 'approval', 'review', 'publish', 'draft', 'version', 'history', 'audit',
    'billing', 'subscription', 'plan', 'tier', 'upgrade', 'downgrade', 'cancel', 'refund', 'invoice',
    'support', 'help', 'faq', 'documentation', 'guide', 'tutorial', 'training', 'onboard', 'welcome'
  ];
  const isLikelyUserStory = (text: string) =>
    userStoryKeywords.some(word => text.toLowerCase().includes(word));

  const [pendingUserStoryFeature, setPendingUserStoryFeature] = useState<string | null>(null);

  const strengthsMarkdown = `### **Strengths**\n\n-   **Quick learner, hands-on mindset**: Taught myself and built 4 Web3 products in 6 months, then developed 8 AI agents in just 3 months – all starting from zero.\n-   **Systematic thinker**: Able to break down vague ideas into clear, structured workflows. Good at bridging technical and non-technical teams.\n-   **Self-aware & persistent**: I know my strengths and weaknesses, and I’m willing to adapt and grow rather than just follow trends or short-term hype.`;

  const weaknessesMarkdown = `### **Weaknesses**\n\n-   **Tend to go too fast, too hard**: I often push myself at a high pace, which can lead to burnout. Currently learning how to balance energy and maintain momentum sustainably.\n-   **Past struggles with team stability**: I've been through team breakups and projects that didn’t last. These experiences taught me to choose collaborators and missions more carefully.\n-   **Easily influenced by trends (FOMO)**: Sometimes I get too caught up in what’s new or trending. I’m now focusing more on long-term value and staying grounded.\n-   **Perfectionist mindset**: I tend to over-polish things, even when it's not necessary, which can slow me down. I'm working on knowing when “good enough” is truly enough.`;

  useEffect(() => {
    if (!isWelcome) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isWelcome]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const getMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    // Contact info
    if (
      lowerQuestion.includes("contact") ||
      lowerQuestion.includes("email") ||
      lowerQuestion.includes("phone") ||
      lowerQuestion.includes("linkedin")
    ) {
      return `**Email:** duchoa201093@gmail.com  \n**Phone:** (084) 939-639-831  \n**Linked:** [@hoatruong1993](https://www.linkedin.com/in/hoatruong1993/)`;
    }

    // CV/Resume detection
    if (
      lowerQuestion.includes("cv") ||
      lowerQuestion.includes("resume") ||
      lowerQuestion.includes("curriculum vitae") ||
      lowerQuestion.includes("download") ||
      lowerQuestion.includes("pdf") ||
      lowerQuestion.includes("document")
    ) {
      setPendingCVDownload(true);
      return `I have my CV available! Would you like me to provide you with a download link for my resume?`;
    }

    // Dehe meaning
    if (lowerQuestion.includes("dehe")) {
      return `This is the name of Đức Hoà, translated to Chinese.`;
    }

    // Strengths/weaknesses logic
    const hasStrength = lowerQuestion.includes("strength");
    const hasWeakness = lowerQuestion.includes("weakness") || lowerQuestion.includes("improve") || lowerQuestion.includes("area to improve");
    if (hasStrength && hasWeakness) {
      setPendingStrengthsOrWeakness(null);
      return `${strengthsMarkdown}\n\n${weaknessesMarkdown}`;
    } else if (hasStrength) {
      setPendingStrengthsOrWeakness('weaknesses');
      return strengthsMarkdown;
    } else if (hasWeakness) {
      setPendingStrengthsOrWeakness('strengths');
      return weaknessesMarkdown;
    }

    if (lowerQuestion.includes("who are you") || lowerQuestion.includes("what do you do")) {
      return `My name is **Trương Đức Hoà** -  a Product Owner & Associate PM with over 5 years of experience in the tech industry.\n\nI'm known for my ability to **learn fast** and adapt to emerging technologies, having **built 4 Web3 products and 8 AI agents** from scratch in a short period.\n\nMy goal is to drive meaningful impact through the synergy of product thinking, tech execution, and speed.`;
    }
    if (lowerQuestion.includes("project")) {
      return `I’ve led and delivered multiple impactful projects, but highlighted:\n\n**4 Web3 products**: Built within 6 months, including NFT platforms and token-gated apps—fully self-taught.\n\n**8 AI agents**: Shipped in 3 months, covering livestream summarization, Q&A bots, and internal chat assistants.`;
    }
    if (lowerQuestion.includes("achievement") || lowerQuestion.includes("proud")) {
      return `I'm most proud of my ability to **learn fast, think systematically**, and build products from zero to market success.\n\nI applied the **Job-to-be-done** framework and a **data-driven** approach to developing a product from scratch—starting from ideation, building the MVP, gathering user insights, and continuously iterating based on real user data.\n\n> By **2024**, the product had become the **#1 in its market** segment.`;
    }
    if (lowerQuestion.includes("career goals") || lowerQuestion.includes("moving forward")) {
      return `I'm looking to join a **vision-driven team**, working on products that **create real impact**, where I can bridge the gap between product, engineering, and business.\n\nI want to continue **exploring the potential of AI**, **shipping** products that are not just **feature-complete but user-validated**, outcome-oriented, and market-ready—from idea to production.`;
    }
    if (lowerQuestion.includes("hello") || lowerQuestion.includes("hi")) {
      return "Hi! I'm Truong Duc Hoa, a Product Owner & Associate PM. How can I help you learn more about my work?";
    }
    if (
      lowerQuestion.includes("working process") ||
      lowerQuestion.includes("work process") ||
      lowerQuestion.includes("workflow") ||
      lowerQuestion.includes("how do you work")
    ) {
      return `## My Working Process\n\n### 1. Requirement Collection\n\nGather inputs from multiple sources: chats, direct discussions, Figma files (for business/technical changes), and written feedback. Focus on identifying core needs and clarifying business goals.\n\n### 2. Technical Research & Estimation\n\nRun technical feasibility checks in parallel with wireframe discussions. Collaborate with dev lead and designer to estimate total effort and refine implementation direction.\n\n### 3. Release Planning\n\nPrioritize key and blocking features first, followed by low-effort quick wins. Group features by epic and align them with the current sitemap for structured releases.\n\n### 4. Design – Development – QC\n\nOnce stakeholders approve, the team proceeds with design, development, and QA on the dev environment. I write the release notes and define key tracking metrics.\n\n### 5. Demo & Release\n\nConduct staging demo when the system is stable and bug-free. Final fixes and prioritized feedback are applied before deploying to production and closing the sprint.\n\n----------\n\n### Internal Feedback Loop\n\n**With stakeholders:** I organize focused Q&A sessions (critical questioning) to clarify expectations and align features with business value.\n    \n**With dev & design:** Translate requirements into technical terms, gather feedback, and run solution brainstorms across roles.`;
    }
    // Out-of-scope fallback
    return "Hmm...looks like your message is a bit out of my scope. In this case, Hoà trained me to say no first — but don’t worry, I’ll check with him and get back to you soon.";
  };

  async function fetchUserStoryFromAPI(feature: string): Promise<string> {
    try {
      const response = await fetch('https://your-app-name.railway.app/api/user-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feature }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.userStory;
    } catch (error) {
      console.error('Error fetching user story:', error);
      
      // Fallback response if API fails
      return `## Epic 1: ${feature.charAt(0).toUpperCase() + feature.slice(1)} Feature

**User Story 1:** As a user, I want to ${feature.toLowerCase()}, so that I can achieve my desired outcome efficiently.

### Acceptance Criteria:
**A/C 1:** Given I am on the ${feature} page, when I perform the main action, then I should see the expected result.
**A/C 2:** Given I encounter an error during ${feature}, when the system fails, then I should see a helpful error message.
**A/C 3:** Given I want to customize my ${feature} experience, when I access settings, then I can modify preferences.
**A/C 4:** Given I need help with ${feature}, when I look for assistance, then I can find relevant documentation or support.`;
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setStreamingText(null);
    setStreamingIndex(0);

    // Intent detection for user story requests
    const userStoryMatch = text.match(/(?:write|draft)?\s*user story for (.+)/i);
    if (userStoryMatch && userStoryMatch[1]) {
      const feature = userStoryMatch[1].trim();
      const aiText = await fetchUserStoryFromAPI(feature);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setStreamingText(aiText);
      setStreamingIndex(0);
      setIsLoading(false);
      return;
    }

    // New: If likely a user story but not explicit, ask for confirmation
    if (isLikelyUserStory(text) && !awaitingUserStory) {
      setPendingUserStoryFeature(text.trim());
      setIsLoading(false);
      return;
    }

    if (awaitingUserStory) {
      const aiText = await fetchUserStoryFromAPI(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setStreamingText(aiText);
      setStreamingIndex(0);
      setAwaitingUserStory(false);
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const aiText = getMockResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setStreamingText(aiText);
      setStreamingIndex(0);
    }, 1200);
  };

  // Typing effect for AI streaming
  useEffect(() => {
    if (streamingText === null || shouldStopStreamingRef.current) {
      if (streamingTimeoutRef.current) clearTimeout(streamingTimeoutRef.current);
      shouldStopStreamingRef.current = false;
      return;
    }
    if (streamingIndex < streamingText.length) {
      streamingTimeoutRef.current = setTimeout(() => {
        if (shouldStopStreamingRef.current) return;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: streamingText.slice(0, streamingIndex + 1),
          };
          return updated;
        });
        setStreamingIndex((i) => i + 1);
      }, 4); // 4ms per character (even faster)
      return () => {
        if (streamingTimeoutRef.current) clearTimeout(streamingTimeoutRef.current);
      };
    } else {
      setIsLoading(false);
      setStreamingText(null);
      setStreamingIndex(0);
    }
  }, [streamingText, streamingIndex]);

  // Add useEffect for streaming the system prompt
  useEffect(() => {
    if (streamingSystemPrompt === null || shouldStopStreamingRef.current) {
      shouldStopStreamingRef.current = false;
      return;
    }
    if (systemPromptIndex < streamingSystemPrompt.length) {
      const timeout = setTimeout(() => {
        if (shouldStopStreamingRef.current) return;
        setSystemPromptIndex((prev) => prev + 1);
      }, 12); // Fast typing effect
      return () => clearTimeout(timeout);
    }
    // When streaming is done, add the full message to messages and set awaitingUserStory
    if (systemPromptIndex === streamingSystemPrompt.length) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: streamingSystemPrompt,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      setStreamingSystemPrompt(null);
      setSystemPromptIndex(0);
      setAwaitingUserStory(true);
    }
  }, [streamingSystemPrompt, systemPromptIndex]);

  // Add a function to stop streaming and finalize the message
  const handleStopStreaming = () => {
    shouldStopStreamingRef.current = true;
    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current);
    }
    if (streamingText !== null) {
      setStreamingText(null);
      setStreamingIndex(0);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: streamingText,
          };
        }
        return updated;
      });
      setIsLoading(false);
    }
    // Also stop system prompt streaming
    if (streamingSystemPrompt !== null) {
      setStreamingSystemPrompt(null);
      setSystemPromptIndex(0);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: streamingSystemPrompt,
          };
        }
        return updated;
      });
    }
  };

  // Handler for Yes/No buttons
  const handleUserStoryConfirmation = async (yes: boolean) => {
    if (yes && pendingUserStoryFeature) {
      setPendingUserStoryFeature(null);
      setIsLoading(true);
      const aiText = await fetchUserStoryFromAPI(pendingUserStoryFeature);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setStreamingText(aiText);
      setStreamingIndex(0);
      setIsLoading(false);
    } else {
      // When user clicks No, predict with local data
      const feature = pendingUserStoryFeature;
      setPendingUserStoryFeature(null);
      setIsLoading(true);
      
      setTimeout(() => {
        const aiText = getMockResponse(feature || "");
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setStreamingText(aiText);
        setStreamingIndex(0);
      }, 1200);
    }
  };

  // Handler for Yes/No follow-up for strengths/weaknesses
  const handleStrengthsOrWeaknessFollowup = (yes: boolean) => {
    if (yes && pendingStrengthsOrWeakness) {
      const aiText = pendingStrengthsOrWeakness === 'strengths' ? strengthsMarkdown : weaknessesMarkdown;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setStreamingText(aiText);
      setStreamingIndex(0);
      setPendingStrengthsOrWeakness(null);
    } else {
      setPendingStrengthsOrWeakness(null);
    }
  };

  // Handler for CV download confirmation
  const handleCVDownloadConfirmation = (yes: boolean) => {
    if (yes) {
      // Trigger CV download
      const link = document.createElement('a');
      link.href = '/Hoa Truong - CV.pdf';
      link.download = 'Hoa Truong - CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Perfect! I've initiated the download of my CV. You should see the file 'Hoa Truong - CV.pdf' downloading to your device. Let me know if you need anything else!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } else {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "No problem! You can also view my detailed CV on my [Profile page](/profile) if you prefer to read it online first.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }
    setPendingCVDownload(false);
  };

  const handlePresetQuestion = (question: string) => {
    setIsWelcome(false);
    if (question === "Write me the user stories.") {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: question,
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      setStreamingSystemPrompt(
        "Tell me what feature you want to build (e.g. login, checkout), I’ll draft a user story with acceptance criteria for you."
      );
      setSystemPromptIndex(0);
      // Don't set awaitingUserStory here; do it after streaming is done
    } else {
      setTimeout(() => {
        handleSendMessage(question);
      }, 0);
    }
  };

  return (
    <section className="py-20 bg-background" data-section="recruiter-playground">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-4"> {/* Reduced from mb-12 to mb-4 for tighter spacing */}
          <h2 className="text-3xl md:text-4xl font-light mb-2"> {/* Reduced mb-6 to mb-2 */}
            <span className="font-medium">Recruiter</span> Playground
          </h2>
          {/* Removed description */}
        </div>
        <div className="relative flex justify-center mt-0"> {/* Remove or reduce mt-8/mt-6 if present */}
          {/* Pastel gradient circles background, now inside container */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-blue-300 opacity-30 blur-3xl" />
            <div className="absolute top-32 -right-20 w-56 h-56 rounded-full bg-yellow-200 opacity-40 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-purple-300 opacity-30 blur-3xl" />
          </div>
          <div
            className="w-full h-[540px] rounded-2xl flex flex-col overflow-hidden relative z-10"
            style={{
              background: "rgba(223, 223, 223, 0.44)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(5.9px)",
              WebkitBackdropFilter: "blur(5.9px)",
              border: "1px solid rgba(223, 223, 223, 0.53)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 rounded-t-lg flex-shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground font-light">
                  Dehe: Hoà's Sidekick
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsWelcome(true);
                  setMessages([]);
                }}
                className="p-2 rounded hover:bg-muted transition-colors"
                aria-label="Refresh chat"
              >
                <RotateCcw className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            {/* Chat Content */}
            <div className="flex-1 flex flex-col min-h-0">
              {isWelcome ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    Hi! I'm Dehe, powered by AI and his brain.
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Ask me anything about his experience, projects, career goals, or quick test with a user story brief.
                  </p>
                  {/* Preset Questions */}
                  <div className="w-full space-y-3 mb-4">
                    {presetQuestions.map((question, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePresetQuestion(question)}
                        className="w-full p-4 text-sm leading-relaxed break-words rounded-md bg-background border border-border cursor-pointer transition-shadow duration-200 text-left hover:shadow-[0_4px_24px_rgba(96,165,250,0.25)]"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    ref={chatContentRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
                  >
                    {messages.map((msg, idx) => (
                      <div key={msg.id + idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-2`}>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[85%] w-auto min-w-0 inline-block whitespace-pre-wrap break-words ${
                            msg.sender === "user"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-muted text-foreground mr-auto"
                          }`}
                          style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                        >
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-1" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-0" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-0 leading-relaxed" {...props} />,
                              a: ({node, ...props}) => (
                                <a 
                                  {...props} 
                                  className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {/* Streaming system prompt effect */}
                    {streamingSystemPrompt && (
                      <div className="flex justify-start mb-2">
                        <div className="rounded-lg px-4 py-2 max-w-[85%] w-auto min-w-0 inline-block whitespace-pre-wrap break-words bg-muted text-foreground mr-auto" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-1" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-0" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-0 leading-relaxed" {...props} />,
                              a: ({node, ...props}) => (
                                <a 
                                  {...props} 
                                  className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                            }}
                          >
                            {streamingSystemPrompt.slice(0, systemPromptIndex)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {pendingUserStoryFeature && (
                      <div className="flex justify-start mb-2">
                        <div className="rounded-lg px-4 py-2 max-w-[85%] w-auto min-w-0 inline-block whitespace-pre-wrap break-words bg-muted text-foreground mr-auto">
                          <div className="mb-2">Looks like you're trying to create a new user story for <span className="font-semibold">"{pendingUserStoryFeature}"</span>. Would you like to proceed?</div>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 text-sm rounded-[10px] bg-black text-white hover:bg-neutral-800 transition-colors"
                              style={{ minWidth: 56 }}
                              onClick={() => handleUserStoryConfirmation(true)}
                            >
                              Yes
                            </button>
                            <button
                              className="px-3 py-1 text-sm rounded-[10px] border border-neutral-400 text-neutral-800 bg-transparent hover:bg-neutral-100 transition-colors"
                              style={{ minWidth: 56 }}
                              onClick={() => handleUserStoryConfirmation(false)}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {pendingStrengthsOrWeakness && streamingText === null && (
                      <div className="flex justify-start mb-2">
                        <div className="rounded-lg px-4 py-2 max-w-[85%] w-auto min-w-0 inline-block whitespace-pre-wrap break-words bg-muted text-foreground mr-auto">
                          <div className="mb-2">
                            {pendingStrengthsOrWeakness === 'strengths'
                              ? 'Would you like to know about my strengths?'
                              : 'Would you like to know about my weaknesses?'}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 text-sm rounded-[10px] bg-black text-white hover:bg-neutral-800 transition-colors"
                              style={{ minWidth: 56 }}
                              onClick={() => handleStrengthsOrWeaknessFollowup(true)}
                            >
                              Yes
                            </button>
                            <button
                              className="px-3 py-1 text-sm rounded-[10px] border border-neutral-400 text-neutral-800 bg-transparent hover:bg-neutral-100 transition-colors"
                              style={{ minWidth: 56 }}
                              onClick={() => handleStrengthsOrWeaknessFollowup(false)}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {pendingCVDownload && streamingText === null && (
                      <div className="flex justify-start mb-2">
                        <div className="rounded-lg px-4 py-2 max-w-[85%] w-auto min-w-0 inline-block whitespace-pre-wrap break-words bg-muted text-foreground mr-auto">
                          <div className="mb-2">Would you like me to download my CV for you?</div>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 text-sm rounded-[10px] bg-black text-white hover:bg-neutral-800 transition-colors"
                              style={{ minWidth: 56 }}
                              onClick={() => handleCVDownloadConfirmation(true)}
                            >
                              Yes
                            </button>
                            <button
                              className="px-3 py-1 text-sm rounded-[10px] border border-neutral-400 text-neutral-800 bg-transparent hover:bg-neutral-100 transition-colors"
                              style={{ minWidth: 56 }}
                              onClick={() => handleCVDownloadConfirmation(false)}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {isLoading && !streamingText && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-4 max-w-[85%]">
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4" />
                            <span className="text-sm text-muted-foreground font-medium">Thinking</span>
                            <div className="flex space-x-1 ml-1">
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Input area */}
                  <div className="flex items-end gap-2 p-4 border-t border-border bg-muted/50 rounded-b-lg">
                    <textarea
                      ref={inputRef as any}
                      className="flex-1 resize-none min-h-[40px] max-h-32 rounded-lg px-4 py-2 bg-background border border-border focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground"
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => {
                        if (streamingText !== null) handleStopStreaming();
                        setInputValue(e.target.value);
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (streamingText !== null) handleStopStreaming();
                          if (inputValue.trim()) {
                            await handleSendMessage(inputValue);
                          }
                        }
                      }}
                      rows={1}
                      disabled={isLoading && !streamingText}
                      style={{ minHeight: 40, maxHeight: 128, overflow: 'auto' }}
                    />
                    {streamingText !== null ? (
                      <button
                        type="button"
                        onClick={handleStopStreaming}
                        className="p-2 rounded-full bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center"
                        aria-label="Stop streaming"
                      >
                        <Square className="w-5 h-5 text-primary-foreground fill-primary-foreground" fill="currentColor" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          if (inputValue.trim()) {
                            await handleSendMessage(inputValue);
                          }
                        }}
                        className="p-2 rounded-full bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center"
                        aria-label="Send message"
                        disabled={isLoading && !streamingText}
                      >
                        <Send className="w-5 h-5 text-primary-foreground" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 