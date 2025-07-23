# Centra OS

## Notes

Turn your thoughts into visual memory diagrams. We make "forgetting" a thing of the past.

### Core Features:

- Voice to add new memories
- Sidebar with tagged "thought categories" and sub-thoughts
- Click on a thought to view its diagram
- Each thought is stored as a visual.

## 💡 Concept

Centra is a thought management system that allows users to log, organize, and visually explore their thoughts as structured diagrams. Each thought is stored as a memory node with a graph-based visualization powered by AI.

---

## 🔧 Core Features

- 🎙 **Voice Bar Input**  
  Allows users to add new thoughts/memories using voice input.

- 🧠 **Thought Categories (Sidebar)**  
  Sidebar includes predefined core categories:

  - Philosophy
  - Business
  - Health
  - Relationships  
    Each category supports nested subthoughts, shown via an expandable tree.

- 🧩 **Graph View per Thought**  
  Each thought is visualized as a graph. Users can interactively add/edit nodes and edges.  
  Thought diagrams are stored in JSON and can be re-prompted through GPT to evolve dynamically.

- 🔍 **Memory Search**  
  A powerful search bar enables users to explore past thoughts based on keywords, categories, or dates.

---

## 📚 Data Structure

Each thought is stored as:

```json
{
  "id": "uuid",
  "category": "Philosophy",
  "graph": {
    "nodes": [
      {
        "id": "root-thought",
        "position": { "x": 100, "y": 100 },
        "data": {
          "label": "What is the self?",
          "color": "#3B82F6"
        }
      },
      {
        "id": "sub-1",
        "position": { "x": 400, "y": 200 },
        "data": {
          "label": "The self is an illusion (Buddhist view)",
          "color": "#93C5FD"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "root-thought",
        "target": "sub-1",
        "type": "smoothstep",
        "label": "Conceptual interpretation"
      }
    ]
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```
