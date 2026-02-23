import type { Category } from "./Category";
import type { CoverImage } from "./CoverImage";
import type { User } from "./User";
type PostCategory = {
  category: Category;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  categories: PostCategory[];
  coverImageKey: string;
  author: User;
  published: boolean;
};
