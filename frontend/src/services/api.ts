import axios from 'axios';
import type {
  UserProfile,
  UserSignin,
  UserConfirm,
  Token,
  CategorySchema,
  CategoryInBody,
  CardSchema,
  CreateCard,
  AddFavor,
  UpdateCardSchema,
} from '../types/api';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data: UserSignin) => 
    api.post<UserProfile>('/register', data),
  
  sendCode: (data: UserSignin) =>
    api.post<UserProfile>('/send_code_to_email', data),
  
  confirmEmail: (data: UserConfirm) =>
    api.post<{ status: string }>('/confirm_email', data),
  
  signIn: (data: UserSignin) =>
    api.post<Token>('/sign-in', data),
};

export const categories = {
  getAll: () => 
    api.get<CategorySchema[]>('/categories'),
  
  getFollowed: () =>
    api.get<CategorySchema[]>('/get_followed_categories'),
  
  add: (data: CategoryInBody) =>
    api.post<CategorySchema>('/add_category', data),
  
  follow: (data: CategoryInBody) =>
    api.post<{ status: string }>('/follow_category', data),
  
  unfollow: (data: CategoryInBody) =>
    api.delete<{ status: string }>('/unfollow_category', { data }),
  
  delete: (data: CategoryInBody) =>
    api.delete<{ status: string }>('/del_category', { data }),
};

export interface GetCardsParams {
  start: number;
  count: number;
  sort: string;
  time_start?: string;
  time_finish?: string;
  price_floor?: number;
  price_top?: number;
  category?: string;
}

export const cards = {
  create: (data: CreateCard) =>
    api.post<CardSchema>('/create_card', data),
  
  addFavorite: (data: AddFavor) =>
    api.post<{ status: string }>('/add_favorite', data),
  
  deleteFavorite: (cardId: number) =>
    api.delete<{ status: string }>('/del_favorite', { 
      params: { card_id: cardId } 
    }),
  
  update: (data: UpdateCardSchema) =>
    api.put<CardSchema>('/update_card', data),
  
  getFavorites: (params: Pick<GetCardsParams, 'start' | 'count' | 'sort'>) =>
    api.get<CardSchema[]>('/get_favorite', { params }),
  
  getAll: (params: GetCardsParams) =>
    api.get<CardSchema[]>('/get_cards', { params }),
  
  search: (params: GetCardsParams & { req: string }) =>
    api.get<CardSchema[]>('/search', { params }),
};