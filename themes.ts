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
        name: 'Clean Light',
        type: 'light',
        ui: {
            background: 'bg-[#FFFFFF]',
            text: 'text-[#4A5568]',
            headerBg: 'bg-[#F7FAFC]',
            editorBg: 'bg-[#F7FAFC]',
            editorText: 'text-[#4A5568]',
            borderColor: 'border-[#e2e8f0]',
            accent: 'text-[#086788]',
            diagramBg: 'bg-[#FFFFFF]',
        },
        mermaid: {
            theme: 'default',
            themeVariables: {
                primaryColor: '#F7FAFC',
                primaryTextColor: '#4A5568',
                lineColor: '#086788',
                mainBkg: '#FFFFFF',
                textColor: '#4A5568',
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
