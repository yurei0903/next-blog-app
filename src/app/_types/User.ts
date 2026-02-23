import type { Post } from "./Post";
export type User = {
  id: string;
  auth_id: string | null;
  email: string;
  name: string | null;
  published: boolean;
  posts: Post[];
};
