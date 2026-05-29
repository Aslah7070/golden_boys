'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPlayers } from '@/services/api';
import { useAuctionStore } from '@/store/auctionStore';
import PlayerCard from '@/components/PlayerCard';
import { Search, SlidersHorizontal, RefreshCw, UserX } from 'lucide-react';

export default function PlayersPage() {
  // Read state and filters from Zustand
  const { filters, updateFilters, resetFilters } = useAuctionStore();

  // Fetch players with active filters
  const { data: players, isLoading, error } = useQuery({
    queryKey: ['players', filters],
    queryFn: () => fetchPlayers(filters),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ search: e.target.value });
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ position: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ category: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ status: e.target.value as 'all' | 'sold' | 'unsold' });
  };

  const totalPlayers = players?.length || 0;
  const soldPlayersCount = players?.filter((p) => p.isSold).length || 0;
  const unsoldPlayersCount = totalPlayers - soldPlayersCount;

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Auction Player Pool</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, search, and buy players available in the Golden Boys auction database.
          </p>
        </div>
        
        {/* Quick summary status tags */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-300">
            Total: <strong className="text-slate-100">{isLoading ? '...' : totalPlayers}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/10 text-emerald-400">
            Unsold: <strong className="text-emerald-300">{isLoading ? '...' : unsoldPlayersCount}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/10 text-rose-400">
            Sold: <strong className="text-rose-300">{isLoading ? '...' : soldPlayersCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-5 rounded-2xl glass-card border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          <span>Filters & Search</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search player name..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 text-slate-200 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Position Selector */}
          <div>
            <select
              value={filters.position}
              onChange={handlePositionChange}
              className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl px-3 text-slate-300 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium"
            >
              <option value="">All Positions</option>
              <option value="GOALKEEPER">Goalkeeper</option>
              <option value="DEFENDER">Defender</option>
              <option value="MIDFIELDER">Midfielder</option>
              <option value="LEFT_WING">Left Wing</option>
              <option value="RIGHT_WING">Right Wing</option>
              <option value="STRIKER">Striker</option>
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl px-3 text-slate-300 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium"
            >
              <option value="">All Categories</option>
              <option value="GK">GK (Goalkeeper)</option>
              <option value="ICON">ICON</option>
              <option value="YOUNG">YOUNG</option>
              <option value="LEGEND">LEGEND</option>
            </select>
          </div>

          {/* Sold / Unsold Status Selector */}
          <div>
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl px-3 text-slate-300 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="unsold">Unsold Only</option>
              <option value="sold">Sold Only</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        {(filters.search || filters.position || filters.category || filters.status !== 'all') && (
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider py-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Active Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl text-center max-w-lg mx-auto">
          <p className="text-sm text-red-300 font-semibold">Failed to fetch players</p>
          <p className="text-xs text-red-400 mt-1">{error.message}</p>
        </div>
      )}

      {/* Players Grid */}
      {isLoading ? (
        /* Skeleton Grid */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-[230px] flex flex-col justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/3" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-5 bg-slate-800 rounded w-12" />
                <div className="h-5 bg-slate-800 rounded w-16" />
                <div className="h-5 bg-slate-800 rounded w-14" />
              </div>
              <div className="border-t border-slate-800 mt-4 pt-3 flex justify-between">
                <div className="h-3 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800 rounded w-1/4" />
              </div>
              <div className="h-9 bg-slate-800 rounded-xl mt-4 w-full" />
            </div>
          ))}
        </div>
      ) : players && players.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {players.map((player) => (
            <PlayerCard key={player._id} player={player} />
          ))}
        </div>
      ) : (
        /* Empty Filters State */
        <div className="flex flex-col items-center justify-center text-center p-12 glass-card rounded-3xl border-white/5 max-w-md mx-auto my-6">
          <UserX className="w-12 h-12 text-slate-500/50 mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No Players Found</h3>
          <p className="text-sm text-slate-400 mt-1">
            {"We couldn't find any players that matched your search criteria or filters."}
          </p>
          {(filters.search || filters.position || filters.category || filters.status !== 'all') && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
