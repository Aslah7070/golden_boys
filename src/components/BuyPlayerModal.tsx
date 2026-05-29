'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuctionStore } from '@/store/auctionStore';
import { fetchTeams, buyPlayer } from '@/services/api';
import { X, Gavel, Coins, AlertCircle } from 'lucide-react';

export default function BuyPlayerModal() {
  const queryClient = useQueryClient();
  
  // Zustand State
  const selectedPlayer = useAuctionStore((state) => state.selectedPlayer);
  const isBuyModalOpen = useAuctionStore((state) => state.isBuyModalOpen);
  const setSelectedPlayer = useAuctionStore((state) => state.setSelectedPlayer);
  const setBuyModalOpen = useAuctionStore((state) => state.setBuyModalOpen);
  const showToast = useAuctionStore((state) => state.showToast);

  // Local Form State
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [validationError, setValidationError] = useState('');

  // Fetch teams to populate the dropdown
  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    enabled: isBuyModalOpen, // Only fetch when modal is open
  });

  // Set default bid amount when player changes
  useEffect(() => {
    if (selectedPlayer) {
      setBidAmount(selectedPlayer.basePrice);
      setValidationError('');
      setSelectedTeamId('');
    }
  }, [selectedPlayer]);

  // Reset validation error on input change
  useEffect(() => {
    setValidationError('');
  }, [selectedTeamId, bidAmount]);

  // Mutation for buying player
  const buyMutation = useMutation({
    mutationFn: buyPlayer,
    onSuccess: (data) => {
      showToast(
        `SUCCESS: ${selectedPlayer?.playerName} has been sold to ${data.teamName} for ₹${data.player.soldPrice.toLocaleString('en-IN')}!`,
        'success'
      );
      
      // Invalidate relevant queries to refresh lists and detail pages
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (selectedTeamId) {
        queryClient.invalidateQueries({ queryKey: ['team', selectedTeamId] });
      }

      // Close modal
      handleClose();
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to complete transaction.', 'error');
    },
  });

  if (!isBuyModalOpen || !selectedPlayer) return null;

  const handleClose = () => {
    setBuyModalOpen(false);
    setSelectedPlayer(null);
    setSelectedTeamId('');
    setValidationError('');
  };

  const selectedTeam = teams?.find((t) => t._id === selectedTeamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      setValidationError('Please select a team.');
      return;
    }

    if (!selectedTeam) {
      setValidationError('Selected team is invalid.');
      return;
    }

    if (bidAmount < selectedPlayer.basePrice) {
      setValidationError(`Bid amount must be at least the base price of ₹${selectedPlayer.basePrice.toLocaleString('en-IN')}.`);
      return;
    }

    if (bidAmount > selectedTeam.balance) {
      setValidationError(`Insufficient team balance. ${selectedTeam.teamName} only has ₹${selectedTeam.balance.toLocaleString('en-IN')} left.`);
      return;
    }

    // Trigger purchase
    buyMutation.mutate({
      playerId: selectedPlayer._id,
      teamId: selectedTeamId,
      bidAmount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0d1520] border border-white/10 shadow-2xl p-6 sm:p-8 animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
              <Gavel className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Buy Player System</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Player Details Card */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/40 border border-white/5 flex gap-4">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center font-extrabold shrink-0">
            {selectedPlayer.playerName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-200">{selectedPlayer.playerName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase font-semibold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                {selectedPlayer.position.replace('_', ' ')}
              </span>
              <span className="text-[10px] uppercase font-semibold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                {selectedPlayer.category}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Base: ₹{selectedPlayer.basePrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Select Team */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Select Bidding Team
            </label>
            {isLoadingTeams ? (
              <div className="h-11 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
            ) : !teams || teams.length === 0 ? (
              <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>No teams found. Please seed the database first!</span>
              </div>
            ) : (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                required
                className="w-full h-11 bg-slate-900 border border-white/10 rounded-xl px-3 text-slate-200 text-sm font-semibold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              >
                <option value="">-- Choose Team --</option>
                {teams.map((team) => {
                  const isUnderfunded = team.balance < selectedPlayer.basePrice;
                  return (
                    <option
                      key={team._id}
                      value={team._id}
                      disabled={isUnderfunded}
                      className={isUnderfunded ? 'text-slate-600' : 'text-slate-200'}
                    >
                      {team.teamName} (Bal: ₹{team.balance.toLocaleString('en-IN')})
                      {isUnderfunded ? ' - Insufficient Balance' : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Bid Amount */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Bid Amount (₹)
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min={selectedPlayer.basePrice}
                step={500}
                value={bidAmount || ''}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                required
                placeholder="Enter bid price"
                className="w-full h-11 bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 text-slate-200 text-sm font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {validationError && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{validationError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-sm font-bold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={buyMutation.isPending || !selectedTeamId}
              className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-sm font-black text-slate-950 shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Gavel className="w-4 h-4" />
              <span>{buyMutation.isPending ? 'Bidding...' : 'Confirm Buy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
