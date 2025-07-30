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
  "What are you most proud of?",
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
      
      // Fallback to mock response if API fails
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getMockResponse(text),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
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
    
    if (lowerQuestion.includes('achievement') || lowerQuestion.includes('proud')) {
      return `I'm most proud of my ability to **learn fast, think systematically**, and build products from zero to market success.\n\nI applied the **Job-to-be-done** framework and a **data-driven** approach to developing a product from scratch—starting from ideation, building the MVP, gathering user insights, and continuously iterating based on real user data.\n\n> By **2024**, the product had become the **#1 in its market** segment.`;
    }
    
    if (lowerQuestion.includes('career goals') || lowerQuestion.includes('moving forward')) {
      return "I'm looking to join a vision-driven team, working on products that create real impact, where I can bridge the gap between product, engineering, and business. I want to continue exploring the potential of AI, shipping products that are not just feature-complete but user-validated, outcome-oriented, and market-ready—from idea to production.";
    }
    
    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
      return "Hi! I'm Truong Duc Hoa, a Product Owner & Associate PM. How can I help you learn more about my work?";
    }
    
    return "I'm Truong Duc Hoa, a Product Owner & Associate PM with over 5 years of experience in the tech industry. I'm known for my ability to learn fast and adapt to emerging technologies. What specific aspect of my work would you like to know more about?";
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
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-start gap-3 w-full">
                          {message.sender === 'ai' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <ReactMarkdown
                              components={{
                                p: ({node, ...props}) => <p className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-wrap-anywhere w-full" {...props} />
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