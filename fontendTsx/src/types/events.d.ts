export interface Event {
  id: string | number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: number;
  capacity: number;
  max_places: number;
  available_places?: number;
  level: string;
  priority: number;
  thumbnail?: string;
  banner?: string;
  has_refund_request?: boolean
  refund_status?: 'en_attente' | 'approuve' | 'refuse'
  can_cancel?: boolean
  is_cancelled?: boolean;
  localisation: {
    id?: number;
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  categorie?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    profile: {
      name: string;
      last_name: string;
      profile_picture?: string;
    };
  };
  images?: Array<{
    id: number;
    url: string;
    display_order: number;
  }>;
}

export interface CreateEventData extends FormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: number;
  capacity: number;
  max_places: number;
  level: string;
  priority: number;
  localisation_address: string;
  localisation_lat: number;
  localisation_lng: number;
  categorie_event_id: number;
  thumbnail?: File;
  banner?: File;
  images?: File[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  delete_images?: number[];
  images_order?: number[];
}

export interface MyEventsResponse {
  created_events: Event[];
  total_created: number;
}