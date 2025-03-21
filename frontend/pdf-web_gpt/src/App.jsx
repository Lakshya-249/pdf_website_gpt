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
} from "lucide-react";

function App() {
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex font-sans">
      {/* Toggle Sidebar Button (for mobile) */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-4 left-4 z-30 bg-blue-600 text-white p-2 rounded-full shadow-lg"
      >
        {showSidebar ? <X size={20} /> : <FileText size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 w-80 bg-gray-800 shadow-xl flex flex-col z-20 fixed md:static h-full`}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center">
            <FileText className="mr-2" />
            DocuChat
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Upload documents to chat with them
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <h3 className="text-gray-300 font-medium flex items-center">
              <Upload size={18} className="mr-2" />
              Upload Documents
            </h3>
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <p className="text-gray-400 mb-2">
                Drag & drop files or click to browse
              </p>
              <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                Select Files
              </button>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-gray-300 text-sm">
                    {files.length} file(s) selected
                  </h4>
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
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
                      className="flex items-center justify-between bg-gray-700 p-2 rounded-md"
                    >
                      <div className="flex items-center truncate text-sm text-gray-300">
                        <FileText
                          size={14}
                          className="mr-2 text-blue-400 shrink-0"
                        />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-gray-400 hover:text-red-400 p-1"
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
            <h3 className="text-gray-300 font-medium flex items-center">
              <ExternalLink size={18} className="mr-2" />
              Process URL
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={loading || !url}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex justify-center items-center disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
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

        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <p className="text-xs text-gray-500 text-center">
            DocuChat v2.0 | Powered by AI
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-transparent relative">
        {showSidebar && (
          <div
            className="absolute inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}
        <div className="bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-700 z-10 flex items-center">
          <h1 className="text-xl font-semibold text-gray-100 flex-1">
            Document Chat Assistant
          </h1>
        </div>
        <div
          ref={chatContainerRef}
          className="flex-1 p-6 space-y-4 overflow-y-auto scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-blue-500/10 p-8 rounded-full mb-4">
                <FileText size={48} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-300 mb-2">
                Welcome to DocuChat
              </h2>
              <p className="text-gray-500 max-w-md">
                Upload documents or process a URL using the sidebar, then start
                asking questions about your content.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                text={msg.text}
                isUser={msg.isUser}
                isStructured={msg.isStructured}
              />
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg text-gray-400 flex items-center animate-pulse">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Processing your request...
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-800/80 backdrop-blur-sm p-4 border-t border-gray-700 z-10">
          <div className="flex items-center space-x-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask a question about your documents..."
              className="flex-1 p-4 bg-gray-700/90 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !query.trim()}
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat Message Component
function ChatMessage({ text, isUser, isStructured }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-lg shadow-md p-4 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-800/90 backdrop-blur-sm text-gray-200 border border-gray-700 rounded-bl-none"
        }`}
      >
        {isStructured ? (
          <div className="prose prose-sm prose-invert max-w-none">
            {text.split("\n").map((line, i) => (
              <p key={i} className="mb-2">
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

export default App;
