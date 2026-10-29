export interface Review {
  id: string;
  appointment_id?: string;
  client_name: string;
  client_phone?: string;
  rating: number; // 1 to 5
  comment: string;
  service_type?: string;
  created_at: string;
  is_verified?: number | boolean;
  is_published?: number | boolean;
}

export interface CreateReviewDTO {
  appointment_id?: string;
  client_name: string;
  client_phone?: string;
  rating: number;
  comment: string;
  service_type?: string;
}
