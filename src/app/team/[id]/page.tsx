'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTeamDetails } from '@/services/api';
import { Shield, Coins, TrendingUp, Users, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Player } from '@/types';

interface TeamDetailsProps {
  params: Promise<{ id: string }>;
}

export default function TeamDetails({ params }: TeamDetailsProps) {
  // Await params using React.use (Next.js 15 standard)
  const { id } = React.use(params);

  // Query team details from API
  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', id],
    queryFn: () => fetchTeamDetails(id),
    enabled: !!id,
    refetchInterval: 1000,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="h-44 bg-slate-800 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-800 rounded" />
          <div className="h-64 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 glass-card rounded-2xl border-red-500/25 max-w-md mx-auto my-12">
        <Shield className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-100">Team Not Found</h2>
        <p className="text-sm text-slate-400 mt-1">
          The team details could not be retrieved. It may have been deleted or the ID is invalid.
        </p>
        <Link href="/" className="mt-4 text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400">
          &larr; Back to Teams
        </Link>
      </div>
    );
  }

  const boughtPlayers = (team.buyedPlayers as Player[]) || [];
  const totalSpent = team.totalSpent || 0;
  const balance = 2000 - totalSpent;
  const totalBudget = 2000;
  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Initials logo fallback
  const initials = team.teamName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teams</span>
        </Link>
      </div>

      {/* Team Profile Banner Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-white/5 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl text-white tracking-widest shadow-xl bg-gradient-to-br ${getFallbackBg(team.teamName)}`}>
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {team.teamName}
                </h1>
              </div>
              <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Active Member Club</span>
              </p>
            </div>
          </div>

          {/* Budget stats */}
          <div className="flex flex-col gap-2 min-w-[200px] bg-slate-950/40 border border-white/5 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span>Budget Usage</span>
              <span className={spentPercentage > 85 ? 'text-rose-400' : 'text-emerald-400'}>
                {spentPercentage}% Spent
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  spentPercentage > 85 
                    ? 'bg-rose-500' 
                    : spentPercentage > 50 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <span>Spent: ₹{totalSpent.toLocaleString('en-IN')}</span>
              <span>Max: ₹{totalBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Remaining Balance</span>
              <span className="text-lg font-black text-amber-400">
                ₹{balance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Spent</span>
              <span className="text-lg font-black text-rose-400">
                ₹{totalSpent.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Squad Strength</span>
              <span className="text-lg font-black text-slate-200">
                {boughtPlayers.length} Players
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bought Players Roster */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Squad Roster</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">
            {boughtPlayers.length} players
          </span>
        </h2>

        {boughtPlayers.length === 0 ? (
          /* Empty squad state */
          <div className="glass-card rounded-2xl p-8 text-center border-dashed border-white/10 max-w-md mx-auto my-6">
            <Users className="w-12 h-12 text-slate-600 mb-3 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">Roster is Empty</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              This team has not bought any players yet in the auction. Go to the Players page to view the list and bid on players for this team.
            </p>
            <Link 
              href="/players"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 transition-all hover:text-white"
            >
              <span>Go to Players Pool</span>
            </Link>
          </div>
        ) : (
          /* Squad list/table */
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-950/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-4 px-6">Player</th>
                    <th className="py-4 px-4">Position</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Place / Age</th>
                    <th className="py-4 px-6 text-right">Acquisition Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {boughtPlayers.map((player) => (
                    <tr key={player._id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Player Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5">
                            {(player.playerName || player.name || 'Unknown Player').charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                              {player.playerName || player.name || 'Unknown Player'}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                              Phone: {player.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-4 px-4 font-semibold text-xs text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                          {player.position.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 font-bold text-xs">
                        <span className={`px-2 py-0.5 rounded ${
                          player.category === 'ICON' 
                            ? 'text-amber-400' 
                            : player.category === 'LEGEND' 
                            ? 'text-rose-400' 
                            : player.category === 'YOUNG' 
                            ? 'text-emerald-400' 
                            : 'text-indigo-400'
                        }`}>
                          {player.category}
                        </span>
                      </td>

                      {/* Age / Place */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{player.place}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{player.age} years old</span>
                          </span>
                        </div>
                      </td>

                      {/* Acquisition Price */}
                      <td className="py-4 px-6 text-right font-black text-slate-200">
                        <div className="flex flex-col justify-end items-end gap-0.5">
                          <span className="text-amber-400 text-sm">
                            ₹{player.soldPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold line-through">
                            Base: ₹{player.basePrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
