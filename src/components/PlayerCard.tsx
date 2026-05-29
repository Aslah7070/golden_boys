import { Player } from '@/types';
import { MapPin, Calendar, UserCheck, Shield, Phone } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const playerName = player.playerName || player.name || 'Unknown Player';
  const photo = player.photo || player.playerImage || '/players/default.png';
  const isSold = player.isSold || !!player.team || !!player.soldTo;
  const soldPrice = player.soldPrice || player.currentBid || 0;

  // Fallback avatar initials
  const initials = playerName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const soldToTeam = (player.soldTo && typeof player.soldTo === 'object')
    ? player.soldTo
    : ((player.team && typeof player.team === 'object') ? player.team : null);

  const renderPlayerPhoto = () => {
    if (photo && photo !== '/players/default.png' && !photo.startsWith('/players/default')) {
      return (
        <img 
          src={photo} 
          alt={playerName} 
          className="w-full h-full rounded-full object-cover border border-white/20" 
        />
      );
    }
    return (
      <span className={`font-black text-3xl tracking-wider transition-colors duration-500 ${
        isSold ? 'text-white/40' : 'text-white'
      }`}>
        {initials}
      </span>
    );
  };

  return (
    <div className="relative p-[1.5px] group rounded-2xl transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-1.5 min-h-[350px] flex flex-col justify-between overflow-hidden animate-fade-in-up shadow-lg">
      
      {/* Premium White & Black Glow effect (Layer 1) */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-[radial-gradient(circle_farthest-side_at_0_100%,#ffffff,transparent),radial-gradient(circle_farthest-side_at_100%_0,#f8fafc,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#e2e8f0,transparent),radial-gradient(circle_farthest-side_at_0_0,#ffffff,#000000)] transition-all duration-700 pointer-events-none animate-border-gradient ${
          isSold 
            ? 'opacity-10 blur-md' 
            : 'opacity-20 blur-xl group-hover:opacity-50 group-hover:blur-2xl'
        }`} 
      />

      {/* Premium White & Black Border outline (Layer 2) */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-[radial-gradient(circle_farthest-side_at_0_100%,#ffffff,transparent),radial-gradient(circle_farthest-side_at_100%_0,#f8fafc,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#e2e8f0,transparent),radial-gradient(circle_farthest-side_at_0_0,#ffffff,#000000)] transition-all duration-700 pointer-events-none animate-border-gradient ${
          isSold 
            ? 'opacity-15' 
            : 'opacity-25 group-hover:opacity-100'
        }`} 
      />

      {/* Inner Card Container */}
      <div className={`relative flex-1 bg-[#18191d] rounded-[15px] p-4 flex flex-col justify-between border border-zinc-800 group-hover:border-zinc-700 backdrop-blur-3xl overflow-hidden transition-all duration-500 h-full ${
        isSold ? 'opacity-80' : 'group-hover:bg-[#1f2127]'
      }`}>
        
        {/* Ribbon Badge */}
        {isSold ? (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/15 text-white/50 z-10">
            <UserCheck className="w-3 h-3" />
            <span>Sold</span>
          </div>
        ) : (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 border border-white/30 text-white animate-pulse z-10">
            <span>Unsold</span>
          </div>
        )}

        {/* Signed Team Logo (Top Left) */}
        {isSold && soldToTeam && (
          <div className="absolute top-3.5 left-3.5 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden shadow-lg z-10" title={`Signed by ${soldToTeam.teamName}`}>
            {soldToTeam.logo && !soldToTeam.logo.startsWith('/teams/default') ? (
              <img src={soldToTeam.logo} alt={soldToTeam.teamName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                {soldToTeam.teamName.slice(0, 2)}
              </span>
            )}
          </div>
        )}

        {/* Centered layout */}
        <div className="flex flex-col items-center text-center mt-4">
          
          <div className={`w-40 h-40 rounded-full flex items-center justify-center border transition-all duration-500 mb-3 ${
            isSold 
              ? 'bg-zinc-950 border-white/10' 
              : 'bg-zinc-950 border-white/20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent group-hover:border-white/50 shadow-lg shadow-white/5'
          }`}>
            {renderPlayerPhoto()}
          </div>

          {/* Name */}
          <h3 className="font-black text-white text-base tracking-widest uppercase leading-tight" title={playerName}>
            {playerName}
          </h3>

          {/* Position Tag */}
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/10 border border-white/20 text-white">
            {player.position.replace('_', ' ')}
          </span>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            <span className="text-[9px] font-black uppercase border border-white/20 bg-white/5 px-2.5 py-0.5 rounded text-white">
              {player.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/80 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded font-semibold truncate max-w-[120px]" title={player.place}>
              <MapPin className="w-3 h-3 text-white shrink-0" />
              <span className="truncate">{player.place || '—'}</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/80 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded font-semibold truncate max-w-[120px]" title={player.phoneNumber}>
              <Phone className="w-3 h-3 text-white shrink-0" />
              <span className="truncate">{player.phoneNumber || '—'}</span>
            </span>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Base Price</span>
              <span className="text-xs font-black text-white font-mono mt-0.5 block">
                ₹{player.basePrice.toLocaleString('en-IN')}
              </span>
            </div>
            
            {isSold && (
              <div className="text-right">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">Sold Amount</span>
                <span className="text-xs font-black text-white font-mono mt-0.5 block">
                  ₹{soldPrice.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
