import { Player } from '@/types';
import { MapPin, Calendar, UserCheck, Shield } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {

  // Fallback avatar initials
  const initials = player.playerName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const soldToTeam = player.soldTo && typeof player.soldTo === 'object' ? player.soldTo : null;

  const renderPlayerPhoto = () => {
    if (player.photo && player.photo !== '/players/default.png' && !player.photo.startsWith('/players/default')) {
      return (
        <img 
          src={player.photo} 
          alt={player.playerName} 
          className="w-full h-full rounded-full object-cover border border-white/20" 
        />
      );
    }
    return (
      <span className={`font-black text-3xl tracking-wider transition-colors duration-500 ${
        player.isSold ? 'text-white/40' : 'text-white'
      }`}>
        {initials}
      </span>
    );
  };

  return (
    <div className="relative p-[1.5px] group rounded-2xl transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-1.5 min-h-[420px] flex flex-col justify-between overflow-hidden animate-fade-in-up shadow-lg">
      
      {/* Premium White & Black Flowing Glow effect (Layer 1) */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-[radial-gradient(circle_farthest-side_at_0_100%,#ffffff,transparent),radial-gradient(circle_farthest-side_at_100%_0,#f8fafc,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#e2e8f0,transparent),radial-gradient(circle_farthest-side_at_0_0,#ffffff,#000000)] transition-all duration-700 pointer-events-none animate-border-gradient ${
          player.isSold 
            ? 'opacity-10 blur-md' 
            : 'opacity-20 blur-xl group-hover:opacity-50 group-hover:blur-2xl'
        }`} 
      />

      {/* Premium White & Black Flowing Border gradient outline (Layer 2) */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-[radial-gradient(circle_farthest-side_at_0_100%,#ffffff,transparent),radial-gradient(circle_farthest-side_at_100%_0,#f8fafc,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#e2e8f0,transparent),radial-gradient(circle_farthest-side_at_0_0,#ffffff,#000000)] transition-all duration-700 pointer-events-none animate-border-gradient ${
          player.isSold 
            ? 'opacity-15' 
            : 'opacity-25 group-hover:opacity-100'
        }`} 
      />

      {/* Inner Card Container (Strict Black and White Theme) */}
      <div className={`relative flex-1 bg-black rounded-[15px] p-6 flex flex-col justify-between border border-white/10 backdrop-blur-3xl overflow-hidden transition-all duration-500 h-full ${
        player.isSold ? 'opacity-80' : 'group-hover:bg-black/90'
      }`}>
        
        {/* Sold / Unsold Ribbon / Badge (Strict Black & White) */}
        {player.isSold ? (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/15 text-white/50">
            <UserCheck className="w-3 h-3" />
            <span>Sold</span>
          </div>
        ) : (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 border border-white/30 text-white animate-pulse">
            <span>Unsold</span>
          </div>
        )}

        {/* Centered layout prioritizing the player image */}
        <div className="flex flex-col items-center text-center mt-6">
          
          {/* Main Avatar Container (Increased size to w-28 h-28 and centered) */}
          <div className={`w-28 h-28 rounded-full flex items-center justify-center border transition-all duration-500 mb-5 ${
            player.isSold 
              ? 'bg-zinc-950 border-white/10' 
              : 'bg-zinc-950 border-white/20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent group-hover:border-white/50 shadow-lg shadow-white/5'
          }`}>
            {renderPlayerPhoto()}
          </div>

          {/* Player Name (Uppercase) */}
          <h3 className="font-black text-white text-base tracking-widest uppercase leading-tight" title={player.playerName}>
            {player.playerName}
          </h3>

          {/* Centered Position Tag */}
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/10 border border-white/20 text-white">
            {player.position.replace('_', ' ')}
          </span>

          {/* Centered Categories / Meta */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-5">
            <span className="text-[9px] font-black uppercase border border-white/20 bg-white/5 px-2.5 py-0.5 rounded text-white">
              {player.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/80 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded font-semibold">
              <Calendar className="w-3 h-3 text-white" />
              <span>{player.age} yrs</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/80 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded font-semibold truncate max-w-[120px]" title={player.place}>
              <MapPin className="w-3 h-3 text-white shrink-0" />
              <span className="truncate">{player.place}</span>
            </span>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Base Price</span>
              <span className="text-xs font-black text-white font-mono mt-0.5 block">
                ₹{player.basePrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          
          {/* Beautiful Dedicated Sold Amount Banner */}
          {player.isSold && (
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between shadow-inner animate-slide-in">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Sold Amount</span>
              <span className="text-xs font-black text-white font-mono bg-white/10 px-3 py-1 rounded border border-white/20">
                ₹{player.soldPrice.toLocaleString('en-IN')}
              </span>
            </div>
          )}
          
          {/* Sold Info (Strict Black & White) */}
          {player.isSold && soldToTeam && (
            <div className="mt-3.5 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="text-[10px] text-white/80 leading-snug font-semibold text-center">
                Signed by <strong className="text-white font-extrabold">{soldToTeam.teamName}</strong>
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
