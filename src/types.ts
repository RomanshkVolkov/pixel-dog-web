export interface Post {
  description: string;
  pathname: string;
  userID: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T | null;
  next_cursor: string | null;
  has_more: boolean;
}
