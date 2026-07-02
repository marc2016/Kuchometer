export interface CakeEntry {
  id: string;
  date: string;
  name: string;
  createdAt: string;
}

export interface CreateCakePayload {
  date?: string;
  name: string;
}
