import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    message,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#FFFFFF] border border-[#e2e8f0] rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 shadow-[#086788]/10">
                <h3 className="text-[#4A5568] font-medium text-base mb-6 text-center">
                    {message}
                </h3>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-[#4A5568] bg-[#F7FAFC] hover:bg-[#e2e8f0] border border-[#CBD5E1] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#EE6055] hover:bg-[#d65147] transition-colors shadow-lg shadow-[#EE6055]/20"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
