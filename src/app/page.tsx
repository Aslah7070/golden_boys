'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchTeams } from '@/services/api';
import { Team, Player } from '@/types';
import { Trophy, Coins, ShieldAlert, Sparkles, User, Shield } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { seedDatabase } from '@/services/api';
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

  return (
    <Link href={`/team/${team._id}`} className="group block">
      <div className="glass-card glass-card-hover rounded-xl p-3.5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden border border-white/5 bg-zinc-950/60 shadow-lg min-h-[110px]">
        {/* Hover gold shimmer top border */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#c59b72] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="flex items-start gap-3 min-w-0">
          {/* Larger logo/initial container */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-[12px] tracking-widest bg-gradient-to-br ${getFallbackBg(team.teamName)} shrink-0 shadow-md shadow-black/40`}>
            {initials}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-[#c59b72] transition-colors truncate" title={team.teamName}>
              {team.teamName}
            </h3>
            
            {/* Clear Balance Display */}
            <div className="flex items-center gap-1.5 mt-1.5 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 w-fit">
              <Coins className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="text-[11px] font-black text-amber-400 font-mono">
                ₹{team.balance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Clear Signed Players Display */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px]">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Signed Players</span>
          <span className="font-mono font-black text-slate-200 bg-zinc-900/80 px-2 py-0.5 rounded border border-white/10">
            {playerCount}
          </span>
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
                 player.category === 'YOUNG' ? getVal(10, 84, 89) : getVal(10, 88, 92);

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
  const name = player.playerName;
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

  const pos = player.position;

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
  const initials = player.playerName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const displayName = player.playerName.split(' ').pop() || player.playerName;
  const soldToTeam = player.soldTo && typeof player.soldTo === 'object' ? player.soldTo : null;

  // Truncate player name for vertical text if too long
  const verticalName = player.playerName.length > 14 
    ? player.playerName.slice(0, 13) + '..'
    : player.playerName;

  return (
    <div className="flex flex-col items-center animate-fade-in-up">
      {/* Match Attax Card Container */}
      <div className="relative w-[280px] h-[390px] rounded-xl overflow-hidden bg-gradient-to-br from-[#2a2c2e] via-[#4d5053] to-[#1c1e20] p-[5px] shadow-2xl transition-all duration-500 ease-out hover:scale-[1.05] group select-none">
        
        {/* Shiny foil overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-20 pointer-events-none" />

        {/* Inner Card (Deep Red Gradient Background) */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#3a0d0d] via-[#1a0808] to-[#0a0404] rounded-[7px] overflow-hidden flex flex-col justify-between">
          
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

          {/* Left Vertical Player Name Banner */}
          <div className="absolute left-[10px] top-[10px] bottom-[114px] w-[26px] bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm flex flex-col justify-between items-center py-2 z-25">
            {/* Stars */}
            <div className="flex flex-col gap-0.5 text-[#c59b72] text-[9px] select-none leading-none">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
            {/* Vertical Name */}
            <div 
              className="font-black text-[#c59b72] text-[10px] tracking-[0.15em] uppercase select-none my-auto shrink-0"
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

          {/* Right Vertical Edition Banner */}
          <div className="absolute right-[10px] top-[10px] bottom-[114px] w-[22px] bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm flex flex-col justify-center items-center py-2 z-25">
            <div 
              className="font-black text-[#c59b72] text-[7.5px] tracking-[0.1em] uppercase select-none opacity-80 shrink-0"
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
          <div className="absolute top-[10px] right-[40px] z-25">
            {soldToTeam ? (
              <div className="w-8 h-8 rounded-full border border-white/20 bg-black/80 flex items-center justify-center overflow-hidden shadow-lg" title={soldToTeam.teamName}>
                {soldToTeam.logo ? (
                  <img src={soldToTeam.logo} alt={soldToTeam.teamName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-white text-[8px] uppercase tracking-wider">
                    {soldToTeam.teamName.slice(0, 2)}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full border border-[#c59b72]/40 bg-zinc-950 flex items-center justify-center overflow-hidden shadow-lg">
                <span className="font-black text-[#c59b72] text-[12px] leading-none animate-pulse">★</span>
              </div>
            )}
          </div>

          {/* Player Portrait Image */}
          <div className="absolute top-[10px] left-[36px] right-[36px] bottom-[114px] flex items-end justify-center z-20 overflow-hidden">
            {player.photo && player.photo !== '/players/default.png' && !player.photo.startsWith('/players/default') ? (
              <img 
                src={player.photo} 
                alt={player.playerName} 
                className="w-full h-[95%] object-cover object-top filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] scale-[1.05] transition-transform duration-500 group-hover:scale-[1.10]"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)'
                }}
              />
            ) : (
              /* Fallback Initials */
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-black border-2 border-[#c59b72]/30 flex items-center justify-center shadow-2xl relative mb-6">
                <div className="absolute inset-0.5 rounded-full bg-black/70" />
                <span className="relative font-black text-2xl tracking-widest text-[#c59b72] drop-shadow-md">
                  {initials}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Stats Grid (Match Attax Slanted Block Style) */}
          <div className="absolute bottom-[48px] left-[10px] right-[10px] h-[66px] bg-black/75 backdrop-blur-sm border-t border-b border-white/10 py-1.5 px-2 z-25 flex justify-between gap-2 rounded-sm">
            {/* Left Column (Speed, Tackle, Power) */}
            <div className="flex flex-col gap-1 w-[48%] justify-center">
              {/* Stat 1 */}
              <div className="flex items-stretch h-[15px] gap-0.5">
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[10px] w-6 flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.speed}</span>
                </div>
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[7.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.l1}</span>
                </div>
              </div>
              {/* Stat 2 */}
              <div className="flex items-stretch h-[15px] gap-0.5">
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[10px] w-6 flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.tackle}</span>
                </div>
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[7.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.l2}</span>
                </div>
              </div>
              {/* Stat 3 */}
              <div className="flex items-stretch h-[15px] gap-0.5">
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[10px] w-6 flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.power}</span>
                </div>
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[7.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.l3}</span>
                </div>
              </div>
            </div>

            {/* Right Column (Shoot, Skill, Pass) */}
            <div className="flex flex-col gap-1 w-[48%] justify-center">
              {/* Stat 1 */}
              <div className="flex items-stretch h-[15px] gap-0.5">
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[7.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.r1}</span>
                </div>
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[10px] w-6 flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.shoot}</span>
                </div>
              </div>
              {/* Stat 2 */}
              <div className="flex items-stretch h-[15px] gap-0.5">
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[7.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.r2}</span>
                </div>
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[10px] w-6 flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.skill}</span>
                </div>
              </div>
              {/* Stat 3 */}
              <div className="flex items-stretch h-[15px] gap-0.5">
                <div className="-skew-x-12 bg-zinc-900 border border-white/10 text-white font-sans font-black text-[7.5px] flex-1 flex items-center pl-1.5 rounded-sm uppercase tracking-wider">
                  <span className="skew-x-12">{stats.labels.r3}</span>
                </div>
                <div className="-skew-x-12 bg-[#c59b72] text-black font-mono font-black text-[10px] w-6 flex items-center justify-center rounded-sm">
                  <span className="skew-x-12">{stats.pass}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Very Bottom Defence / Position / Attack Panel */}
          <div className="absolute bottom-[10px] left-[10px] right-[10px] h-[38px] z-25 flex items-stretch gap-1">
            {/* Defence Score */}
            <div className="w-[28%] flex flex-col bg-gradient-to-b from-[#00aaff] to-[#0055b3] border border-white/20 rounded-[3px] text-center justify-center overflow-hidden shadow-inner">
              <span className="text-white font-black text-[15px] font-mono leading-none drop-shadow-md">
                {stats.defenceRating}
              </span>
              <span className="bg-blue-950 text-white text-[6.5px] font-black uppercase tracking-wider py-0.5 mt-0.5 leading-none">
                DEFENCE
              </span>
            </div>

            {/* Position & Price Tag */}
            <div className="flex-1 flex flex-col justify-between items-center bg-zinc-950/90 border border-white/10 rounded-[3px] py-1 px-1">
              {/* Price Tag */}
              <span className="text-[#c59b72] font-black text-[8px] font-mono tracking-tight leading-none">
                ₹{player.basePrice >= 100000 
                  ? `${(player.basePrice / 100000).toFixed(1)}L` 
                  : `${(player.basePrice / 1000).toFixed(0)}K`}
              </span>
              {/* Position */}
              <span className="text-orange-500 font-extrabold text-[8px] uppercase tracking-widest leading-none drop-shadow-md select-none">
                {stats.positionName}
              </span>
            </div>

            {/* Attack Score */}
            <div className="w-[28%] flex flex-col bg-gradient-to-b from-[#ff2244] to-[#b31414] border border-white/20 rounded-[3px] text-center justify-center overflow-hidden shadow-inner">
              <span className="text-white font-black text-[15px] font-mono leading-none drop-shadow-md">
                {stats.attackRating}
              </span>
              <span className="bg-red-950/90 text-white text-[6.5px] font-black uppercase tracking-wider py-0.5 mt-0.5 leading-none">
                ATTACK
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Sleek Auction Status Bar directly below card */}
      <div className="mt-4 w-full max-w-sm bg-black/85 border border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-semibold shadow-xl backdrop-blur-md">
        <div className="space-y-0.5 pl-1">
          <span className="text-slate-500 block text-[8px] uppercase tracking-wider font-bold">Base Price</span>
          <span className="text-slate-200 font-bold font-mono text-sm">₹{player.basePrice.toLocaleString('en-IN')}</span>
        </div>
        
        {player.isSold ? (
          <>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="text-right space-y-0.5">
              <span className="text-slate-500 block text-[8px] uppercase tracking-wider font-bold">Sold Price</span>
              <span className="text-amber-400 font-black font-mono text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                ₹{player.soldPrice.toLocaleString('en-IN')}
              </span>
            </div>
            
            {soldToTeam && (
              <>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-xl">
                  <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="text-left">
                    <span className="text-[7px] uppercase font-black text-slate-500 block leading-none">Signed By</span>
                    <span className="text-[11px] text-slate-200 font-bold truncate max-w-[90px] block mt-0.5 leading-none">{soldToTeam.teamName}</span>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="text-right pr-2 space-y-0.5">
              <span className="text-slate-500 block text-[8px] uppercase tracking-wider font-bold">Auction Status</span>
              <span className="text-emerald-400 font-black uppercase text-xs tracking-wider animate-pulse">Unsold</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const showToast = useAuctionStore((state) => state.showToast);
  const selectedPlayer = useAuctionStore((state) => state.selectedPlayer);

  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

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
      <div className="max-w-7xl mx-auto px-2 py-4 select-none relative">
        {/* Desktop Loading */}
        <div className="hidden lg:block relative w-full h-[620px]">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-[280px] h-[390px] bg-zinc-950/40 border border-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="absolute top-0 left-0">
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[240px] animate-pulse bg-zinc-950/40 border border-white/5" />
          </div>
          <div className="absolute top-0 right-0">
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[240px] animate-pulse bg-zinc-950/40 border border-white/5" />
          </div>
          <div className="absolute bottom-0 left-0">
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[240px] animate-pulse bg-zinc-950/40 border border-white/5" />
          </div>
          <div className="absolute bottom-0 right-0">
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[240px] animate-pulse bg-zinc-950/40 border border-white/5" />
          </div>
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex flex-col gap-3.5">
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[240px] animate-pulse bg-zinc-950/40 border border-white/5" />
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[240px] animate-pulse bg-zinc-950/40 border border-white/5" />
          </div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 flex flex-col gap-3.5">
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[240px] animate-pulse bg-zinc-950/40 border border-white/5" />
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[240px] animate-pulse bg-zinc-950/40 border border-white/5" />
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="lg:hidden flex flex-col gap-6 w-full items-center animate-pulse">
          <div className="flex gap-3 w-full justify-center">
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[45%] max-w-[240px] bg-zinc-950/40 border border-white/5" />
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[45%] max-w-[240px] bg-zinc-950/40 border border-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-[500px]">
            <div className="glass-card rounded-xl p-3.5 h-[110px] bg-zinc-950/40 border border-white/5" />
            <div className="glass-card rounded-xl p-3.5 h-[110px] bg-zinc-950/40 border border-white/5" />
          </div>
          <div className="w-[280px] h-[390px] bg-zinc-950/40 border border-white/5 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 w-full max-w-[500px]">
            <div className="glass-card rounded-xl p-3.5 h-[110px] bg-zinc-950/40 border border-white/5" />
            <div className="glass-card rounded-xl p-3.5 h-[110px] bg-zinc-950/40 border border-white/5" />
          </div>
          <div className="flex gap-3 w-full justify-center">
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[45%] max-w-[240px] bg-zinc-950/40 border border-white/5" />
            <div className="glass-card rounded-xl p-3.5 h-[110px] w-[45%] max-w-[240px] bg-zinc-950/40 border border-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 py-4 select-none relative">
      
      {/* Desktop Layout (lg and above): Precise Corner & Side Positioning */}
      <div className="hidden lg:block relative w-full h-[620px]">
        {/* Center: Selected Player Showcase Card */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {selectedPlayer ? (
            <FifaPlayerCard player={selectedPlayer} />
          ) : (
            <div className="relative w-[280px] h-[390px] border-2 border-dashed border-white/10 bg-zinc-950/20 rounded-xl flex flex-col items-center justify-center text-center p-6 select-none shadow-inner">
              <User className="w-12 h-12 text-slate-500/40 mb-3" />
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">No Player Selected</span>
              <span className="text-[10px] text-slate-500 mt-2 px-4">
                Select a player from the dropdown in the navigation bar to display their card.
              </span>
            </div>
          )}
        </div>

        {/* 4 Corners */}
        {/* Top Left Corner */}
        <div className="absolute top-0 left-0">
          {topLeftTeam && <CompactTeamCard team={topLeftTeam} />}
        </div>

        {/* Top Right Corner */}
        <div className="absolute top-0 right-0">
          {topRightTeam && <CompactTeamCard team={topRightTeam} />}
        </div>

        {/* Bottom Left Corner */}
        <div className="absolute bottom-0 left-0">
          {bottomLeftTeam && <CompactTeamCard team={bottomLeftTeam} />}
        </div>

        {/* Bottom Right Corner */}
        <div className="absolute bottom-0 right-0">
          {bottomRightTeam && <CompactTeamCard team={bottomRightTeam} />}
        </div>

        {/* 2 Sides (Flanking the center card vertically) */}
        {/* Middle Left */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex flex-col gap-3.5 z-20">
          {topCenterTeams.map((team) => (
            <CompactTeamCard key={team._id} team={team} />
          ))}
        </div>

        {/* Middle Right */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 flex flex-col gap-3.5 z-20">
          {bottomCenterTeams.map((team) => (
            <CompactTeamCard key={team._id} team={team} />
          ))}
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
            <div className="relative w-[280px] h-[390px] border-2 border-dashed border-white/10 bg-zinc-950/20 rounded-xl flex flex-col items-center justify-center text-center p-6 select-none shadow-inner">
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

