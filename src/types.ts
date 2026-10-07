export interface StallItem {
  id: string;
  stallNumber: number;
  name: string;
  category: 'fashion' | 'phones' | 'food' | 'thrift' | 'beauty' | 'shoes' | 'electronics' | 'provisions';
  whatsapp: string;
  description: string;
  priceRange: string;
  images: string[];
  views: number;
  whatsappClicks: number;
  rating: number;
  ratingCount: number;
  rentExpiry: string;
  renewalStatus?: 'active' | 'pending_renewal' | 'expired';
  renewalReceipt?: string;
  renewalRequestedAt?: string;
  x: number;
  y: number;
  color: string;
  pidginShout: string;
}

export interface LeadItem {
  id: string;
  shopName: string;
  whatsapp: string;
  instagram?: string;
  category?: string;
  createdAt: string;
  status: string;
}

export interface VisitorDot {
  id: string;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  shout?: string;
}
