import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { X, MessageCircle, Bot, User, ArrowLeft, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const presetQuestions = [
  "Who are you and what do you do?",
  "What projects have you worked on?",
  "What is your working process?",
  "What are your career goals moving forward?"
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isWelcome, setIsWelcome] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isWelcome) {
      // Add a small delay to ensure the chat window is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isWelcome]);

  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    console.log('Sending message:', text); // Debug log

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          conversationId: conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Update conversation ID if it's a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Add AI response to messages
      if (data.lastMessage) {
        const aiMessage: Message = {
          id: data.lastMessage.id,
          text: data.lastMessage.text,
          sender: 'ai',
          timestamp: new Date(data.lastMessage.timestamp)
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if this is a user story request and provide fallback
      if (isUserStoryRequest(text)) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getFallbackUserStoryResponse(text),
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fallback to mock response if API fails
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getMockResponse(text),
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to detect user story requests
  const isUserStoryRequest = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    
    // Check for new user story requests
    const newUserStoryKeywords = [
      'write', 'draft', 'create', 'generate', 'user story', 'user stories',
      'epic', 'epics', 'feature', 'flow', 'process', 'workflow'
    ];
    
    // Check for modification requests
    const modificationKeywords = [
      'modify', 'change', 'update', 'edit', 'revise', 'adjust', 'improve',
      'add more', 'expand', 'include', 'add', 'remove', 'delete', 'replace',
      'make it', 'can you', 'could you', 'please', 'instead', 'rather than',
      'more detail', 'more specific', 'clarify', 'explain', 'elaborate',
      'generate', 'create', 'one more', 'another', 'additional', 'extra',
      'more epics', 'more stories', 'another epic', 'another story'
    ];
    
    const isNewRequest = newUserStoryKeywords.some(keyword => lowerText.includes(keyword));
    const isModificationRequest = modificationKeywords.some(keyword => lowerText.includes(keyword));
    
    return isNewRequest || isModificationRequest;
  };

  // Function to get fallback user story response
  const getFallbackUserStoryResponse = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Check if this is a modification request
    const isModification = ['modify', 'change', 'update', 'edit', 'revise', 'adjust', 'improve',
                           'add more', 'expand', 'include', 'add', 'remove', 'delete', 'replace',
                           'make it', 'can you', 'could you', 'please', 'instead', 'rather than',
                           'more detail', 'more specific', 'clarify', 'explain', 'elaborate',
                           'generate', 'create', 'one more', 'another', 'additional', 'extra',
                           'more epics', 'more stories', 'another epic', 'another story'].some(keyword => lowerText.includes(keyword));
    
    if (isModification) {
      return `## Epic 1: Enhanced Feature Management

**User Story 1:** As a user, I want to modify the existing functionality, so that I can better meet my specific requirements.

### Acceptance Criteria:
- **A/C 1:** Given I want to modify the feature, when I provide specific requirements, then the system should update accordingly.
- **A/C 2:** Given I need additional functionality, when I request changes, then new features should be integrated seamlessly.
- **A/C 3:** Given I want to improve user experience, when I suggest modifications, then the interface should be enhanced.
- **A/C 4:** Given I need better performance, when I request optimizations, then the system should be more efficient.

If you are still curious about user story development or need more detailed requirements, let them contact Hoà Trương now.`;
    } else {
      // Extract feature from user message
      const featureMatch = text.match(/(?:write|draft|create|generate)?\s*(?:user story|user stories|epic|epics)?\s*(?:for)?\s*(.+)/i);
      const feature = featureMatch ? featureMatch[1].trim() : 'feature';
      
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
  };

  const getMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('who are you') || lowerQuestion.includes('what do you do')) {
      return "My name is Truong Duc Hoa, a Product Owner & Associate PM with over 5 years of experience in the tech industry. I'm known for my ability to learn fast and adapt to emerging technologies—having built 4 Web3 products and 8 AI agents from scratch in a short period of time. My goal is to drive meaningful impact through the synergy of product thinking, tech execution, and speed.";
    }
    
    if (lowerQuestion.includes('project')) {
      return `I’ve led and delivered multiple impactful projects:\n\n✳︎ 4 Web3 products: Built within 6 months, including NFT platforms and token-gated apps—fully self-taught.\n✳︎ 8 AI agents: Shipped in 3 months, covering livestream summarization, Q&A bots, and internal chat assistants.\n✳︎ Agile product delivery: Owned the end-to-end process—requirement gathering, technical estimation, release planning, writing release notes, and stakeholder demo. Tools: ClickUp, Jira.`;
    }
    
    if (lowerQuestion.includes('working process') || lowerQuestion.includes('workflow') || lowerQuestion.includes('process')) {
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
    
    if (lowerQuestion.includes('career goals') || lowerQuestion.includes('moving forward')) {
      return "I'm looking to join a vision-driven team, working on products that create real impact, where I can bridge the gap between product, engineering, and business. I want to continue exploring the potential of AI, shipping products that are not just feature-complete but user-validated, outcome-oriented, and market-ready—from idea to production.";
    }
    
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
      return "Hi! I'm Truong Duc Hoa, a Product Owner & Associate PM. How can I help you learn more about my work?";
    }
    
    return "I'm Truong Duc Hoa, a Product Owner & Associate PM with over 3 years of experience in the tech industry. I'm known for my ability to learn fast and adapt to emerging technologies. What specific aspect of my work would you like to know more about?";
  };

  const handlePresetQuestion = (question: string) => {
    console.log('Preset question clicked:', question); // Debug log
    setIsWelcome(false);
    // Use setTimeout to ensure state update happens before sending message
    setTimeout(() => {
      handleSendMessage(question);
    }, 0);
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsWelcome(true);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsWelcome(true);
    setMessages([]);
    setConversationId(null);
  };

  // --- UI ---
  return (
    <>
      {/* Floating Chat Bubble (always visible) */}
      <div
        className="fixed bottom-6 right-6 z-50"
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border border-[rgba(223,223,223,0.53)] backdrop-blur-[5.9px] bg-[rgba(223,223,223,0.44)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200 ${isOpen ? 'rotate-90' : ''}`}
          style={{
            boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
            WebkitBackdropFilter: 'blur(5.9px)',
            backdropFilter: 'blur(5.9px)',
            transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
          }}
        >
          <span className="transition-all duration-300 flex items-center justify-center">
            {isOpen ? (
              <X className="w-7 h-7 text-primary transition-all duration-300 scale-100" />
            ) : (
              <MessageCircle fill="currentColor" className="w-7 h-7 text-primary transition-all duration-300 scale-100" />
            )}
          </span>
        </button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div
          className="fixed z-50 w-96 h-[500px] rounded-2xl flex flex-col overflow-hidden"
          style={{
            bottom: '104px', // 56px (bubble) + 24px gap
            right: '24px',
            background: 'rgba(223, 223, 223, 0.44)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(5.9px)',
            WebkitBackdropFilter: 'blur(5.9px)',
            border: '1px solid rgba(223, 223, 223, 0.53)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 rounded-t-lg flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Back button only when not on welcome screen */}
              {!isWelcome && (
                <button
                  onClick={() => setIsWelcome(true)}
                  className="mr-2 p-1 rounded hover:bg-muted transition-colors"
                  aria-label="Back to welcome"
                >
                  <ArrowLeft className="w-5 h-5 text-primary" />
                </button>
              )}
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Everything About Me</span>
            </div>
            {/* X button for closing chat */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {isWelcome ? (
              /* Welcome Screen */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Hi! I'm Truong Duc Hoa
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Ask me anything about my experience, projects, or career goals.
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
                {/* Reduced bottom margin from mb-8 to mb-6 */}
              </div>
            ) : (
              /* Chat Window */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`w-[85%] rounded-lg p-4 ${
                          message.sender === 'user'
                            ? 'bg-gray-300 text-gray-800'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-start gap-3 w-full">
                          {message.sender === 'ai' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1 overflow-hidden prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-foreground border-b border-border pb-1" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-3 mb-2 text-foreground" {...props} />,
                                h4: ({node, ...props}) => <h4 className="text-sm font-medium mt-2 mb-1 text-foreground" {...props} />,
                                p: ({node, ...props}) => <p className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-wrap-anywhere w-full mb-2" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-2" {...props} />,
                                li: ({node, ...props}) => <li className="text-sm leading-relaxed" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                                em: ({node, ...props}) => <em className="italic" {...props} />,
                                hr: ({node, ...props}) => <hr className="my-3 border-border" {...props} />,
                                table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 my-4" {...props} />,
                                thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                                tbody: ({node, ...props}) => <tbody {...props} />,
                                tr: ({node, ...props}) => <tr className="border-b border-gray-300" {...props} />,
                                th: ({node, ...props}) => <th className="border border-gray-300 px-3 py-2 text-left font-semibold align-top" {...props} />,
                                td: ({node, ...props}) => <td className="border border-gray-300 px-3 py-2 text-left align-top" {...props} />
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                          {message.sender === 'user' && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoading && inputValue.trim()) {
                          handleSendMessage(inputValue);
                        }
                      }}
                      placeholder="Ask me anything..."
                      className="flex-1 transition-all duration-200 border border-border outline-none focus:outline-none focus:border-none focus:ring-0 focus:shadow-none active:border-none active:ring-0 caret-blue-500 caret-2"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={isLoading || !inputValue.trim()}
                      size="sm"
                      className="px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
} 