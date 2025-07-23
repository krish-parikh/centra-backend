// DOM Elements
const navItems = document.querySelectorAll(".nav-item");
const searchInput = document.querySelector(".search-input");
const micBtn = document.querySelector(".mic-btn");
const addBtn = document.querySelector(".add-btn");
const overlay = document.getElementById("thoughtOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const thoughtList = document.getElementById("thoughtList");
const closeOverlay = document.getElementById("closeOverlay");
const thinkingBlob = document.getElementById("thinkingBlob");
const profileIcon = document.getElementById("profileIcon");
const profileOverlay = document.getElementById("profileOverlay");
const profileArrow = document.querySelector(".profile-arrow");
const loginMenuItem = document.getElementById("loginMenuItem");

// Sample thoughts data
const thoughtsData = {
  Philosophy: [
    "What is consciousness?",
    "Free will vs determinism",
    "The nature of reality",
    "Ethics in AI development",
    "The meaning of existence",
  ],
  Business: [
    "Product market fit strategy",
    "Team scaling challenges",
    "Revenue optimization ideas",
    "Customer acquisition tactics",
    "Competitive analysis framework",
  ],
  Health: [
    "Morning routine optimization",
    "Nutrition and energy levels",
    "Exercise consistency tips",
    "Sleep quality improvement",
    "Stress management techniques",
  ],
  Relationships: [
    "Communication patterns",
    "Building deeper connections",
    "Conflict resolution strategies",
    "Emotional intelligence",
    "Trust and vulnerability",
  ],
};

// Navigation functionality
navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    // Remove active class from all items
    navItems.forEach((nav) => nav.classList.remove("active"));

    // Get the category name
    const categoryName = item.querySelector("span").textContent;
    console.log(`Navigated to: ${categoryName}`);

    // Check if this is a thought space category
    const category = item.getAttribute("data-category");
    if (category && thoughtsData[category]) {
      // Toggle expanded state and animate expand icon
      const expandIcon = item.querySelector(".expand-icon");
      const isExpanded = item.classList.contains("expanded");

      if (isExpanded) {
        // Close overlay if already expanded
        item.classList.remove("expanded");
        hideThoughtsOverlay();
      } else {
        // Remove expanded state from all other items
        navItems.forEach((nav) => nav.classList.remove("expanded"));
        // Add expanded state to clicked item
        item.classList.add("expanded");
        // Show overlay with thoughts for this category
        showThoughtsOverlay(category, item);
      }
      return;
    }

    // Add active class to clicked item (for Home and other nav items)
    const sectionHeader = item.closest(".nav-section").querySelector("h3");
    if (!sectionHeader || sectionHeader.textContent !== "Thought Spaces") {
      item.classList.add("active");
    }

    // Update welcome message and content based on selection
    updateWelcomeMessage(categoryName);
    updateMainContent(categoryName);
  });
});

// Search functionality - only for searching existing thoughts
searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  if (query.length > 0) {
    console.log(`Searching existing thoughts for: ${query}`);
    // TODO: Implement search functionality for existing thoughts
    // This should search through saved thoughts, not add new ones
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = e.target.value;
    if (query.length > 0) {
      console.log(`Executing search for: ${query}`);
      // TODO: Execute search for existing thoughts
    }
  }
});

// Voice input functionality
let isRecording = false;
let recognition = null;

