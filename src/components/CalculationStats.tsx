import React, { useEffect, useState } from 'react';
import { getDailyCalculationCounts } from '../services/statsService';

const CalculationStats: React.FC = () => {
    const [stats, setStats] = useState<{ date: string; count: number }[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getDailyCalculationCounts();
            setStats(data);
        };
        fetchStats();
    }, []);

    return (
        <div className="pt-24 p-6">
            <h2 className="text-2xl font-bold mb-4">Calculation Statistics</h2>
            <div className="bg-white p-6 rounded-xl shadow">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="p-2">Date</th>
                            <th className="p-2">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map(s => (
                            <tr key={s.date} className="border-b">
                                <td className="p-2">{s.date}</td>
                                <td className="p-2">{s.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CalculationStats;
