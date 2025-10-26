import { useState, useRef, useEffect } from "react";
import { Send, ChefHat, User, Bot, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

// Feedback Component
const FeedbackComponent = ({ messageId, sessionId, messageText }) => {
  const [feedback, setFeedback] = useState(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitFeedback = async (feedbackType, commentText = '') => {
    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        message_id: messageId,
        session_id: sessionId,
        is_helpful: feedbackType === 'positive',   // FastAPI expects boolean
        comment: commentText
      };
      const response = await fetch("http://localhost:8080/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        console.log('Feedback submitted successfully');
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackClick = async (type) => {
    if (isSubmitted) return;
    
    setFeedback(type);
    
    if (!showComment) {
      await submitFeedback(type);
    }
  };

  const handleCommentSubmit = async () => {
    if (feedback) {
      await submitFeedback(feedback, comment);
      setShowComment(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg mt-2">
        <span>✓ Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="mt-3 p-2 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-600">Was this helpful?</span>
        
        <button
          onClick={() => handleFeedbackClick('positive')}
          disabled={isSubmitting}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
            feedback === 'positive'
              ? 'bg-green-100 text-green-700'
              : 'bg-white hover:bg-green-50 text-gray-600 hover:text-green-600'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsUp className="w-3 h-3" />
          <span>Yes</span>
        </button>

        <button
          onClick={() => handleFeedbackClick('negative')}
          disabled={isSubmitting}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
            feedback === 'negative'
              ? 'bg-red-100 text-red-700'
              : 'bg-white hover:bg-red-50 text-gray-600 hover:text-red-600'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ThumbsDown className="w-3 h-3" />
          <span>No</span>
        </button>

        <button
          onClick={() => setShowComment(!showComment)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors text-xs"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Comment</span>
        </button>
      </div>

      {showComment && (
        <div className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more..."
            className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <button
            onClick={handleCommentSubmit}
            className="px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-xs"
          >
            Send
          </button>
        </div>
      )}

      {isSubmitting && (
        <div className="text-xs text-gray-500 mt-1">Submitting...</div>
      )}
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef(null);

  // Generate a session ID when component mounts
  useEffect(() => {
    setSessionId(Date.now().toString() + Math.random().toString(36).substr(2, 9));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    setMessages([...messages, { role: "user", text: userMessage, id: messageId }]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Use the n8n chat trigger endpoint
      const res = await fetch("http://localhost:5678/webhook/f5e289b6-4914-4c86-ade9-b5a99970a807/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          chatInput: userMessage,
          sessionId: sessionId,
          messageId: messageId,
        }),
      });
      
      const data = await res.json();
      console.log("Response from n8n:", data);
            
      // Handle different response formats from n8n chat trigger
      let botResponse = "";
      console.log(data)
      if (data.success) {
        if (data.type === "recipe_suggestions" && data.recipes) {
          botResponse = "Here are some recipe suggestions:\n\n" + 
            data.recipes.map((recipe, index) => {
              // Split ingredients string into array if it's a string
              let ingredients = recipe.ingredients;
              if (typeof ingredients === 'string') {
                ingredients = ingredients.split(',').map(ing => ing.trim());
              }
              
              return `${index + 1}. ${recipe.name}\nIngredients:\n${
                ingredients.map(ing => `- ${ing}`).join('\n')
              }`;
            }).join('\n\n');
            
        } else if (data.type === "ingredient_substitutes" && data.substitutes) {
          botResponse = `Here are some substitutes for your ingredient:\n\n${
            data.substitutes.map((sub, index) => `${index + 1}. ${sub}`).join('\n')
          }`;
        } else {
          botResponse = JSON.stringify(data, null, 2);
        }
      } else {
        botResponse = data.output || "Sorry, I couldn't process your request.";
      }
      
      const botMessageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setMessages(m => [...m, { 
        role: "bot", 
        text: botResponse, 
        id: botMessageId 
      }]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setMessages(m => [...m, { 
        role: "bot", 
        text: "Sorry, there was an error processing your request. Please try again.",
        id: errorMessageId
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={index} className="font-semibold text-gray-800 mt-3 mb-1">
            {line.slice(2, -2)}
          </div>
        );
      } else if (line.startsWith('â€¢ ')) {
        return (
          <div key={index} className="ml-4 text-gray-700 mb-1">
            {line}
          </div>
        );
      } else if (line.trim()) {
        return (
          <div key={index} className="mb-1">
            {line}
          </div>
        );
      } else {
        return <div key={index} className="h-2"></div>;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-semibold">Food Assistant</h1>
              <p className="text-orange-100 text-sm">Find recipes & ingredient substitutes</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Welcome to Food Assistant!</p>
              <p className="text-sm">Ask me about recipes or ingredient substitutes to get started.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={message.id || index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className={`max-w-xs lg:max-w-md ${
                message.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'
              }`}>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-sm' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {message.role === 'user' ? (
                    <p className="text-sm">{message.text}</p>
                  ) : (
                    <div className="text-sm">
                      {formatMessage(message.text)}
                    </div>
                  )}
                </div>
                
                {/* Add feedback component only for bot messages */}
                {message.role === 'bot' && (
                  <FeedbackComponent 
                    messageId={message.id}
                    sessionId={sessionId}
                    messageText={message.text}
                  />
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about recipes or ingredient substitutes..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};