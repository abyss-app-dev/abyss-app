import type React from 'react';
import { useState } from 'react';

interface DataPoint {
    label: string;
    value: number;
    color?: string;
}

interface DataVisualizationWidgetProps {
    title: string;
    data: DataPoint[];
    chartType: 'bar' | 'pie' | 'line';
    onUpdate: (updates: { title?: string; data?: DataPoint[]; chartType?: 'bar' | 'pie' | 'line' }) => void;
}

export const DataVisualizationWidget: React.FC<DataVisualizationWidgetProps> = ({ title, data, chartType, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<DataPoint[]>(data);

    const addDataPoint = () => {
        const newData = [...editData, { label: 'New Item', value: 0 }];
        setEditData(newData);
        onUpdate({ data: newData });
    };

    const updateDataPoint = (index: number, field: keyof DataPoint, value: string | number) => {
        const newData = editData.map((item, i) => (i === index ? { ...item, [field]: value } : item));
        setEditData(newData);
        onUpdate({ data: newData });
    };

    const removeDataPoint = (index: number) => {
        const newData = editData.filter((_, i) => i !== index);
        setEditData(newData);
        onUpdate({ data: newData });
    };

    const maxValue = Math.max(...data.map(d => d.value)) || 1;

    const renderBarChart = () => (
        <div className="space-y-2">
            {data.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <span className="w-20 text-sm truncate">{point.label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                        <div
                            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${(point.value / maxValue) * 100}%` }}
                        />
                    </div>
                    <span className="w-12 text-sm text-right">{point.value}</span>
                </div>
            ))}
        </div>
    );

    const renderPieChart = () => {
        const total = data.reduce((sum, point) => sum + point.value, 0);
        let cumulativeAngle = 0;

        return (
            <div className="flex justify-center">
                <svg width="150" height="150" viewBox="0 0 150 150">
                    <title>Pie chart visualization</title>
                    <circle cx="75" cy="75" r="70" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                    {data.map((point, index) => {
                        const angle = (point.value / total) * 360;
                        const x1 = 75 + 60 * Math.cos(((cumulativeAngle - 90) * Math.PI) / 180);
                        const y1 = 75 + 60 * Math.sin(((cumulativeAngle - 90) * Math.PI) / 180);
                        const x2 = 75 + 60 * Math.cos(((cumulativeAngle + angle - 90) * Math.PI) / 180);
                        const y2 = 75 + 60 * Math.sin(((cumulativeAngle + angle - 90) * Math.PI) / 180);

                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const sweepFlag = 1;

                        const pathData = ['M', 75, 75, 'L', x1, y1, 'A', 60, 60, 0, largeArcFlag, sweepFlag, x2, y2, 'Z'].join(' ');

                        const color = point.color || `hsl(${(index * 360) / data.length}, 70%, 60%)`;
                        cumulativeAngle += angle;

                        return <path key={index} d={pathData} fill={color} stroke="white" strokeWidth="1" />;
                    })}
                </svg>
            </div>
        );
    };

    const renderLineChart = () => {
        if (data.length === 0) return <div className="text-center py-8 text-gray-500">No data to display</div>;

        const width = 300;
        const height = 150;
        const padding = 20;

        const points = data
            .map((point, index) => {
                const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
                const y = height - padding - (point.value / maxValue) * (height - 2 * padding);
                return `${x},${y}`;
            })
            .join(' ');

        return (
            <div className="flex justify-center">
                <svg width={width} height={height} className="border border-gray-200">
                    <title>Line chart visualization</title>
                    <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />
                    {data.map((point, index) => {
                        const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
                        const y = height - padding - (point.value / maxValue) * (height - 2 * padding);
                        return <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6" />;
                    })}
                </svg>
            </div>
        );
    };

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return renderBarChart();
            case 'pie':
                return renderPieChart();
            case 'line':
                return renderLineChart();
            default:
                return renderBarChart();
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    value={title}
                    onChange={e => onUpdate({ title: e.target.value })}
                    className="font-semibold text-lg bg-transparent border-none outline-none"
                    placeholder="Chart Title"
                />
                <div className="flex space-x-2">
                    <select
                        value={chartType}
                        onChange={e => onUpdate({ chartType: e.target.value as any })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="line">Line Chart</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                        {isEditing ? 'Done' : 'Edit Data'}
                    </button>
                </div>
            </div>

            {renderChart()}

            {isEditing && (
                <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Edit Data Points:</h4>
                    {editData.map((point, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={point.label}
                                onChange={e => updateDataPoint(index, 'label', e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Label"
                            />
                            <input
                                type="number"
                                value={point.value}
                                onChange={e => updateDataPoint(index, 'value', Number.parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Value"
                            />
                            <button
                                type="button"
                                onClick={() => removeDataPoint(index)}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addDataPoint}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                        + Add Data Point
                    </button>
                </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
                Total data points: {data.length} | Chart type: {chartType}
            </div>
        </div>
    );
};
