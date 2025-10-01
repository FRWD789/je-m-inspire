export interface Localisation {
  id: number;
  name: string;
  address: string;
}

export interface Categorie {
  id: number;
  name: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: number;
  available_places: number;
  max_places: number;
  level: string;
  priority: number;
  localisation: Localisation;
  categorie: Categorie;
  can_reserve: boolean;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  start_date: Date;
  end_date?: Date ;
  base_price: number;
  capacity: number;
  max_places: number;
  level: string;
  priority: number;
  localisation_id: number;
  categorie_event_id: number;
}

export interface ReservationPayload {
  quantity: number;
}