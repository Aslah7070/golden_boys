'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, ChevronDown, Search } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { fetchPlayers } from '@/services/api';
import { useAuctionStore } from '@/store/auctionStore';

export default function Navbar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const showToast = useAuctionStore((state) => state.showToast);
  const selectedPlayer = useAuctionStore((state) => state.selectedPlayer);
  const setSelectedPlayer = useAuctionStore((state) => state.setSelectedPlayer);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: players } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => fetchPlayers({ search: '', position: '', category: '', status: 'all' }),
    refetchInterval: 1000,
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black border border-amber-500/20 group-hover:border-amber-500/50 transition-colors overflow-hidden p-0.5">
            <img src="/gb.jpeg" alt="Golden Boys Logo" className="w-full h-full object-contain drop-shadow-md" />
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
            className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              pathname === '/' || pathname.startsWith('/team')
                ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500 rounded-b-none'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Teams</span>
          </Link>
          <Link
            href="/players"
            className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              pathname === '/players'
                ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500 rounded-b-none'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Players</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Player Selection Custom Dropdown with Search */}
          <div className="relative w-36 sm:w-44 lg:w-56" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-9 bg-slate-900 border border-white/10 rounded-lg px-3 pr-8 text-slate-300 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold cursor-pointer flex items-center text-left"
            >
              <span className="truncate">
                {selectedPlayer ? `${selectedPlayer.playerName || selectedPlayer.name} (${selectedPlayer.category})` : 'Select Player...'}
              </span>
              <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full mt-1.5 w-[240px] right-0 sm:right-auto sm:w-full bg-slate-900 border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col max-h-[340px] overflow-hidden origin-top-right sm:origin-top">
                <div className="p-2 border-b border-white/5 bg-slate-950 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search player..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded px-3 pl-8 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500 transition-colors"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-1">
                  <button
                    onClick={() => {
                      setSelectedPlayer(null);
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Clear Selection
                  </button>
                  
                  {['GK', 'ICON', 'LEGEND', 'YOUNG', 'GENERAL', 'OTHER'].map(category => {
                    const filteredPlayers = players?.filter(p => {
                      const isOther = !['GK', 'ICON', 'LEGEND', 'YOUNG', 'GENERAL'].includes(p.category);
                      const matchesCategory = category === 'OTHER' ? isOther : p.category === category;
                      if (!matchesCategory) return false;
                      
                      const name = (p.playerName || p.name || '').toLowerCase();
                      return name.includes(searchQuery.toLowerCase());
                    }) || [];
                    
                    if (filteredPlayers.length === 0) return null;
                    
                    return (
                      <div key={category} className="mt-1 mb-1">
                        <div className="px-3 py-1.5 text-[10px] font-black text-amber-500 uppercase tracking-wider bg-slate-950/60 sticky top-0 backdrop-blur-sm z-10 border-y border-white/5">
                          {category}
                        </div>
                        <div className="flex flex-col">
                          {filteredPlayers.map((player) => (
                            <button
                              key={player._id}
                              onClick={() => {
                                setSelectedPlayer(player);
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-amber-500/10 hover:text-amber-100 flex items-center justify-between group transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {(() => {
                                  const photo = player.photo || player.playerImage;
                                  if (photo && !photo.startsWith('/players/default')) {
                                    return <img src={photo} alt={player.playerName || player.name} className="w-5 h-5 rounded-full object-cover shrink-0 border border-white/10" />;
                                  }
                                  return (
                                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/10 text-[8px] font-bold text-slate-400">
                                      {(player.playerName || player.name || 'U').substring(0, 2).toUpperCase()}
                                    </div>
                                  );
                                })()}
                                <span className="font-semibold truncate group-hover:translate-x-1 transition-transform">
                                  {player.playerName || player.name || 'Unknown'}
                                </span>
                              </div>
                              <span className={`text-[9px] uppercase font-black shrink-0 ml-2 ${player.isSold || !!player.team ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {player.isSold || !!player.team ? 'Sold' : 'Unsold'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!players || players.filter(p => (p.playerName || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0) && (
                    <div className="px-3 py-6 text-center text-xs text-slate-500 italic">
                      No players found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
