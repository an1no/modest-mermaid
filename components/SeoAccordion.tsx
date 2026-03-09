import React from 'react';

interface SeoAccordionProps {
    className?: string;
}

export const SeoAccordion: React.FC<SeoAccordionProps> = ({ className = '' }) => {
    return (
        <div className={`border-t ${className}`}>
            <details className="text-xs p-3 opacity-60 hover:opacity-100 transition-opacity">
                <summary className="cursor-pointer font-medium select-none outline-none">
                    What is mermaids.cc?
                </summary>
                <div className="space-y-3 mt-3 leading-relaxed">
                    <p>
<<<<<<< Updated upstream
                        <strong>What is this?</strong> Mermaids.cc is a lightweight, dedicated <strong>Mermaid.js live editor</strong> designed for developers, technical writers, and product managers who need to visualize architecture without friction. Rather than dealing with heavy graphical interfaces, this tool acts as a simple <strong>Markdown to diagram</strong> compiler directly in your browser. Whether you are drafting documentation for a GitHub repository, mapping out microservices, or planning sprint timelines, mermaids.cc provides a clean environment to compile structural code into beautiful visuals instantly. We built this as a fast, accessible <strong>Mermaid syntax previewer</strong> so you can focus on writing logic rather than clicking and dragging shapes.
                    </p>
                    <p>
                        <strong>Supported Diagrams:</strong> The engine parses standard Mermaid syntax, enabling you to generate a wide variety of technical visualizations. Current support includes our highly popular <strong>online sequence diagram generator</strong>, which is perfect for mapping API calls and authentication flows. You can also seamlessly create branching <strong>flowcharts from text</strong>, detailed project management Gantt charts, and complex object-oriented Class diagrams. As the underlying syntax evolves, you can trust our compiler to handle state diagrams, pie charts, and entity-relationship models with the same precision.
                    </p>
                    <p>
                        <strong>Why use this?</strong> We believe technical tooling should be invisible until you need it. Mermaids.cc requires zero configuration and strictly zero logins. The moment you land on the page, the editor is ready. By focusing exclusively on instant live rendering, you eliminate the delay between writing code and seeing the result. The interface is optimized for speed, allowing you to prototype, test your syntax, and export your final architectural models in seconds, completely free.
=======
                        <strong>What is this?</strong> Mermaids.cc is a free, browser-based <strong>Mermaid.js live editor</strong> built for developers, technical writers, and product managers. It functions as a real-time <strong>Markdown to diagram</strong> compiler — paste or write Mermaid syntax and your diagram renders instantly, with no installation, no account, and no configuration required. The built-in code editor features <strong>Mermaid syntax highlighting</strong> and line numbers, making it a genuinely productive environment for authoring complex diagrams directly in the browser.
                    </p>
                    <p>
                        <strong>Supported Diagrams:</strong> The engine supports the full range of standard Mermaid diagram types. Use it as an <strong>online sequence diagram generator</strong> for mapping API calls, authentication flows, and service interactions. Render branching <strong>flowcharts from text</strong>, plan project timelines with Gantt charts, model object-oriented systems with Class diagrams, and visualize data with ER diagrams, state diagrams, and pie charts — all from a single, unified <strong>Mermaid syntax previewer</strong>.
                    </p>
                    <p>
                        <strong>Export &amp; Share:</strong> Every rendered diagram can be exported as a high-resolution <strong>PNG (2× retina quality)</strong> or as a scalable <strong>SVG file</strong>, ready for use in documentation, slide decks, or GitHub READMEs. The share button generates a <strong>shareable URL</strong> that encodes your entire diagram in the link, so collaborators can open your exact diagram in one click without any backend or login.
                    </p>
                    <p>
                        <strong>Viewer Controls:</strong> The diagram viewer supports <strong>zoom in, zoom out, and pan</strong> via mouse, scroll wheel, or trackpad, powered by smooth pinch-zoom rendering. A dedicated <strong>fullscreen mode</strong> lets you inspect large or complex diagrams without distraction. The floating toolbar provides instant access to zoom reset, SVG export, PNG export, and fullscreen toggle.
                    </p>
                    <p>
                        <strong>Version History &amp; Auto-save:</strong> Mermaids.cc automatically saves a snapshot of your work every few minutes. A built-in <strong>version history panel</strong> lets you browse, preview, and restore any previous state of your diagram. You can also trigger a manual save at any time. An auto-save confirmation banner confirms when your work has been persisted locally, so you never lose progress mid-session.
                    </p>
                    <p>
                        <strong>Themes:</strong> The interface ships with multiple visual themes, including a clean Notion-style light mode and a developer-focused dark mode. Switching themes also updates the Mermaid diagram rendering style, so your exported diagrams can match your documentation aesthetic.
>>>>>>> Stashed changes
                    </p>
                </div>
            </details>
        </div>
    );
};
