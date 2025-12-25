import { type MermaidConfig } from 'mermaid';

export type ThemeId = 'notion' | 'sketch';

export interface Theme {
    id: ThemeId;
    name: string;
    type: 'dark' | 'light';
    ui: {
        background: string;
        text: string;
        headerBg: string;
        editorBg: string;
        editorText: string;
        borderColor: string;
        accent: string;
        diagramBg: string;
    };
    mermaid: {
        theme: MermaidConfig['theme'];
        themeVariables?: any; // Mermaid theme variables are loosely typed
        look?: 'handDrawn' | string;
    };
}

export const themes: Record<ThemeId, Theme> = {
    notion: {
        id: 'notion',
        name: 'Notion Minimalist',
        type: 'light',
        ui: {
            background: 'bg-white',
            text: 'text-gray-900',
            headerBg: 'bg-white',
            editorBg: 'bg-gray-50',
            editorText: 'text-gray-900',
            borderColor: 'border-gray-200',
            accent: 'text-black',
            diagramBg: 'bg-white',
        },
        mermaid: {
            theme: 'neutral',
            themeVariables: {
                primaryColor: '#ffffff',
                primaryTextColor: '#000000',
                lineColor: '#333333',
                mainBkg: '#ffffff',
                textColor: '#000000',
                fontFamily: 'Inter, sans-serif',
            },
        },
    },
    sketch: {
        id: 'sketch',
        name: 'Sketch / Hand-Drawn',
        type: 'light',
        ui: {
            background: 'bg-[#fdfbf7]',  // Paper texture color
            text: 'text-slate-800',
            headerBg: 'bg-[#fdfbf7]',
            editorBg: 'bg-white',
            editorText: 'text-slate-800',
            borderColor: 'border-slate-300',
            accent: 'text-slate-600',
            diagramBg: 'bg-[#fdfbf7]',
        },
        mermaid: {
            theme: 'neutral',
            look: 'handDrawn',
            themeVariables: {
                lineColor: '#555',
                mainBkg: '#ffffff',
                nodeBorder: '2px solid #333',
                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
            },
        },
    },
};
