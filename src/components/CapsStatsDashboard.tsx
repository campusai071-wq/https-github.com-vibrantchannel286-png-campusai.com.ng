import React from 'react';

const StatCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
  <div className={`p-4 rounded-lg text-white ${colorClass}`}>
    <div className="text-sm font-medium">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export const CapsStatsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">JAMB CAPS Statistics - August 31, 2026</h2>
      
      <section>
        <h3 className="text-lg font-semibold mb-2">Cumulative Till Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Institutions" value="1,801" colorClass="bg-green-600" />
          <StatCard title="Candidates (UTME & DE)" value="2,275,690" colorClass="bg-purple-600" />
          <StatCard title="Qualified (DE)" value="76,628" colorClass="bg-yellow-600" />
          <StatCard title="Qualified (100+)" value="2,127,837" colorClass="bg-blue-600" />
          <StatCard title="Qualified (UTME & DE)" value="2,204,465" colorClass="bg-red-600" />
          <StatCard title="Qualified (140+)" value="2,047,913" colorClass="bg-red-800" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Candidates' O'Level Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="O'Level Results" value="1,139,708" colorClass="bg-green-600" />
          <StatCard title="5 Credits (100+ & DE)" value="1,096,182" colorClass="bg-purple-600" />
          <StatCard title="5 Credits (140+ & DE)" value="1,078,464" colorClass="bg-blue-600" />
          <StatCard title="5 Credits (100+) + ENG + DE" value="1,075,896" colorClass="bg-yellow-600" />
          <StatCard title="5 Credits (100+) + ENG/MATHS + DE" value="1,065,892" colorClass="bg-blue-800" />
          <StatCard title="5 Credits (140+) + ENG + DE" value="1,059,081" colorClass="bg-red-600" />
          <StatCard title="5 Credits (140+) + ENG + MATHS + DE" value="1,049,418" colorClass="bg-red-800" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Admissions' Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard title="Candidates (A)" value="29,904" colorClass="bg-green-600" />
          <StatCard title="Candidates (B)" value="19,781" colorClass="bg-purple-600" />
          <StatCard title="Approved (C)" value="42,702" colorClass="bg-yellow-600" />
          <StatCard title="Accepted (D)" value="69,380" colorClass="bg-blue-800" />
          <StatCard title="Total (A+B+C+D)" value="161,767" colorClass="bg-red-800" />
        </div>
      </section>
    </div>
  );
};