// Check if browser supports speech recognition
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isRecording = true;
    // Update mic button
    if (micBtn) {
      micBtn.style.backgroundColor = "#ffebee";
      micBtn.querySelector(".btn-icon").style.filter =
        "invert(0.2) sepia(1) saturate(2) hue-rotate(0deg)";
    }
    // Update thinking blob
    if (thinkingBlob) {
      thinkingBlob.classList.add("recording", "pulsating");
    }
    console.log("Voice recording started...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Voice input received:", transcript);
    // TODO: Handle the voice input for adding new thoughts
    // This should create a new thought, not populate the search bar
  };

  recognition.onend = () => {
    isRecording = false;
    // Update mic button
    if (micBtn) {
      micBtn.style.backgroundColor = "#f0f7ff";
      micBtn.querySelector(".btn-icon").style.filter =
        "invert(0.3) sepia(1) saturate(2) hue-rotate(200deg)";
    }
    // Update thinking blob
    if (thinkingBlob) {
      thinkingBlob.classList.remove("recording", "pulsating");
    }
    console.log("Voice recording ended.");
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    isRecording = false;
    // Update mic button
    if (micBtn) {
      micBtn.style.backgroundColor = "#f0f7ff";
      micBtn.querySelector(".btn-icon").style.filter =
        "invert(0.3) sepia(1) saturate(2) hue-rotate(200deg)";
    }
    // Update thinking blob
    if (thinkingBlob) {
      thinkingBlob.classList.remove("recording", "pulsating");
    }
  };
}

// Function to start/stop voice recognition
function toggleVoiceRecognition() {
  if (!recognition) {
    alert(
      "Speech recognition is not supported in your browser. Please use Chrome or Edge."
    );
    return;
  }

  if (isRecording) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

// Mic button event listener
if (micBtn) {
  micBtn.addEventListener("click", toggleVoiceRecognition);
}

// Thinking blob event listener
if (thinkingBlob) {
  thinkingBlob.addEventListener("click", toggleVoiceRecognition);
}

// Add thought functionality
addBtn.addEventListener("click", handleAddThought);

function handleAddThought() {
  const thought = searchInput.value.trim();
  if (thought) {
    console.log("Adding thought:", thought);
    // TODO: Implement add thought functionality

    // Clear input
    searchInput.value = "";

    // Show temporary feedback
    showFeedback("Thought added successfully!");
  }
}

// Update welcome message based on selected category
function updateWelcomeMessage(categoryName) {
  const welcomeMessage = document.querySelector(".welcome-message");
  const h2 = welcomeMessage.querySelector("h2");
  const p = welcomeMessage.querySelector("p");

  switch (categoryName) {
    case "Home":
      h2.textContent = "Recent Thoughts";
      p.textContent = "Your latest thoughts and ideas from all spaces";
      break;
    case "Philosophy":
      h2.textContent = "Philosophy Space";
      p.textContent =
        "Explore your deepest thoughts and philosophical insights";
      break;
    case "Business":
      h2.textContent = "Business Space";
      p.textContent = "Organize your business ideas and strategic thinking";
      break;
    case "Health":
      h2.textContent = "Health Space";
      p.textContent = "Track your wellness journey and health insights";
      break;
    case "Relationships":
      h2.textContent = "Relationships Space";
      p.textContent = "Nurture your connections and relationship reflections";
      break;
    case "Settings":
      h2.textContent = "Settings";
      p.textContent = "Customize your Centra experience";
      break;
    case "Add New Thought":
      h2.textContent = "Add New Thought";
      p.textContent = "Create a new thought in your selected space";
      break;
    case "Help":
      h2.textContent = "Help & Support";
      p.textContent = "Get help with using Centra and managing your thoughts";
      break;
    default:
      h2.textContent = "Welcome to your mind palace";
      p.textContent =
        "Start by adding your first thought using voice or text above";
  }
}

// Show feedback messages
function showFeedback(message) {
  // Create feedback element
  const feedback = document.createElement("div");
  feedback.textContent = message;
  feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2c5aa0;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;

  document.body.appendChild(feedback);

  // Animate in
  setTimeout(() => {
    feedback.style.opacity = "1";
    feedback.style.transform = "translateY(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    feedback.style.opacity = "0";
    feedback.style.transform = "translateY(-20px)";
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 300);
  }, 3000);
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  console.log("Centra initialized");

  // Set focus on search input
  searchInput.focus();

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
    }

    // Escape to clear search
    if (e.key === "Escape") {
      searchInput.value = "";
      searchInput.blur();
    }
  });
});

