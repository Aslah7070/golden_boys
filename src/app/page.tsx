'use client';

import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';

const triggerConfetti = () => {
  const end = Date.now() + 3 * 1000; // 3 seconds
  const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
};
import Link from 'next/link';
import { fetchTeams, fetchPlayers, seedDatabase } from '@/services/api';
import { Team, Player } from '@/types';
import { Trophy, ShieldAlert, Sparkles, User } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuctionStore } from '@/store/auctionStore';


// Unique visual fallback for team logos
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

function CompactTeamCard({ team }: { team: Team }) {
  const playerCount = team.buyedPlayers.length;
  const initials = team.teamName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const remainingSlots = team.remainingSlots !== undefined ? team.remainingSlots : Math.max(0, 10 - playerCount);
  const managerImage = team.managerImage && team.managerImage !== '/managers/default.png' ? team.managerImage : '/managers/default.png';
  const managerName = team.managerName || 'TBD';
  const managerInitials = managerName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const coverImage = team.coverImage && team.coverImage !== '/teams/covers/default.jpg' ? team.coverImage : 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop';

  return (
    <Link href={`/team/${team._id}`} className="group block w-[calc(50%-7px)] sm:w-[180px] lg:w-[240px] aspect-[3/4]">
      <div className="rounded-2xl p-4 flex flex-col justify-between items-start text-left transition-all duration-300 border border-zinc-800 bg-[#18191d] shadow-xl w-full h-full hover:border-zinc-700 hover:bg-[#1f2127]">
        {/* Team Logo and Vertical Slots Container (Relative layout for perfect center alignment) */}
        <div className="w-full flex justify-center items-center mt-3 mb-2 shrink-0 relative px-1">
          {/* Perfectly Centered Team Logo */}
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-black text-white text-lg sm:text-xl tracking-widest bg-gradient-to-br ${getFallbackBg(team.teamName)} shadow-lg shadow-black/50 border-2 border-zinc-700 group-hover:scale-105 transition-transform duration-300`}>
            {team.logo && team.logo !== '/teams/default.png' && !team.logo.startsWith('/teams/default') ? (
              <img src={team.logo} alt={team.teamName} className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          
          {/* Vertical Slots in a 2x5 Grid - Absolutely Positioned on the Right Side of Logo */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center select-none bg-zinc-950/45 border border-zinc-800/40 rounded-xl p-1.5 sm:p-2 backdrop-blur-sm z-20 shadow-md">
            <span className="text-[6.5px] text-zinc-500 uppercase font-black tracking-wider leading-none mb-1.5">Slots</span>
            
            {/* 2 columns side-by-side, each with 5 checkboxes */}
            <div className="flex gap-1.5">
              {/* Left Column (Slots 1-5) */}
              <div className="flex flex-col gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <input
                    key={i}
                    type="checkbox"
                    checked={i < playerCount}
                    readOnly
                    className="w-2.2 h-2.2 sm:w-2.8 sm:h-2.8 rounded-[2px] border-zinc-800 bg-zinc-950 accent-purple-500 cursor-default shrink-0 focus:ring-0 focus:ring-offset-0 pointer-events-none"
                  />
                ))}
              </div>
              
              {/* Right Column (Slots 6-10) */}
              <div className="flex flex-col gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <input
                    key={i + 5}
                    type="checkbox"
                    checked={(i + 5) < playerCount}
                    readOnly
                    className="w-2.2 h-2.2 sm:w-2.8 sm:h-2.8 rounded-[2px] border-zinc-800 bg-zinc-950 accent-purple-500 cursor-default shrink-0 focus:ring-0 focus:ring-offset-0 pointer-events-none"
                  />
                ))}
              </div>
            </div>
            
            <span className="text-[6.5px] text-zinc-400 font-bold uppercase tracking-wider leading-none mt-1.5">{playerCount}/10</span>
          </div>
        </div>

        {/* Title & Manager Info */}
        <div className="w-full mt-3">
          <h3 className="text-xs sm:text-sm font-black text-white truncate w-full" title={team.teamName}>
            {team.teamName}
          </h3>
          
          {/* Manager row */}
          <div className="flex items-center gap-2 mt-2 w-full">
            {team.managerImage && team.managerImage !== '/managers/default.png' && !team.managerImage.startsWith('/managers/default') ? (
              <img
                src={team.managerImage}
                alt={managerName}
                className="w-7 h-7 rounded-full border border-zinc-800 object-cover bg-zinc-900 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                {managerInitials}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] text-zinc-500 uppercase font-black leading-none">Manager</span>
              <span className="text-[10px] font-bold text-zinc-300 truncate mt-1 leading-none">{managerName}</span>
            </div>
          </div>
        </div>

          {/* Overlapping Avatar Stack of Signed Players (Rendered Separately Under Checkboxes) */}
          {playerCount > 0 && (
            <div className="flex flex-wrap items-center mt-3 -space-x-1.5 pl-0.5">
              {team.buyedPlayers.map((player: Player, index) => {
                const photo = player.photo || player.playerImage;
                const pName = player.playerName || player.name || 'Player';
                return (
                  <div key={player._id || index} className="relative group/avatar shrink-0 z-10 hover:z-30 transition-all">
                    {/* Circle Avatar */}
                    <div className="w-5.5 h-5.5 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center shadow-md hover:scale-110 hover:border-purple-500 transition-all duration-200 cursor-pointer">
                      {photo && photo !== '/players/default.png' && !photo.startsWith('/players/default') ? (
                        <img src={photo} alt={pName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[7px] font-black text-purple-400">
                          {pName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/avatar:opacity-100 translate-y-2 group-hover/avatar:translate-y-0 transition-all duration-300 z-50 flex flex-col items-center">
                      <div className="bg-zinc-950/95 border border-zinc-800 text-white rounded-lg p-2 shadow-2xl flex items-center gap-2.5 whitespace-nowrap backdrop-blur-md">
                        {/* Player Thumbnail */}
                        <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shrink-0 bg-zinc-900 flex items-center justify-center">
                          {photo && photo !== '/players/default.png' && !photo.startsWith('/players/default') ? (
                            <img src={photo} alt={pName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-[10px] font-black text-purple-400">
                              {pName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {/* Player Details */}
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-black text-white leading-none">
                            {pName}
                          </span>
                          <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1 leading-none">
                            {player.position.replace('_', ' ')} • ₹{(player.soldPrice || player.currentBid || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      {/* Triangle Pointer */}
                      <div className="w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45 -mt-1 shadow-md" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* Footer with Balance and Spent */}
        <div className="w-full pt-3 border-t border-zinc-800/60 mt-auto grid grid-cols-2 gap-3 text-left">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider leading-none">Spent</span>
            <span className="text-[13px] sm:text-[15px] font-black text-rose-500 font-mono mt-1 leading-none">
              ₹{team.totalSpent.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider leading-none">Balance</span>
            <span className="text-[13px] sm:text-[15px] font-black text-emerald-400 font-mono mt-1 leading-none">
              ₹{(2000 - team.totalSpent).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Generate dynamic stable FIFA card stats based on player metadata
const getFifaStats = (player: Player) => {
  const name = player.playerName;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const getVal = (offset: number, min = 65, max = 99) => {
    return Math.abs((hash + offset) % (max - min + 1)) + min;
  };

  const rating = player.category === 'LEGEND' ? getVal(10, 97, 101) :
    player.category === 'ICON' ? getVal(10, 93, 96) :
      player.category === 'YOUNG' ? getVal(10, 84, 89) :
        player.category === 'GENERAL' ? getVal(10, 78, 83) : getVal(10, 88, 92);

  const posMap: Record<string, string> = {
    'GOALKEEPER': 'GK',
    'DEFENDER': 'CB',
    'MIDFIELDER': 'CM',
    'LEFT_WING': 'LW',
    'RIGHT_WING': 'RW',
    'STRIKER': 'ST'
  };
  const pos = posMap[player.position] || 'ST';

  // Stats
  let pac = getVal(1, 75, 99);
  let sho = getVal(2, 65, 99);
  let pas = getVal(3, 65, 99);
  let dri = getVal(4, 75, 99);
  let def = getVal(5, 45, 99);
  let phy = getVal(6, 65, 99);

  if (player.position === 'DEFENDER') {
    def = getVal(5, 88, 99);
    phy = getVal(6, 88, 99);
    sho = getVal(2, 45, 75);
  } else if (player.position === 'STRIKER' || player.position === 'LEFT_WING' || player.position === 'RIGHT_WING') {
    pac = getVal(1, 88, 99);
    sho = getVal(2, 85, 99);
    def = getVal(5, 35, 65);
  } else if (player.position === 'GOALKEEPER') {
    pac = getVal(1, 85, 99); // DIV
    sho = getVal(2, 85, 99); // HAN
    pas = getVal(3, 75, 96); // KIC
    dri = getVal(4, 88, 99); // REF
    def = getVal(5, 55, 92); // SPD
    phy = getVal(6, 85, 99); // POS
  }

  // Label Mapping
  const labels = player.position === 'GOALKEEPER'
    ? { s1: 'DIV', s2: 'HAN', s3: 'KIC', s4: 'REF', s5: 'SPD', s6: 'POS' }
    : { s1: 'PAC', s2: 'SHO', s3: 'PAS', s4: 'DRI', s5: 'DEF', s6: 'PHY' };

  return { rating, pos, pac, sho, pas, dri, def, phy, labels };
};

// Generate dynamic stable Match Attax card stats based on player metadata
const getMatchAttaxStats = (player: Player) => {
  const name = player?.playerName || player?.name || 'Unknown';
  const pos = player?.position || 'STRIKER';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const getVal = (offset: number, min = 50, max = 99) => {
    return Math.abs((hash + offset) % (max - min + 1)) + min;
  };

  const speed = getVal(1, 60, 99);
  const shoot = getVal(2, 50, 99);
  const pass = getVal(3, 50, 99);
  const skill = getVal(4, 60, 99);
  const tackle = getVal(5, 40, 99);
  const power = getVal(6, 50, 99);

  let defenceRating = 0;
  let attackRating = 0;

  if (pos === 'GOALKEEPER') {
    defenceRating = Math.round((tackle + power + speed) / 3) + 12;
    attackRating = Math.round((shoot + pass + skill) / 3) - 25;
  } else if (pos === 'DEFENDER') {
    defenceRating = Math.round((tackle * 0.75) + (power * 0.25));
    attackRating = Math.round((speed * 0.25) + (pass * 0.45) + (skill * 0.3));
  } else if (pos === 'MIDFIELDER') {
    defenceRating = Math.round((tackle * 0.45) + (power * 0.45) + (speed * 0.1));
    attackRating = Math.round((shoot * 0.35) + (pass * 0.45) + (skill * 0.2));
  } else { // Striker / Wingers
    defenceRating = Math.round((tackle * 0.15) + (power * 0.25));
    attackRating = Math.round((speed * 0.3) + (shoot * 0.45) + (skill * 0.25));
  }

  // Bound check
  defenceRating = Math.max(15, Math.min(99, defenceRating));
  attackRating = Math.max(15, Math.min(99, attackRating));

  // Label Mapping
  const labels = pos === 'GOALKEEPER'
    ? { l1: 'DIVING', l2: 'HANDLING', l3: 'KICKING', r1: 'REFLEXES', r2: 'SPEED', r3: 'POSITION' }
    : { l1: 'SPEED', l2: 'TACKLE', l3: 'POWER', r1: 'SHOOT', r2: 'SKILL', r3: 'PASS' };

  const positionName = pos.replace('_', ' ');

  return { speed, shoot, pass, skill, tackle, power, defenceRating, attackRating, positionName, labels };
};

function FifaPlayerCard({ player }: { player: Player }) {
  const stats = getMatchAttaxStats(player);
  const playerName = player?.playerName || player?.name || 'Unknown Player';
  const initials = playerName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const displayName = playerName.split(' ').pop() || playerName;
  const soldToTeam = (player?.soldTo && typeof player.soldTo === 'object') 
    ? player.soldTo 
    : ((player?.team && typeof player.team === 'object') ? player.team : null);

  // Truncate player name for vertical text if too long
  const verticalName = playerName.length > 14
    ? playerName.slice(0, 13) + '..'
    : playerName;

  return (
    <div className="flex flex-col items-center animate-fade-in-up">
      {/* Match Attax Card Container (Scaled up slightly to 352x495) */}
      <div className="relative w-[352px] h-[495px] rounded-xl overflow-hidden bg-gradient-to-br from-[#2a2c2e] via-[#4d5053] to-[#1c1e20] p-[5px] shadow-2xl transition-all duration-500 ease-out hover:scale-[1.05] group select-none">

        {/* Shiny foil overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-20 pointer-events-none" />

        {/* Inner Card (Deep Red Gradient Background) */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#3a0d0d] via-[#1a0808] to-[#0a0404] rounded-[8px] overflow-hidden flex flex-col justify-between">

          {/* Background SVG Grid Pattern & Circles */}
          <svg viewBox="0 0 280 390" className="absolute inset-0 w-full h-full pointer-events-none z-10" fill="none">
            <defs>
              <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 0 8 L 8 0 M 0 0 L 8 8" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="280" height="390" fill="url(#crosshatch)" />

            {/* Concentric rings centered at (140, 125) */}
            <circle cx="140" cy="125" r="140" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <circle cx="140" cy="125" r="100" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            <circle cx="140" cy="125" r="60" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

            {/* Internal black outline */}
            <rect x="6" y="6" width="258" height="368" rx="4" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          </svg>

          {/* Left Vertical Player Name Banner (scaled to 1.15x, adjusted for 352x495) */}
          <div className="absolute left-[12px] top-[12px] bottom-[145px] w-[33px] bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm flex flex-col justify-between items-center py-3 z-25">
            {/* Stars */}
            <div className="flex flex-col gap-0.5 text-[#c59b72] text-[11px] select-none leading-none">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
            {/* Vertical Name */}
            <div
              className="font-black text-[#c59b72] text-[12.5px] tracking-[0.15em] uppercase select-none my-auto shrink-0"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                textOrientation: 'mixed',
                whiteSpace: 'nowrap'
              }}
            >
              {verticalName}
            </div>
          </div>

          {/* Right Vertical Edition Banner (scaled to 1.15x, adjusted for 352x495) */}
          <div className="absolute right-[12px] top-[12px] bottom-[145px] w-[27px] bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm flex flex-col justify-center items-center py-2.5 z-25">
            <div
              className="font-black text-[#c59b72] text-[9.5px] tracking-[0.1em] uppercase select-none opacity-80 shrink-0"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                whiteSpace: 'nowrap'
              }}
            >
              GOLDEN BOYS LIMITED EDITION
            </div>
          </div>

          {/* Top Right Team/Badge Emblem */}
          <div className="absolute top-[12px] right-[51px] z-25">
            {soldToTeam ? (
              <div className="w-10 h-10 rounded-full border border-white/20 bg-black/80 flex items-center justify-center overflow-hidden shadow-lg" title={soldToTeam.teamName}>
                {soldToTeam.logo ? (
                  <img src={soldToTeam.logo} alt={soldToTeam.teamName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-white text-[10px] uppercase tracking-wider">
                    {soldToTeam.teamName.slice(0, 2)}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full border border-[#c59b72]/40 bg-zinc-950 flex items-center justify-center overflow-hidden shadow-lg">
                <span className="font-black text-[#c59b72] text-[14px] leading-none animate-pulse">★</span>
              </div>
            )}
          </div>

          {/* Player Portrait Image */}
          <div className="absolute top-[12px] left-[46px] right-[46px] bottom-[145px] flex items-end justify-center z-20 overflow-hidden">
            {(player?.photo || player?.playerImage) && (player.photo || player.playerImage) !== '/players/default.png' && !(player.photo || player.playerImage)?.startsWith('/players/default') ? (
              <img
                src={player.photo || player.playerImage}
                alt={playerName}
                className="w-full h-[95%] object-cover object-top filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] scale-[1.05] transition-transform duration-500 group-hover:scale-[1.10]"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)'
                }}
              />
            ) : (
              /* Fallback Initials */
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-800 to-black border-2 border-[#c59b72]/30 flex items-center justify-center shadow-2xl relative mb-8">
                <div className="absolute inset-0.5 rounded-full bg-black/70" />
                <span className="relative font-black text-3xl tracking-widest text-[#c59b72] drop-shadow-md">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Player Name Text (aligned above divide line) */}
          <div className="absolute top-[332px] left-0 right-0 text-center z-25">
            <h3
              className="font-black text-[#c59b72] text-[22px] tracking-widest uppercase leading-none px-[53px] truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {displayName}
            </h3>
          </div>

          {/* Bottom Stats Grid (Match Attax Slanted Block Style) */}
          <div className="absolute top-[372px] left-[12px] right-[12px] h-[84px] bg-black/75 backdrop-blur-sm border-t border-b border-white/10 py-[9px] px-[11px] z-25 flex justify-between gap-2 rounded-sm">
            {/* Left Column (Speed, Tackle, Power) */}
            <div className="flex flex-col gap-1 w-[48%] justify-center">
              {/* Stat 1 */}
              <div className="flex items-stretch h-[19px] gap-0.5">
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[12px] w-[31px] flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.speed}</span>
                </div>
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[9.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.l1}</span>
                </div>
              </div>
              {/* Stat 2 */}
              <div className="flex items-stretch h-[19px] gap-0.5">
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[12px] w-[31px] flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.tackle}</span>
                </div>
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[9.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.l2}</span>
                </div>
              </div>
              {/* Stat 3 */}
              <div className="flex items-stretch h-[19px] gap-0.5">
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[12px] w-[31px] flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.power}</span>
                </div>
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[9.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.l3}</span>
                </div>
              </div>
            </div>

            {/* Right Column (Shoot, Skill, Pass) */}
            <div className="flex flex-col gap-1 w-[48%] justify-center">
              {/* Stat 1 */}
              <div className="flex items-stretch h-[19px] gap-0.5">
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[9.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.r1}</span>
                </div>
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[12px] w-[31px] flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.shoot}</span>
                </div>
              </div>
              {/* Stat 2 */}
              <div className="flex items-stretch h-[19px] gap-0.5">
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[9.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.r2}</span>
                </div>
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[12px] w-[31px] flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.skill}</span>
                </div>
              </div>
              {/* Stat 3 */}
              <div className="flex items-stretch h-[19px] gap-0.5">
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[9.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.r3}</span>
                </div>
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[12px] w-[31px] flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.pass}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Very Bottom Defence / Position / Attack Panel */}
          <div className="absolute bottom-[12px] left-[12px] right-[12px] h-[46px] z-25 flex items-stretch gap-2">
            {/* Defence Score */}
            <div className="w-[28%] flex flex-col bg-gradient-to-b from-[#00aaff] to-[#0055b3] border border-white/20 rounded-[3px] text-center justify-center overflow-hidden shadow-inner">
              <span className="text-white font-black text-[19px] font-mono leading-none drop-shadow-md">
                {stats.defenceRating}
              </span>
              <span className="bg-blue-950 text-white text-[8px] font-black uppercase tracking-wider py-0.5 mt-0.5 leading-none">
                DEFENCE
              </span>
            </div>

            {/* Position & Price Tag */}
            <div className="flex-1 flex flex-col justify-between items-center bg-zinc-950/90 border border-white/10 rounded-[3px] py-1.5 px-1">
              {/* Price Tag — shows sold price if sold, else base price */}
              <span className="text-[#c59b72] font-black text-[10px] font-mono tracking-tight leading-none">
                {(() => {
                  const price = (player?.isSold && player?.soldPrice) ? player.soldPrice : (player?.basePrice ?? 0);
                  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
                  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
                  return `₹${price}`;
                })()}
              </span>
              {/* Position */}
              <span className="text-orange-500 font-extrabold text-[10px] uppercase tracking-widest leading-none drop-shadow-md select-none">
                {stats.positionName}
              </span>
            </div>

            {/* Attack Score */}
            <div className="w-[28%] flex flex-col bg-gradient-to-b from-[#ff2244] to-[#b31414] border border-white/20 rounded-[3px] text-center justify-center overflow-hidden shadow-inner">
              <span className="text-white font-black text-[19px] font-mono leading-none drop-shadow-md">
                {stats.attackRating}
              </span>
              <span className="bg-red-950/90 text-white text-[8px] font-black uppercase tracking-wider py-0.5 mt-0.5 leading-none">
                ATTACK
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const showToast = useAuctionStore((state) => state.showToast);
  const selectedPlayerFromStore = useAuctionStore((state) => state.selectedPlayer);

  // Poll teams list every 1 second to catch real-time admin updates
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    refetchInterval: 1000,
  });

  // Poll all players every 1 second to catch real-time admin bid selections and sold states
  const { data: players } = useQuery({
    queryKey: ['allPlayers'],
    queryFn: () => fetchPlayers({ search: '', position: '', category: '', status: 'all' }),
    refetchInterval: 1000,
  });

  const selectedPlayer = players?.find(p => p._id === selectedPlayerFromStore?._id) || selectedPlayerFromStore;

  const prevSoldPlayersCount = useRef<number | null>(null);

  useEffect(() => {
    if (teams) {
      const currentSold = teams.reduce((acc, t) => acc + (t.buyedPlayers?.length || 0), 0);
      if (prevSoldPlayersCount.current !== null && currentSold > prevSoldPlayersCount.current) {
        triggerConfetti();
        showToast("🔥 PLAYER ACQUIRED! New signing successfully added to roster!", "success");
      }
      prevSoldPlayersCount.current = currentSold;
    }
  }, [teams]);

  const seedMutation = useMutation({
    mutationFn: seedDatabase,
    onSuccess: (data) => {
      showToast(data.message || 'Database seeded successfully!', 'success');
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to seed database.', 'error');
    },
  });

  const totalTeams = teams?.length || 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 glass-card rounded-2xl border-red-500/20 max-w-xl mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3 animate-bounce" />
        <h2 className="text-lg font-bold text-slate-100">Database Connection Failed</h2>
        <p className="text-xs text-slate-400 mt-2">
          Make sure MongoDB is running locally at <code className="bg-slate-900 px-1.5 py-0.5 rounded text-rose-400 text-xs">mongodb://127.0.0.1:27017</code> or update the URI in <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-400 text-xs">.env.local</code>.
        </p>
        <p className="text-[10px] text-slate-500 mt-3 italic">Error detail: {error.message}</p>
      </div>
    );
  }

  if (teams && totalTeams === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 glass-card rounded-2xl border-dashed border-white/10 max-w-xl mx-auto my-12">
        <Trophy className="w-12 h-12 text-amber-500/35 mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Teams Available</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          The database is currently empty. Click the button below to seed the database with Malayalam-themed teams and players to test the auction features immediately.
        </p>
        <button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
          <span>{seedMutation.isPending ? 'Seeding Database...' : 'Seed Database'}</span>
        </button>
      </div>
    );
  }

  const topLeftTeam = teams?.[0];
  const topRightTeam = teams?.[1];
  const bottomLeftTeam = teams?.[2];
  const bottomRightTeam = teams?.[3];

  const topCenterTeams = teams ? teams.slice(4, 6) : [];
  const bottomCenterTeams = teams ? teams.slice(6, 8) : [];

  if (isLoading) {
    return (
      <div className="  px-2 py-4 select-none relative">
        {/* Desktop Loading */}
        <div className="hidden lg:block relative w-full h-[620px]">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-[352px] h-[495px] bg-zinc-950/40 border border-white/5 rounded-xl animate-pulse" />
          </div>
          {/* Left Side Skeletons */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -mt-5 grid grid-cols-2 gap-3.5 z-20">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 w-[240px] aspect-[4/5] animate-pulse bg-[#18191d] border border-zinc-800 flex flex-col justify-between items-start">
                <div className="w-16 h-4 bg-zinc-800 rounded-full" />
                <div className="w-full h-[38%] bg-zinc-800/85 rounded-xl mt-3" />
                <div className="w-24 h-4 bg-zinc-800 rounded mt-3" />
                <div className="w-16 h-3 bg-zinc-800 rounded mt-1.5" />
                <div className="w-full h-8 bg-zinc-800 rounded mt-2" />
                <div className="w-full pt-3 border-t border-zinc-800/60 mt-auto flex items-center justify-between">
                  <div className="w-12 h-4 bg-zinc-800 rounded" />
                  <div className="w-16 h-6 bg-zinc-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Right Side Skeletons */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -mt-5 grid grid-cols-2 gap-3.5 z-20">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 w-[240px] aspect-[4/5] animate-pulse bg-[#18191d] border border-zinc-800 flex flex-col justify-between items-start">
                <div className="w-16 h-4 bg-zinc-800 rounded-full" />
                <div className="w-full h-[38%] bg-zinc-800/85 rounded-xl mt-3" />
                <div className="w-24 h-4 bg-zinc-800 rounded mt-3" />
                <div className="w-16 h-3 bg-zinc-800 rounded mt-1.5" />
                <div className="w-full h-8 bg-zinc-800 rounded mt-2" />
                <div className="w-full pt-3 border-t border-zinc-800/60 mt-auto flex items-center justify-between">
                  <div className="w-12 h-4 bg-zinc-800 rounded" />
                  <div className="w-16 h-6 bg-zinc-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="lg:hidden flex flex-col gap-6 w-full items-center animate-pulse">
          <div className="flex gap-3.5 w-full justify-center">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 w-[calc(50%-7px)] sm:w-[180px] aspect-[4/5] bg-[#18191d] border border-zinc-800 flex flex-col justify-between items-start">
                <div className="w-12 h-3.5 bg-zinc-800 rounded-full" />
                <div className="w-full h-[38%] bg-zinc-800/85 rounded-xl mt-3" />
                <div className="w-20 h-3 bg-zinc-800 rounded mt-3.5" />
                <div className="w-full pt-3 border-t border-zinc-800/60 mt-auto flex items-center justify-between">
                  <div className="w-10 h-3 bg-zinc-800 rounded" />
                  <div className="w-14 h-5 bg-zinc-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-3.5 w-full max-w-[500px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 aspect-[4/5] bg-[#18191d] border border-zinc-800 flex flex-col justify-between items-start">
                <div className="w-12 h-3.5 bg-zinc-800 rounded-full" />
                <div className="w-full h-[38%] bg-zinc-800/85 rounded-xl mt-3" />
                <div className="w-20 h-3 bg-zinc-800 rounded mt-3.5" />
                <div className="w-full pt-3 border-t border-zinc-800/60 mt-auto flex items-center justify-between">
                  <div className="w-10 h-3 bg-zinc-800 rounded" />
                  <div className="w-14 h-5 bg-zinc-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="w-[352px] h-[495px] bg-zinc-950/40 border border-white/5 rounded-xl animate-pulse" />

          <div className="grid grid-cols-2 gap-3.5 w-full max-w-[500px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 aspect-[4/5] bg-[#18191d] border border-zinc-800 flex flex-col justify-between items-start">
                <div className="w-12 h-3.5 bg-zinc-800 rounded-full" />
                <div className="w-full h-[38%] bg-zinc-800/85 rounded-xl mt-3" />
                <div className="w-20 h-3 bg-zinc-800 rounded mt-3.5" />
                <div className="w-full pt-3 border-t border-zinc-800/60 mt-auto flex items-center justify-between">
                  <div className="w-10 h-3 bg-zinc-800 rounded" />
                  <div className="w-14 h-5 bg-zinc-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3.5 w-full justify-center">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 w-[calc(50%-7px)] sm:w-[180px] aspect-[4/5] bg-[#18191d] border border-zinc-800 flex flex-col justify-between items-start">
                <div className="w-12 h-3.5 bg-zinc-800 rounded-full" />
                <div className="w-full h-[38%] bg-zinc-800/85 rounded-xl mt-3" />
                <div className="w-20 h-3 bg-zinc-800 rounded mt-3.5" />
                <div className="w-full pt-3 border-t border-zinc-800/60 mt-auto flex items-center justify-between">
                  <div className="w-10 h-3 bg-zinc-850 rounded" />
                  <div className="w-14 h-5 bg-zinc-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto px-2 py-4 select-none relative  ">

      {/* Desktop Layout (lg and above): Precise Corner & Side Positioning */}
      <div className="hidden lg:block relative w-full h-[620px]">
        {/* Center: Selected Player Showcase Card */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {selectedPlayer ? (
            <FifaPlayerCard player={selectedPlayer} />
          ) : (
            <div className="relative w-[352px] h-[495px] border-2 border-dashed border-white/10 bg-zinc-950/20 rounded-xl flex flex-col items-center justify-center text-center p-6 select-none shadow-inner">
              <User className="w-12 h-12 text-slate-500/40 mb-3" />
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">No Player Selected</span>
              <span className="text-[10px] text-slate-500 mt-2 px-4">
                Select a player from the dropdown in the navigation bar to display their card.
              </span>
            </div>
          )}
        </div>

        {/* Left Section (2 columns, 2 rows grid centered vertically, shifted up slightly) */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -mt-5 grid grid-cols-2 gap-3.5 z-20">
          {topLeftTeam && <CompactTeamCard team={topLeftTeam} />}
          {topCenterTeams[0] && <CompactTeamCard team={topCenterTeams[0]} />}
          {topCenterTeams[1] && <CompactTeamCard team={topCenterTeams[1]} />}
          {bottomLeftTeam && <CompactTeamCard team={bottomLeftTeam} />}
        </div>

        {/* Right Section (2 columns, 2 rows grid centered vertically, shifted up slightly) */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -mt-5 grid grid-cols-2 gap-3.5 z-20">
          {topRightTeam && <CompactTeamCard team={topRightTeam} />}
          {bottomCenterTeams[0] && <CompactTeamCard team={bottomCenterTeams[0]} />}
          {bottomCenterTeams[1] && <CompactTeamCard team={bottomCenterTeams[1]} />}
          {bottomRightTeam && <CompactTeamCard team={bottomRightTeam} />}
        </div>
      </div>

      {/* Mobile/Tablet Layout (below lg): Fluid Stacked Grid */}
      <div className="lg:hidden flex flex-col gap-6 w-full items-center">
        {/* Top Center Teams */}
        {topCenterTeams.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {topCenterTeams.map((team) => (
              <CompactTeamCard key={team._id} team={team} />
            ))}
          </div>
        )}

        {/* Top Corners (rendered as side-by-side row) */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[500px]">
          {topLeftTeam && <CompactTeamCard team={topLeftTeam} />}
          {topRightTeam && <CompactTeamCard team={topRightTeam} />}
        </div>

        {/* Showcase Player Card (Center) */}
        <div className="flex justify-center w-full py-2">
          {selectedPlayer ? (
            <FifaPlayerCard player={selectedPlayer} />
          ) : (
            <div className="relative w-[352px] h-[495px] border-2 border-dashed border-white/10 bg-zinc-950/20 rounded-xl flex flex-col items-center justify-center text-center p-6 select-none shadow-inner">
              <User className="w-12 h-12 text-slate-500/40 mb-3" />
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">No Player Selected</span>
            </div>
          )}
        </div>

        {/* Bottom Corners (rendered as side-by-side row) */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[500px]">
          {bottomLeftTeam && <CompactTeamCard team={bottomLeftTeam} />}
          {bottomRightTeam && <CompactTeamCard team={bottomRightTeam} />}
        </div>

        {/* Bottom Center Teams */}
        {bottomCenterTeams.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {bottomCenterTeams.map((team) => (
              <CompactTeamCard key={team._id} team={team} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

