'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, Database, ChevronDown } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { seedDatabase, fetchPlayers } from '@/services/api';
import { useAuctionStore } from '@/store/auctionStore';

export default function Navbar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const showToast = useAuctionStore((state) => state.showToast);
  const selectedPlayer = useAuctionStore((state) => state.selectedPlayer);
  const setSelectedPlayer = useAuctionStore((state) => state.setSelectedPlayer);

  const { data: players } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => fetchPlayers({ search: '', position: '', category: '', status: 'all' }),
    refetchInterval: 1000,
  });

  // Database Seed Mutation
  const seedMutation = useMutation({
    mutationFn: seedDatabase,
    onSuccess: (data) => {
      showToast(data.message || 'Database seeded successfully!', 'success');
      // Invalidate all queries to refresh the UI
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to seed database.', 'error');
    },
  });

  const handleSeed = () => {
    if (confirm('Are you sure you want to reset and seed the database with mock data? Current teams/players will be cleared.')) {
      seedMutation.mutate();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            GOLDEN BOYS
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-wider">
            Lelam Vili
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-6">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              pathname === '/' || pathname.startsWith('/team')
                ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500 rounded-b-none'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Teams</span>
          </Link>
          <Link
            href="/players"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              pathname === '/players'
                ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500 rounded-b-none'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Players</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Player Selection Dropdown */}
          <div className="relative w-44 sm:w-56">
            <select
              value={selectedPlayer?._id || ''}
              onChange={(e) => {
                const player = players?.find((p) => p._id === e.target.value) || null;
                setSelectedPlayer(player);
              }}
              className="w-full h-9 bg-slate-900 border border-white/10 rounded-lg px-3 pr-8 text-slate-300 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold appearance-none cursor-pointer"
            >
              <option value="" className="text-slate-500">Select Player...</option>
              {players?.map((player) => (
                <option key={player._id} value={player._id} className="bg-slate-950 text-slate-300">
                  {player.playerName || player.name || 'Unknown Player'} ({player.category} - {player.isSold || !!player.team ? 'Sold' : 'Unsold'})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handleSeed}
              disabled={seedMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-sm transition-all hover:bg-slate-800 hover:text-white hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database className="h-3.5 w-3.5" />
              <span>{seedMutation.isPending ? 'Seeding...' : 'Seed Mock DB'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
