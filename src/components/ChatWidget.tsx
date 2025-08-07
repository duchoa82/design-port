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

    // ChatWidget ONLY uses local responses - NEVER calls Railway API
    console.log('🔍 ChatWidget: Using local response for all questions');
    setTimeout(() => {
      const aiText = getMockResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };



  const getMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('who are you') || lowerQuestion.includes('what do you do')) {
      return "My name is **Trương Đức Hoà** - a Product Owner & Associate PM with over 3 years of experience in the tech industry.\n\nMy goal is to drive meaningful impact through the synergy of product thinking, tech execution, and speed.\n\nI'm known for my ability to **learn fast** and adapt to emerging technologies, having **built 4 Web3 products and 8 AI agents** from scratch in a short period.";
    }
    
    if (lowerQuestion.includes('project')) {
      return `I've led and delivered multiple impactful projects, but highlighted:\n\n**4 Web3 products**: Built within 6 months, including NFT platforms and token-gated apps—fully self-taught.\n\n**8 AI agents**: Shipped in 3 months, covering livestream summarization, Q&A bots, and internal chat assistants.`;
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
      return "I'm looking to join a **vision-driven team**, working on products that **create real impact**, where I can bridge the gap between product, engineering, and business.\n\nI want to continue **exploring the potential of AI**, **shipping** products that are not just **feature-complete but user-validated**, outcome-oriented, and market-ready—from idea to production.";
    }
    
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
      return "Hi! I'm Truong Duc Hoa, a Product Owner & Associate PM. How can I help you learn more about my work?";
    }
    
    if (lowerQuestion.includes('strength') || lowerQuestion.includes('weakness')) {
      return `### **Strengths**
- **Fast learner, hands-on**: Built 4 Web3 products in 6 months, 8 AI agents in 3 months—all self-taught.
- **Structured thinker**: Good at turning vague ideas into clear workflows and bridging tech & business.
- **Self-aware & adaptive**: Understands own limits, prefers long-term growth over chasing hype.

### **Weaknesses**
- **Overdrive mode**: Tends to go too fast, risking burnout—learning to pace better.
- **Team instability**: Past failed teams taught the importance of choosing the right people and missions.
- **FOMO-driven**: Used to chase trends—now shifting focus to long-term impact.
- **Perfectionist**: Sometimes over-polishes—learning to ship when it's "good enough."`;
    }
    
    return "This is out of my knowledge about Hoà.\n\nI'm designed to answer questions about Hoà Trương's experience, projects, career goals, and work process.\n\nFeel free to ask me about my background, projects, or professional journey!";
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
        className="fixed bottom-6 right-6 z-50 sm:bottom-6 sm:right-6"
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border border-[rgba(255,255,255,0.3)] backdrop-blur-[8.7px] bg-[rgba(255,255,255,0.39)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200 ${isOpen ? 'rotate-90' : ''}`}
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
            WebkitBackdropFilter: 'blur(8.7px)',
            backdropFilter: 'blur(8.7px)',
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
            background: 'rgba(255, 255, 255, 0.39)',
            borderRadius: '16px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8.7px)',
            WebkitBackdropFilter: 'blur(8.7px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
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