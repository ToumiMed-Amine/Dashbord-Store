export interface User {
  id: number;
  username: string;
  email: string;
  name?: {
    firstname: string;
    lastname: string;
  };
  phone?: string;
  address?: {
    city?: string;
    street?: string;
    zipcode?: string;
  };
}

export interface UserFilters {
  search?: string;
  sortBy?: 'id' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
