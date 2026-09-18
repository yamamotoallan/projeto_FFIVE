import React from 'react';

interface SummaryCardProps {
    count: number;
    label: string;
    color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ count, label, color }) => (
    <div className={`bg-white dark:bg-[#1f1a14] p-4 md:p-6 rounded-2xl shadow-sm border-l-4 border-${color}-500 flex flex-col items-center justify-center gap-2`}>
        <span className={`text-3xl md:text-4xl font-black text-${color}-600 dark:text-${color}-400`}>{count}</span>
        <span className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
);

export default SummaryCard;
