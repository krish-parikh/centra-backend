import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import { supabase } from './lib/supabase';

// Categories for thought organization
const thoughtCategories = ["Philosophy", "Business", "Health", "Relationships"];

const MainApp = () => {
  const [activeNavItem, setActiveNavItem] = useState("Add New Thought");
  const [currentView, setCurrentView] = useState("add-thought");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayCategory, setOverlayCategory] = useState("");
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const reactFlowRef = useRef(null);
  const [profileOverlayVisible, setProfileOverlayVisible] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showReactFlow, setShowReactFlow] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeCardVisible, setNodeCardVisible] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const recognition = useRef(null);
  const sidebarRef = useRef(null);
  const { signOut, user } = useAuth();

  // Function to fetch graph data from Supabase
  const fetchGraphData = async (category) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('graph')
        .eq('user_id', user.id)
        .eq('category', category)
        .single();

      if (error) {
        console.error('Error fetching graph data:', error);
        return null;
      }

      return data?.graph;
    } catch (err) {
      console.error('Error:', err);
      return null;
    }
  };

  // Function to load graph data into React Flow
  const loadGraphData = async (category) => {
    const data = await fetchGraphData(category);
    
    if (data && data.nodes && data.edges) {
      setGraphData(data);
      setNodes(data.nodes);
      setEdges(data.edges);
      return true;
    }
    
    // If no data, clear the graph
    setGraphData(null);
    setNodes([]);
    setEdges([]);
    return false;
  };

  // Initialize speech recognition
  React.useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = "en-US";

      recognition.current.onstart = () => {
        setIsRecording(true);
        console.log("Voice recording started...");
      };

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice input received:", transcript);
        // Handle the voice input for adding new thoughts
      };

      recognition.current.onend = () => {
        setIsRecording(false);
        console.log("Voice recording ended.");
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node click to show card
  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
    setNodeCardVisible(true);
    
    // Pan to the clicked node
    if (reactFlowRef.current) {
      reactFlowRef.current.setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 800 });
    }
  }, []);

  // Function to pan to a specific node
  const panToNode = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && reactFlowRef.current) {
      setSelectedNode(node);
      setNodeCardVisible(true);
      reactFlowRef.current.setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 800 });
    }
  }, [nodes]);

  const handleNavItemClick = async (item, category = null) => {
    setActiveNavItem(item);

    if (category && thoughtCategories.includes(category)) {
      const isExpanded = expandedItems.has(category);

      if (isExpanded) {
        setExpandedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(category);
          return newSet;
        });
        setOverlayVisible(false);
        setShowReactFlow(false);
      } else {
        setExpandedItems(new Set([category])); // Only allow one expanded at a time
        setOverlayCategory(category);
        setOverlayVisible(true);

        // Load graph data from database
        await loadGraphData(category);
        setShowReactFlow(true);
        
        // Position overlay next to sidebar
        setTimeout(() => {
          if (sidebarRef.current) {
            const sidebarRect = sidebarRef.current.getBoundingClientRect();
            setOverlayPosition({
              x: sidebarRect.right + 10,
              y: 100
            });
          }
        }, 0);
        
        // Center the React Flow after nodes are set
        setTimeout(() => {
          if (reactFlowRef.current) {
            reactFlowRef.current.fitView({ padding: 0.2 });
          }
        }, 100);
      }
      return;
    }

    // Update current view based on selection
    switch (item) {
      case "Home":
        setCurrentView("recent-thoughts");
        setShowReactFlow(false);
        break;
      case "Add New Thought":
        setCurrentView("add-thought");
        setShowReactFlow(false);
        break;
      default:
        setCurrentView("welcome");
        setShowReactFlow(false);
    }

    setOverlayVisible(false);
    setExpandedItems(new Set());
  };

  const toggleVoiceRecognition = () => {
    if (!recognition.current) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isRecording) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
  };

  const handleAddThought = () => {
    const thought = searchQuery.trim();
    if (thought) {
      console.log("Adding thought:", thought);
      setSearchQuery("");
      // Show temporary feedback
      alert("Thought added successfully!");
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      const query = e.target.value;
      if (query.length > 0) {
        console.log(`Executing search for: ${query}`);
      }
    }
  };

  const toggleProfileOverlay = (e) => {
    e.stopPropagation();
    setProfileOverlayVisible(!profileOverlayVisible);
  };

  // Close overlays when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setProfileOverlayVisible(false);
    };

    if (profileOverlayVisible) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [profileOverlayVisible]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector(".search-input")?.focus();
      }
      if (e.key === "Escape") {
        if (nodeCardVisible) {
          setNodeCardVisible(false);
        } else {
          setSearchQuery("");
          setOverlayVisible(false);
          setProfileOverlayVisible(false);
          setExpandedItems(new Set());
          setShowReactFlow(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nodeCardVisible]);

  const getWelcomeMessage = () => {
    switch (activeNavItem) {
      case "Home":
        return {
          title: "Recent Thoughts",
          subtitle: "Your latest thoughts and ideas from all spaces",
        };
      case "Philosophy":
        return {
          title: "Philosophy Space",
          subtitle: "Explore your deepest thoughts and philosophical insights",
        };
      case "Business":
        return {
          title: "Business Space",
          subtitle: "Organize your business ideas and strategic thinking",
        };
      case "Health":
        return {
          title: "Health Space",
          subtitle: "Track your wellness journey and health insights",
        };
      case "Relationships":
        return {
          title: "Relationships Space",
          subtitle: "Nurture your connections and relationship reflections",
        };
      case "Settings":
        return {
          title: "Settings",
          subtitle: "Customize your Centra experience",
        };
      case "Add New Thought":
        return {
          title: "Add New Thought",
          subtitle: "Create a new thought in your selected space",
        };
      case "Help":
        return {
          title: "Help & Support",
          subtitle: "Get help with using Centra and managing your thoughts",
        };
      default:
        return {
          title: "Welcome to your mind palace",
          subtitle:
            "Start by adding your first thought using voice or text above",
        };
    }
  };

  const renderMainContent = () => {
    if (showReactFlow) {
      return (
        <div
          className="react-flow-wrapper"
          style={{ width: "100%", height: "100vh" }}
        >
          <ReactFlow
            ref={reactFlowRef}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
          
          {/* Node Card Display */}
          {nodeCardVisible && selectedNode && (
            <div className="node-card">
              <div className="node-card-header">
                <h3>{selectedNode.data.label}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setNodeCardVisible(false)}
                >
                  ×
                </button>
              </div>
              <div className="node-card-content">
                <p>{selectedNode.data.content || "No description available."}</p>
                {selectedNode.data.category && (
                  <div className="node-card-meta">
                    <span className="node-category">{selectedNode.data.category}</span>
                    {selectedNode.data.created_at && (
                      <span className="node-date">
                        {new Date(selectedNode.data.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (currentView === "add-thought") {
      return (
        <div className="add-thought-screen">
          <div
            className="thinking-blob-container"
            onClick={toggleVoiceRecognition}
          >
            <img
              src="/assets/icons/thinking-blob.svg"
              alt="Add Thought"
              className={`thinking-blob ${
                isRecording ? "recording pulsating" : ""
              }`}
            />
          </div>
          <h2>What's on your mind?</h2>
          <p>Speak to add a new thought</p>
        </div>
      );
    }

    if (currentView === "recent-thoughts") {
      return (
        <div className="recent-thoughts-section">
          <div className="section-header">
            <img
              src="/assets/icons/history.svg"
              alt="Recent"
              className="section-icon"
            />
            <h3>Recent Thoughts</h3>
          </div>
          <div className="recent-thoughts-grid">
            <p className="empty-state">No recent thoughts yet. Start by adding your first thought!</p>
          </div>
        </div>
      );
    }

    const welcomeMsg = getWelcomeMessage();
    return (
      <div className="welcome-message">
        <h2>{welcomeMsg.title}</h2>
        <p>{welcomeMsg.subtitle}</p>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar" ref={sidebarRef}>
        <div className="sidebar-header">
          <div className="logo">
            <h1>Centra</h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <ul className="nav-list">
              <li
                className={`nav-item ${
                  activeNavItem === "Home" ? "active" : ""
                }`}
                onClick={() => handleNavItemClick("Home")}
              >
                <img
                  src="/assets/icons/home.svg"
                  alt="Home"
                  className="nav-icon"
                />
                <span>Home</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h3>Thought Spaces</h3>
            <ul className="nav-list">
              {thoughtCategories.map((category) => (
                <li
                  key={category}
                  className={`nav-item ${
                    expandedItems.has(category) ? "expanded" : ""
                  }`}
                  onClick={() => handleNavItemClick(category, category)}
                >
                  <img
                    src={`/assets/icons/${
                      category === "Philosophy"
                        ? "psychology_24dp_1F1F1F.svg"
                        : category === "Business"
                        ? "work_history_24dp_1F1F1F.svg"
                        : category === "Health"
                        ? "face_24dp_1F1F1F.svg"
                        : "people.svg"
                    }`}
                    alt={category}
                    className="nav-icon"
                  />
                  <span>{category}</span>
                  <img
                    src="/assets/icons/expand.svg"
                    alt="Expand"
                    className="expand-icon"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-section">
            <ul className="nav-list">
              <li
                className={`nav-item ${
                  activeNavItem === "Add New Thought" ? "active" : ""
                }`}
                onClick={() => handleNavItemClick("Add New Thought")}
              >
                <img
                  src="/assets/icons/add_circle_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg"
                  alt="Add New Thought"
                  className="nav-icon"
                />
                <span>Add New Thought</span>
              </li>
            </ul>
          </div>

          <div className="nav-section nav-bottom">
            <ul className="nav-list">
              <li
                className={`nav-item ${
                  activeNavItem === "Settings" ? "active" : ""
                }`}
                onClick={() => handleNavItemClick("Settings")}
              >
                <img
                  src="/assets/icons/settings.svg"
                  alt="Settings"
                  className="nav-icon"
                />
                <span>Settings</span>
              </li>
              <li
                className={`nav-item ${
                  activeNavItem === "Help" ? "active" : ""
                }`}
                onClick={() => handleNavItemClick("Help")}
              >
                <img
                  src="/assets/icons/question.svg"
                  alt="Help"
                  className="nav-icon"
                />
                <span>Help</span>
              </li>
            </ul>
          </div>
        </nav>

        {/* Profile section */}
        <div className="profile-section" onClick={toggleProfileOverlay}>
          <div className="profile-icon-with-arrow">
            <div className="profile-icon-container">
              <img
                src="/assets/icons/thinking-blob.svg"
                alt="Profile"
                className="profile-blob"
              />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16px"
              viewBox="0 -960 960 960"
              width="16px"
              fill="#9b9a97"
              className={`profile-arrow ${
                profileOverlayVisible ? "flipped" : ""
              }`}
            >
              <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
            </svg>
          </div>
          <span className="profile-label">Account</span>
          
          {/* Profile overlay menu */}
          {profileOverlayVisible && (
            <div className="profile-overlay show">
              <div className="profile-menu">
                <div
                  className="profile-menu-item"
                  onClick={async () => {
                    await signOut();
                    setProfileOverlayVisible(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="16px"
                    viewBox="0 -960 960 960"
                    width="16px"
                    fill="#1f1f1f"
                    className="menu-icon"
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                  </svg>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {!showReactFlow && (
          <div className="search-container">
            <div className="search-bar">
              <img
                src="/assets/icons/aisparkle.svg"
                alt="AI"
                className="search-icon"
              />
              <input
                type="text"
                placeholder="Search for your thoughts"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <div className="search-actions">
                <button
                  className="action-btn mic-btn"
                  onClick={toggleVoiceRecognition}
                >
                  <img
                    src="/assets/icons/mic_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg"
                    alt="Voice input"
                    className="btn-icon"
                  />
                </button>
                <button
                  className="action-btn add-btn"
                  onClick={handleAddThought}
                >
                  <img
                    src="/assets/icons/add_circle_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg"
                    alt="Add thought"
                    className="btn-icon"
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="content-area">{renderMainContent()}</div>
      </main>

      {/* Overlay for thought lists */}
      {overlayVisible && (
        <div 
          className="overlay show"
          style={{
            left: `${overlayPosition.x}px`,
            top: `${overlayPosition.y}px`
          }}
        >
          <div className="overlay-content">
            <div className="overlay-header">
              <h3>{overlayCategory} Thoughts</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setOverlayVisible(false);
                  setExpandedItems(new Set());
                  setShowReactFlow(false);
                }}
              >
                ×
              </button>
            </div>
            <div className="overlay-body">
              <ul className="thought-list">
                {nodes.map((node) => (
                  <li
                    key={node.id}
                    onClick={() => panToNode(node.id)}
                    className="thought-item"
                  >
                    {node.data.label}
                  </li>
                ))}
                {nodes.length === 0 && (
                  <li className="empty-thoughts">No thoughts in this category yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return <MainApp />;
};

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
