import Link from 'next/link';
import { Team } from '@/types';
import { Shield, Coins, Users } from 'lucide-react';

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  // Manager counts as the first slot
  const playerCount = (team.buyedPlayers?.length || 0) + 1;

  // Generate initials for fallback logo
  const initials = team.teamName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Generate background color based on team name for unique visual fallback
  const getFallbackBg = (name: string) => {
    const colors = [
      'from-emerald-600 to-teal-800',
      'from-amber-500 to-amber-700',
      'from-blue-600 to-indigo-800',
      'from-red-600 to-rose-800',
      'from-purple-600 to-indigo-800',
      'from-sky-500 to-blue-700',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <Link href={`/team/${team._id}`} className="group block ">
      <div className="glass-card glass-card-hover rounded-2xl p-6 h-full flex flex-col justify-between transition-all duration-300 relative overflow-hidden">
        {/* Glow top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div>
          {/* Header with Team Logo/Fallback */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white tracking-wider shadow-lg bg-gradient-to-br ${getFallbackBg(team.teamName)}`}>
              {initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                {team.teamName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Club Team</span>
              </div>
            </div>
          </div>

          {/* Stats Divider */}
          <div className="my-6 border-t border-white/5" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Remaining Balance</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-base font-bold text-amber-400">
                  ₹{team.balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Players Bought</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-base font-bold text-slate-100">
                  {playerCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Indicator */}
        <div className="mt-6 flex items-center justify-end text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">
          <span>View Team Details &rarr;</span>
        </div>
      </div>
    </Link>
  );
}
