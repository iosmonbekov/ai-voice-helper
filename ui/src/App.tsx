import { useState, useEffect, useRef } from "react";
import { Bot, Mic, MicOff } from "lucide-react";
import { io, Socket } from "socket.io-client";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Click to start a conversation");
  const [aiResponse, setAiResponse] = useState(""); // AI response text
  const socketRef = useRef<Socket | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSpeakingRef = useRef(false); // Tracks if AI is speaking
  const aiSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:3000"); // Replace with your backend URL

    // Listen for AI responses
    socketRef.current.on("ai-response", (message: string) => {
      if (isListening) speakText(message); // Respond only if in conversation mode
      setAiResponse(message); // Update AI response text
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isListening]);

  const startRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.lang = "en-US"; // Set language
      recognition.continuous = false; // Process one monologue at a time
      recognition.interimResults = false; // Don't handle partial results
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setStatus("Listening...");
      };

      recognition.onresult = (event) => {
        const speechToText = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setStatus(`Processing: "${speechToText}"`);
        sendTextToServer(speechToText); // Send user input to the backend
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setStatus("Error recognizing speech. Retrying...");
      };

      recognition.onend = () => {
        if (isListening && !isSpeakingRef.current) {
          recognition.start(); // Automatically restart if the conversation is active
        }
      };

      recognition.start();
    } else {
      setStatus("Speech recognition is not supported in this browser.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  const startConversation = () => {
    setIsListening(true);
    startRecognition();
  };

  const stopConversation = () => {
    setIsListening(false);
    setStatus("Click to start a conversation");
    recognitionRef.current?.stop();
    if (aiSpeechRef.current) {
      speechSynthesis.cancel(); // Stop AI from speaking
    }
  };

  const sendTextToServer = (text: string) => {
    try {
      socketRef.current?.emit("voice-input", text); // Send user input to the server
    } catch (error) {
      console.error("Error sending text to server:", error);
      setStatus("Error sending text");
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Set language for the AI's voice
      utterance.rate = 1; // Adjust speed
      utterance.pitch = 1; // Adjust pitch

      utterance.onstart = () => {
        isSpeakingRef.current = true; // Mark AI as speaking
        setStatus("AI is responding...");
        recognitionRef.current?.stop(); // Stop listening while AI is speaking
      };

      utterance.onend = () => {
        isSpeakingRef.current = false; // Mark AI as done speaking
        setStatus("Listening...");
        if (isListening) recognitionRef.current?.start(); // Resume listening
      };

      aiSpeechRef.current = utterance; // Store reference to allow interruption
      speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis is not supported in this browser.");
      setStatus("Error: Speech synthesis not supported");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo and Title */}
        <div className="flex items-center justify-center space-x-3 mb-12">
          <Bot className="w-12 h-12 text-indigo-600" />
          <h1 className="text-4xl font-bold text-indigo-600">Voice AI</h1>
        </div>

        {/* Mic Toggle Button */}
        <button
          onClick={toggleListening}
          className={`
            p-8 rounded-full shadow-lg transition-all duration-300 transform
            ${isListening 
              ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse" 
              : "bg-indigo-600 hover:bg-indigo-700"
            }
          `}
        >
          {isListening ? (
            <MicOff className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>

        {/* Status Text */}
        <div className="mt-8">
          <span
            className={`
            text-lg font-medium px-6 py-3 rounded-full
            ${isListening 
              ? "bg-red-100 text-red-800" 
              : "bg-indigo-100 text-indigo-800"
            }
          `}
          >
            {status}
          </span>
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="mt-4">
            <p className="text-green-800 font-medium">
              <strong>AI Response:</strong> {aiResponse}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
