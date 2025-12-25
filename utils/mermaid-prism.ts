import Prism from 'prismjs';

export const registerMermaid = () => {
    Prism.languages.mermaid = {
        'comment': {
            pattern: /%%.*/,
            greedy: true
        },
        'string': {
            pattern: /"[^"]*"/,
            greedy: true
        },
        'keyword': {
            pattern: /\b(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|zenuml|theme|subgraph|end|click|style|linkStyle|classDef|class|direction|TB|TD|BT|RL|LR)\b/,
            lookbehind: true
        },
        'entity': {
            pattern: /[\[\(\[\{(]+[^\]\)\}\]]+[\]\)\}\)]+/,
            alias: 'variable'
        },
        'operator': {
            pattern: /(\-\-|==|->|==>|-.->|\.|::)/,
            alias: 'operator'
        },
        'arrow': {
            pattern: /[-=]>|[-=]+/,
            alias: 'operator'
        },
        'punctuation': /[{};]/
    };
};
