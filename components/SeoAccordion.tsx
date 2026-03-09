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
                        <strong>What is this?</strong> Mermaids.cc is a lightweight, dedicated <strong>Mermaid.js live editor</strong> designed for developers, technical writers, and product managers who need to visualize architecture without friction. Rather than dealing with heavy graphical interfaces, this tool acts as a simple <strong>Markdown to diagram</strong> compiler directly in your browser. Whether you are drafting documentation for a GitHub repository, mapping out microservices, or planning sprint timelines, mermaids.cc provides a clean environment to compile structural code into beautiful visuals instantly. We built this as a fast, accessible <strong>Mermaid syntax previewer</strong> so you can focus on writing logic rather than clicking and dragging shapes.
                    </p>
                    <p>
                        <strong>Supported Diagrams:</strong> The engine parses standard Mermaid syntax, enabling you to generate a wide variety of technical visualizations. Current support includes our highly popular <strong>online sequence diagram generator</strong>, which is perfect for mapping API calls and authentication flows. You can also seamlessly create branching <strong>flowcharts from text</strong>, detailed project management Gantt charts, and complex object-oriented Class diagrams. As the underlying syntax evolves, you can trust our compiler to handle state diagrams, pie charts, and entity-relationship models with the same precision.
                    </p>
                    <p>
                        <strong>Why use this?</strong> We believe technical tooling should be invisible until you need it. Mermaids.cc requires zero configuration and strictly zero logins. The moment you land on the page, the editor is ready. By focusing exclusively on instant live rendering, you eliminate the delay between writing code and seeing the result. The interface is optimized for speed, allowing you to prototype, test your syntax, and export your final architectural models in seconds, completely free.
                    </p>
                </div>
            </details>
        </div>
    );
};
