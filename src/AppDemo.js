import { useState } from "react";

export default function AppDemo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;
    setMessages([...messages, { role: "user", text: input }]);
    
    setInput("");
    try {
      const res = await fetch("http://localhost:5678/webhook-test/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await res.json();
      console.log("Response from n8n:", data);
      
      // Format the bot response based on the type
      let botResponse = "";
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
        botResponse = data.message || "Sorry, I couldn't process your request.";
      }
      
      setMessages(m => [...m, { role: "bot", text: botResponse }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(m => [...m, { role: "bot", text: "Sorry, there was an error processing your request." }]);
    }

    setInput("");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-blue-600" : "text-green-600"}>
            {m.role}:<br></br> {m.text}<br></br>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border flex-1 p-2 rounded-l"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded-r">
          Send
        </button>
      </div>
    </div>
  );
}
