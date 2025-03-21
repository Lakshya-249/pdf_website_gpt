import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  ExternalLink,
  ArrowRight,
  Upload,
  Loader,
  Send,
  Trash2,
  X,
  Moon,
  Sun,
  Info,
} from "lucide-react";

function App() {
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }

    try {
      await axios.post("http://localhost:5000/upload", formData);
      setMessages((prev) => [
        ...prev,
        {
          text: `Successfully uploaded ${files.length} document${
            files.length > 1 ? "s" : ""
          }.`,
          isUser: false,
        },
      ]);
      setFiles([]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { text: "Error uploading documents. Please try again.", isUser: false },
      ]);
    }
    setLoading(false);
  };

  const handleUrlSubmit = async () => {
    if (!url) return;
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/urls", { data: { url } });
      setMessages((prev) => [
        ...prev,
        { text: `URL processed successfully: ${url}`, isUser: false },
      ]);
      setUrl("");
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Error processing URL. Please check the link and try again.",
          isUser: false,
        },
      ]);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!query.trim()) return;
    setMessages((prev) => [...prev, { text: query, isUser: true }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/search?query=${encodeURIComponent(query)}`
      );
      const responseText = res.data.output_text || JSON.stringify(res.data);
      setMessages((prev) => [
        ...prev,
        { text: responseText, isUser: false, isStructured: true },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Error fetching response. Please try again later.",
          isUser: false,
        },
      ]);
    }
    setLoading(false);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Auto-scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Theme colors
  const theme = darkMode
    ? {
        bg: "from-gray-900 to-indigo-950",
        sidebar: "bg-gradient-to-b from-gray-800 to-gray-900",
        card: "bg-gray-800/80",
        text: "text-gray-100",
        accent: "bg-purple-600 hover:bg-purple-700",
        input: "bg-gray-700/90 border-gray-600",
        messageUser: "bg-gradient-to-r from-purple-600 to-pink-500",
        messageBot: "bg-gradient-to-r from-gray-800 to-gray-700",
      }
    : {
        bg: "from-indigo-50 to-violet-100",
        sidebar: "bg-gradient-to-b from-white to-violet-50",
        card: "bg-white/80",
        text: "text-gray-800",
        accent: "bg-violet-600 hover:bg-violet-700",
        input: "bg-white/90 border-gray-300",
        messageUser: "bg-gradient-to-r from-violet-600 to-fuchsia-500",
        messageBot: "bg-gradient-to-r from-white to-gray-100",
      };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bg} flex font-sans transition-colors duration-500`}
    >
      {/* Toggle Sidebar Button (for mobile) */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-4 left-4 z-30 bg-purple-600 text-white p-2 rounded-full shadow-lg"
      >
        {showSidebar ? <X size={20} /> : <FileText size={20} />}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-30 bg-gray-800/30 backdrop-blur-sm text-white p-2 rounded-full shadow-lg"
      >
        {darkMode ? (
          <Sun size={20} />
        ) : (
          <Moon size={20} className="text-gray-800" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 md:translate-x-0 w-80 ${
          theme.sidebar
        } shadow-2xl flex flex-col z-20 fixed md:static max-sm:h-full h-dvh backdrop-blur-md`}
      >
        <div className="p-6 border-b border-gray-700/30">
          <h2 className="text-2xl font-bold text-transparent max-sm:pl-10 bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center">
            <FileText className="mr-2 text-purple-400" />
            DocuChat
          </h2>
          <p
            className={`${
              darkMode ? "text-gray-400" : "text-gray-600"
            } text-sm mt-1`}
          >
            Engage with your documents intelligently
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <h3
              className={`${
                darkMode ? "text-gray-300" : "text-gray-700"
              } font-medium flex items-center`}
            >
              <Upload size={18} className="mr-2 text-purple-400" />
              Upload Documents
            </h3>
            <div
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed ${
                darkMode
                  ? "border-gray-600 hover:border-purple-500"
                  : "border-gray-300 hover:border-purple-400"
              } rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] group`}
            >
              <div className="transition-transform duration-300 group-hover:-translate-y-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                <div className="w-16 h-16 mx-auto mb-3 bg-purple-400/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload size={24} className="text-purple-400" />
                </div>
                <p
                  className={`${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } mb-2`}
                >
                  Drag & drop files or click to browse
                </p>
                <button
                  className={`text-sm ${theme.accent} text-white px-4 py-2 rounded-md transition-colors shadow-md`}
                >
                  Select Files
                </button>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <h4
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    } text-sm`}
                  >
                    {files.length} file(s) selected
                  </h4>
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`${theme.accent} text-white text-sm px-4 py-1.5 rounded-full flex items-center disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg`}
                  >
                    {loading ? (
                      <Loader size={14} className="mr-1 animate-spin" />
                    ) : (
                      <Upload size={14} className="mr-1" />
                    )}
                    Upload
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between ${
                        darkMode ? "bg-gray-700/60" : "bg-white/60"
                      } p-2 rounded-lg backdrop-blur-sm transition-all duration-300 hover:shadow-md`}
                    >
                      <div className="flex items-center truncate text-sm text-gray-300">
                        <FileText
                          size={14}
                          className="mr-2 text-purple-400 shrink-0"
                        />
                        <span
                          className={`truncate ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className={`${
                          darkMode
                            ? "text-gray-400 hover:text-red-400"
                            : "text-gray-500 hover:text-red-500"
                        } p-1`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* URL Input Section */}
          <div className="space-y-4">
            <h3
              className={`${
                darkMode ? "text-gray-300" : "text-gray-700"
              } font-medium flex items-center`}
            >
              <ExternalLink size={18} className="mr-2 text-purple-400" />
              Process URL
            </h3>
            <div className="space-y-2">
              <div
                className={`relative group ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL"
                  className={`w-full p-3 ${theme.input} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm pr-10 transition-all duration-300`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={16} className="text-purple-400" />
                </div>
              </div>
              <button
                onClick={handleUrlSubmit}
                disabled={loading || !url}
                className={`w-full ${theme.accent} text-white py-2.5 px-4 rounded-lg flex justify-center items-center disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg`}
              >
                {loading ? (
                  <Loader size={16} className="animate-spin mr-2" />
                ) : (
                  <ArrowRight size={16} className="mr-2" />
                )}
                Process URL
              </button>
            </div>
          </div>
        </div>

        <div
          className={`p-4 border-t ${
            darkMode ? "border-gray-700/30" : "border-gray-200"
          }`}
        >
          <div className="flex justify-center items-center space-x-1">
            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-100"></span>
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></span>
          </div>
          <p
            className={`text-xs ${
              darkMode ? "text-gray-500" : "text-gray-600"
            } text-center mt-2`}
          >
            DocuChat v2.0 | Powered by AI
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-transparent relative">
        {showSidebar && (
          <div
            className="absolute inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}
        <div
          className={`${theme.card} backdrop-blur-md p-4 border-b ${
            darkMode ? "border-gray-700/30" : "border-gray-200/70"
          } z-10 flex items-center shadow-sm`}
        >
          <h1
            className={`text-xl font-semibold ${theme.text} flex-1 max-sm:pl-12`}
          >
            Document Chat Assistant
          </h1>
          <button
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-gray-700/50 text-gray-300"
                : "bg-gray-200/70 text-gray-700"
            } hover:bg-purple-500/30 transition-colors duration-300`}
          >
            <Info size={18} />
          </button>
        </div>
        <div
          ref={chatContainerRef}
          className="flex-1 p-6 space-y-4 overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 200px)", // Adjust 200px based on your header/footer heights
            minHeight: "200px", // Optional: ensures minimum height
            scrollBehavior: "smooth", // Optional: smooth scrolling
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-purple-500/10 p-8 rounded-full mb-4 animate-pulse">
                <FileText size={48} className="text-purple-400" />
              </div>
              <h2
                className={`text-xl font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Welcome to DocuChat
              </h2>
              <p
                className={`${
                  darkMode ? "text-gray-500" : "text-gray-600"
                } max-w-md`}
              >
                Upload documents or process a URL using the sidebar, then start
                asking questions about your content.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6 max-w-lg">
                <div
                  className={`${
                    darkMode ? "bg-gray-800/60" : "bg-white/60"
                  } backdrop-blur-sm p-4 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                >
                  <Upload size={24} className="text-purple-400 mb-2" />
                  <h3
                    className={`font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Upload Documents
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    PDF, DOCX, and TXT files supported
                  </p>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-800/60" : "bg-white/60"
                  } backdrop-blur-sm p-4 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
                >
                  <ExternalLink size={24} className="text-purple-400 mb-2" />
                  <h3
                    className={`font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Process URL
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    Extract content from websites
                  </p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                text={msg.text}
                isUser={msg.isUser}
                isStructured={msg.isStructured}
                theme={darkMode ? "dark" : "light"}
                userStyle={theme.messageUser}
                botStyle={theme.messageBot}
              />
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div
                className={`${theme.card} backdrop-blur-sm p-4 rounded-lg ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } flex items-center`}
              >
                <div className="flex space-x-1 mr-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
                </div>
                Processing your request...
              </div>
            </div>
          )}
        </div>
        <div
          className={`${theme.card} backdrop-blur-md p-4 border-t ${
            darkMode ? "border-gray-700/30" : "border-gray-200/70"
          } z-10`}
        >
          <div className="flex items-center space-x-2 max-w-4xl mx-auto relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask a question about your documents..."
              className={`flex-1 p-4 ${theme.input} rounded-2xl ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 pr-12`}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !query.trim()}
              className={` right-2 ${theme.accent} text-white p-3 rounded-xl hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-md group-focus-within:scale-110`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat Message Component
function ChatMessage({
  text,
  isUser,
  isStructured,
  theme,
  userStyle,
  botStyle,
}) {
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } animate-fadeIn`}
    >
      <div
        className={`max-w-3xl rounded-2xl shadow-md p-4 ${
          isUser
            ? `${userStyle} text-white rounded-br-none`
            : `${botStyle} ${
                theme === "dark"
                  ? "text-gray-200 border border-gray-700/30"
                  : "text-gray-700 border border-gray-200/70"
              } rounded-bl-none`
        } transition-all duration-300 hover:shadow-lg`}
      >
        {isStructured ? (
          <div className="prose prose-sm max-w-none">
            {text.split("\n").map((line, i) => (
              <p
                key={i}
                className={`mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  );
}

// Add this to your CSS/Tailwind setup
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default App;
