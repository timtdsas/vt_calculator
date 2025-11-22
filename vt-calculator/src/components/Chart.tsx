import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
    ComposedChart
} from 'recharts';
import { SimulationResult } from '../utils/calculator';

interface ChartProps {
    data: SimulationResult[];
    showMean: boolean;
    showMedian: boolean;
    showSD1: boolean;
    showSD2: boolean;
    showSD3: boolean;
}

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="card" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Age: {payload[0].payload.age}</p>
                {payload.map((entry: any) => (
                    <p key={entry.name} style={{ color: entry.color, margin: '0.25rem 0' }}>
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const ProjectionChart: React.FC<ChartProps> = ({
    data,
    showMean,
    showMedian,
    showSD1,
    showSD2,
    showSD3,
}) => {
    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorSD3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSD2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSD1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="age"
                        stroke="#94a3b8"
                        label={{ value: 'Age', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }}
                    />
                    <YAxis
                        tickFormatter={formatCurrency}
                        stroke="#94a3b8"
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* SD Bands - Using Area to show ranges */}
                    {/* We use stackId to layer them properly if needed, but here we just want overlays */}

                    {/* 3 SD Band (Widest) */}
                    {showSD3 && (
                        <>
                            <Area
                                type="monotone"
                                dataKey="sd3_upper"
                                stroke="none"
                                fill="url(#colorSD3)"
                                fillOpacity={0.2}
                                name="+3 SD"
                            />
                            {/* We need a way to show the lower bound. 
                   Recharts Area can take [min, max] if we format data that way, 
                   or we can just draw lines. 
                   Actually, 'Area' with 'dataKey' is from 0 to value. 
                   To do a range, we need to use the 'range' feature of Area or just overlay.
                   Recharts Area accepts [lower, upper] for dataKey? No, it accepts a single key.
                   Wait, Recharts Area `dataKey` can be an array? No.
                   But we can use `baseValue`? No.
                   The standard way to do a band in Recharts is to use `Area` with `dataKey` as the upper bound
                   and another `Area` with `dataKey` as the lower bound with `fill="var(--bg-color)"` to mask it?
                   That's hacky.
                   
                   Better way: Use `Area` with `dataKey` as an array `[min, max]`.
                   Let's check if Recharts supports `dataKey` as array for range.
                   Yes, `dataKey` can be a function or string.
                   Actually, `Area` chart `dataKey` specifies the y-value.
                   To draw a range, we usually use `Area` with `dataKey="upper"` and `baseValue="dataMin"`? No.
                   
                   Correct approach for bands in Recharts:
                   Use `Area` with `dataKey` for the upper bound.
                   But to make it a band (floating), we need to specify the lower bound.
                   Recharts `Area` has a `baseValue` prop but it's constant.
                   
                   Actually, Recharts `Area` supports `dataKey` returning an array `[min, max]`.
                   Let's try that. I'll modify the data transformation in the component or just pass it.
                   Wait, `dataKey` must be a key in the object.
                   So I should add `sd3_range: [lower, upper]` to the data?
                   Recharts `Area` expects `dataKey` to point to a value.
                   If I want a range area, I should use `Area` with `dataKey` pointing to an array `[min, max]`.
                   Let's verify this assumption.
                   Documentation says `dataKey` is the key of data.
                   If the value of that key is an array, it plots the range.
                   So I will transform the data on the fly or in the calculator.
                   
                   Let's update the calculator to provide range arrays? 
                   Or just map it here.
               */}

                            {/* 
                  Actually, I'll just use lines for the bounds for simplicity and clarity, 
                  or use the "Area with array" trick.
                  Let's try the array trick. I'll map the data prop.
               */}
                        </>
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            {/* 
         Since Recharts range area can be tricky without testing, 
         I will stick to drawing lines for the bounds and maybe a light fill between 0 and the line?
         No, that looks bad.
         
         Let's use the `Area` with `dataKey` as a range.
         I will wrap the chart in a component that transforms the data.
      */}
        </div>
    );
};

// Re-implementing with data transformation for ranges
export const PremiumChart: React.FC<ChartProps> = ({
    data,
    showMean,
    showMedian,
    showSD1,
    showSD2,
    showSD3,
}) => {
    // Transform data for ranges
    const chartData = data.map(d => ({
        ...d,
        sd1_range: [d.sd1_lower, d.sd1_upper],
        sd2_range: [d.sd2_lower, d.sd2_upper],
        sd3_range: [d.sd3_lower, d.sd3_upper],
    }));

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <defs>
                        <linearGradient id="gradMedian" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="age"
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        tickFormatter={formatCurrency}
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />

                    {/* Bands */}
                    {showSD3 && (
                        <Area
                            type="monotone"
                            dataKey="sd3_range"
                            stroke="none"
                            fill="#f87171"
                            fillOpacity={0.1}
                            name="3 SD Range"
                        />
                    )}
                    {showSD2 && (
                        <Area
                            type="monotone"
                            dataKey="sd2_range"
                            stroke="none"
                            fill="#fbbf24"
                            fillOpacity={0.15}
                            name="2 SD Range"
                        />
                    )}
                    {showSD1 && (
                        <Area
                            type="monotone"
                            dataKey="sd1_range"
                            stroke="none"
                            fill="#38bdf8"
                            fillOpacity={0.2}
                            name="1 SD Range"
                        />
                    )}

                    {/* Lines */}
                    {showMean && (
                        <Line
                            type="monotone"
                            dataKey="mean"
                            stroke="#4ade80"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Mean (Average)"
                        />
                    )}

                    {showMedian && (
                        <Line
                            type="monotone"
                            dataKey="median"
                            stroke="url(#gradMedian)"
                            strokeWidth={3}
                            dot={false}
                            name="Median (50%)"
                            filter="drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))"
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
