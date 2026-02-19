'use client';

import React from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { motion } from 'framer-motion';

export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'area';
    title: string;
    data: any[];
    dataKey: string; // Key for the value (e.g., 'sales', 'price')
    nameKey: string; // Key for the label (e.g., 'month', 'product')
    color?: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 border border-gray-100 dark:border-white/10 rounded-xl shadow-xl">
                <p className="font-bold text-gray-800 dark:text-gray-200 text-xs mb-1">{label}</p>
                <p className="text-blue-600 font-black text-sm">
                    {payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const AIChartWidget: React.FC<{ chart: ChartData }> = ({ chart }) => {
    const { type, title, data, dataKey, nameKey, color = '#3b82f6' } = chart;

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} animationDuration={1500} />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} animationDuration={1500} />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill="url(#colorValue)" animationDuration={1500} />
                    </AreaChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey={dataKey}
                            nameKey={nameKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm mx-auto mt-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-lg"
        >
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 text-center">{title}</h4>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart() || <div>Invalid Chart Type</div>}
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default AIChartWidget;