// Update main content based on selected category
function updateMainContent(categoryName) {
  const addThoughtScreen = document.querySelector(".add-thought-screen");
  const welcomeMessage = document.querySelector(".welcome-message");
  const recentThoughtsSection = document.querySelector(
    ".recent-thoughts-section"
  );

  // Hide all screens first
  if (addThoughtScreen) addThoughtScreen.style.display = "none";
  if (welcomeMessage) welcomeMessage.style.display = "none";
  if (recentThoughtsSection) recentThoughtsSection.style.display = "none";

  // Show appropriate screen based on selection
  if (categoryName === "Home") {
    if (recentThoughtsSection) recentThoughtsSection.style.display = "block";
  } else if (categoryName === "Add New Thought") {
    if (addThoughtScreen) addThoughtScreen.style.display = "flex";
  } else {
    if (welcomeMessage) welcomeMessage.style.display = "block";
  }
}

// Show thoughts overlay for a category
function showThoughtsOverlay(category, clickedItem) {
  overlayTitle.textContent = `${category} Thoughts`;

  // Clear existing thoughts
  thoughtList.innerHTML = "";

  // Add thoughts for this category
  const thoughts = thoughtsData[category] || [];
  thoughts.forEach((thought) => {
    const li = document.createElement("li");
    li.textContent = thought;
    li.addEventListener("click", () => {
      console.log(`Selected thought: ${thought}`);
      hideThoughtsOverlay();
      // TODO: Handle thought selection
    });
    thoughtList.appendChild(li);
  });

  // Position overlay next to the clicked item
  const itemRect = clickedItem.getBoundingClientRect();
  const sidebarRect = clickedItem.closest(".sidebar").getBoundingClientRect();

  // Position to the right of the sidebar
  overlay.style.left = `${sidebarRect.right + 8}px`;
  overlay.style.top = `${itemRect.top}px`;

  // Show overlay
  overlay.classList.add("show");
}

// Hide thoughts overlay
function hideThoughtsOverlay() {
  overlay.classList.remove("show");
  // Remove expanded state from all nav items
  navItems.forEach((nav) => nav.classList.remove("expanded"));
}

// Overlay event listeners
closeOverlay.addEventListener("click", hideThoughtsOverlay);

// Close overlay when clicking outside content
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    hideThoughtsOverlay();
  }
});

// Close overlay with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("show")) {
    hideThoughtsOverlay();
  }
  if (e.key === "Escape" && profileOverlay.classList.contains("show")) {
    hideProfileOverlay();
  }
});

// Profile overlay functionality
function showProfileOverlay() {
  const iconRect = profileIcon.getBoundingClientRect();
  const sidebar = document.querySelector(".sidebar");
  const sidebarRect = sidebar.getBoundingClientRect();

  // Brute force right alignment - position from sidebar's right edge
  profileOverlay.style.left = `${sidebarRect.right - 160 - 14}px`; // 14px padding from right edge
  profileOverlay.style.top = `${iconRect.top - 8}px`;
  profileOverlay.style.transform = "translateY(-100%)";

  profileOverlay.classList.add("show");

  // Flip arrow when overlay is shown
  if (profileArrow) {
    profileArrow.classList.add("flipped");
  }
}

function hideProfileOverlay() {
  profileOverlay.classList.remove("show");

  // Reset arrow when overlay is hidden
  if (profileArrow) {
    profileArrow.classList.remove("flipped");
  }
}

// Profile icon event listener
if (profileIcon) {
  profileIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    if (profileOverlay.classList.contains("show")) {
      hideProfileOverlay();
    } else {
      showProfileOverlay();
    }
  });
}

// Profile menu item event listeners
if (loginMenuItem) {
  loginMenuItem.addEventListener("click", () => {
    console.log("Login clicked (static frontend)");
    hideProfileOverlay();
    // TODO: Add login functionality
    alert("Login functionality - static frontend demo");
  });
}

// Close profile overlay when clicking outside
document.addEventListener("click", (e) => {
  if (
    profileOverlay.classList.contains("show") &&
    !profileOverlay.contains(e.target) &&
    !profileIcon.contains(e.target)
  ) {
    hideProfileOverlay();
  }
});
