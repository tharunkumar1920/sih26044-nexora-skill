import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StudentSkill } from '../types';

interface SkillRadarChartProps {
  skills: StudentSkill[];
  targetRole?: string;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ skills, targetRole = "Data Analyst" }) => {
  // Transform student skills into radar chart data
  const data = skills.slice(0, 6).map(s => {
    // Generate realistic target role benchmark for comparison
    let target = 75;
    if (s.skill_name === 'SQL') target = 80;
    if (s.skill_name === 'Git') target = 65;
    if (s.skill_name === 'Communication') target = 80;
    if (s.skill_name === 'Machine Learning') target = 75;

    return {
      skill: s.skill_name,
      studentScore: Math.round(s.proficiency_level),
      targetRequirement: target
    };
  });

  if (data.length === 0) {
    return <div className="text-center py-10 text-slate-400">No skill data available for Radar plot</div>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Radar
            name="Your Skill Score"
            dataKey="studentScore"
            stroke="#16a34a"
            fill="#22c55e"
            fillOpacity={0.45}
          />
          <Radar
            name={`${targetRole} Requirement`}
            dataKey="targetRequirement"
            stroke="#6366f1"
            fill="#818cf8"
            fillOpacity={0.2}
            strokeDasharray="4 4"
          />
          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
