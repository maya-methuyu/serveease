export type UserRole = 'customer' | 'provider' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  location: string;
  bio: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  base_price: number;
  created_at: string;
}

export interface ProviderService {
  id: string;
  provider_id: string;
  service_id: string;
  price: number;
  description: string;
  is_featured: boolean;
  created_at: string;
  service?: Service;
  provider?: Profile;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type PaymentMethod = 'online' | 'cash';
export type PaymentStatus = 'pending' | 'paid';

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  provider_service_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: BookingStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total_amount: number;
  convenience_fee: number;
  address: string;
  notes: string;
  created_at: string;
  completed_at: string | null;
  service?: Service;
  provider?: Profile;
  customer?: Profile;
  provider_service?: ProviderService;
  review?: Review;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer?: Profile;
  provider?: Profile;
}
