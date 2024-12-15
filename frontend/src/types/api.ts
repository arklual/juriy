export interface UserProfile {
  login: string;
}

export interface UserSignin {
  login: string;
  password: string;
}

export interface UserConfirm extends UserSignin {
  code: string;
}

export interface Token {
  token: string;
}

export interface CategorySchema {
  title: string;
}

export interface CategoryInBody {
  category_name: string;
}

export interface CardSchema {
  id: number;
  name: string;
  category: string;
  price: number;
  url: string;
  image: string;
}

export interface CreateCard {
  target_url: string;
  category: string;
  shutdown_time: string;
}

export interface AddFavor {
  card_id: number;
}

export interface UpdateCardSchema extends Partial<CardSchema> {
  id: number;
}

export interface ApiError {
  details: string;
}