export type PlayerPosition =
  | 'GOALKEEPER'
  | 'DEFENDER'
  | 'MIDFIELDER'
  | 'LEFT_WING'
  | 'RIGHT_WING'
  | 'STRIKER';

export type PlayerCategory = 'GK' | 'ICON' | 'YOUNG' | 'LEGEND';

export interface Player {
  _id: string;
  playerName: string;
  position: PlayerPosition;
  category: PlayerCategory;
  phoneNumber: string;
  age: number;
  place: string;
  photo: string;
  basePrice: number;
  soldPrice: number;
  soldTo: string | { _id: string; teamName: string; logo: string } | null;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id: string;
  teamName: string;
  logo: string;
  balance: number;
  totalSpent: number;
  buyedPlayers: string[] | Player[];
  createdAt: string;
  updatedAt: string;
}

export interface AuctionFilters {
  search: string;
  position: string;
  category: string;
  status: 'all' | 'sold' | 'unsold';
}
