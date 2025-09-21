import { useState, useRef, useEffect } from "react";
import { Send, ChefHat, User, Bot } from "lucide-react";

export default function App() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setMessages([...messages, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);
    
    try {
      const res = await fetch("http://localhost:5678/webhook/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await res.json();
      console.log("Response from n8n:", data);
      
      let botResponse = "";
      if (data.success) {
        if (data.type === "recipe_suggestions" && data.recipes) {
          botResponse = "Here are some recipe suggestions:\n\n" + 
            data.recipes.map((recipe, index) => {
              let ingredients = recipe.ingredients;
              if (typeof ingredients === 'string') {
                ingredients = ingredients.split(',').map(ing => ing.trim());
              }
              
              return `**${recipe.name}**\n${
                ingredients.map(ing => `• ${ing}`).join('\n')
              }`;
            }).join('\n\n');
            
        } else if (data.type === "ingredient_substitutes" && data.substitutes) {
          botResponse = `Here are some substitutes for your ingredient:\n\n${
            data.substitutes.map((sub, index) => `• ${sub}`).join('\n')
          }`;
        } else {
          botResponse = data.message || JSON.stringify(data, null, 2);
        }
      } else {
        botResponse = data.message || "Sorry, I couldn't process your request.";
      }
      
      setMessages(m => [...m, { role: "bot", text: botResponse }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(m => [...m, { 
        role: "bot", 
        text: "Sorry, there was an error processing your request. Please try again." 
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
      } else if (line.startsWith('• ')) {
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
            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
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
              <span className="text-sm">➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}