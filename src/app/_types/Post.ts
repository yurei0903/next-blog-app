import type { Category } from "./Category";
import type { CoverImage } from "./CoverImage";
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
  coverImageURL: string;
};
