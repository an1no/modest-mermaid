

# Mermaid Live Viewer & Editor

A powerful, distraction-free environment for creating and visualizing **Mermaid.js** diagrams. Built with React and designed for speed and aesthetics.

## Features

- **Real-time Preview**: Type Mermaid code and see diagrams update instantly.
- **Two Unique Themes**:
    - **Notion Minimalist**: A clean, professional look perfect for documentation.
    - **Sketch / Hand-Drawn**: A rough, paper-like aesthetic for rapid prototyping and brainstorming.
- **Viral Sharing**: Click the **Link** icon to generate a shareable URL containing your entire diagram. (Uses `lz-string` compression).
- **Auto-Save History**: Never lose your work. The editor automatically snapshots your code every few seconds. Access previous versions via the **Clock** icon.
- **Powerful Editor**:
    - **Rich Syntax Highlighting**: Color-coded Mermaid syntax (keywords, strings, operators) for better readability.
    - Line numbers with synchronized scrolling.
    - Horizontal scrolling for complex diagrams.
    - "Distraction-free" interface.
- **Export Control**: Zoom, pan, and checking your diagrams with ease.

## Tech Stack

- **Framework**: React + Vite
- **Styling**: TailwindCSS
- **Diagrams**: Mermaid.js
- **Icons**: Lucide React
- **Editor**: react-simple-code-editor + PrismJS
- **Utils**: lz-string (compression)

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3001 to start creating diagrams.
