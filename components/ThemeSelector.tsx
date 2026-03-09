import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { themes, ThemeId } from '../themes';
import { Tooltip } from './Tooltip';

interface ThemeSelectorProps {
    currentTheme: ThemeId;
    onThemeChange: (themeId: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    currentTheme,
    onThemeChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="flex items-center gap-2" ref={dropdownRef}>
            <div className="relative">
                <Tooltip content="Change Theme" position="bottom">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`p-2 rounded-full transition-colors border border-transparent 
                            ${isOpen
                                ? 'bg-[#FFFFFF] text-[#086788] border-[#FFFFFF]'
                                : 'hover:bg-[#FFFFFF] text-[#4A5568]/60 hover:text-[#07A0C3] hover:border-[#FFFFFF]'
                            }`}
                    >
                        <Palette size={18} />
                    </button>
                </Tooltip>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 py-1 rounded-lg shadow-xl bg-[#F7FAFC] border border-[#FFFFFF] block z-50 overflow-hidden">
                        {Object.values(themes).map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    onThemeChange(theme.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2
                  ${currentTheme === theme.id
                                        ? 'bg-[#086788]/10 text-[#086788] font-medium'
                                        : 'text-[#4A5568] hover:bg-[#FFFFFF]'
                                    }
                `}
                            >
                                <div className={`w-3 h-3 rounded-full border border-[#FFFFFF] ${theme.id === 'sketch' ? 'bg-[#fdfbf7]' :
                                    'bg-[#FFFFFF]' // Ocean
                                    }`} />
                                <span>{theme.name}</span>
                                {currentTheme === theme.id && (
                                    <Check size={14} className="ml-auto shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile-friendly select for smaller screens if needed, 
          but simpler to just use the dropdown above which works on click/hover usually 
      */}
        </div>
    );
};
