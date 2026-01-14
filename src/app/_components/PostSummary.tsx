"use client";
import type { Post } from "@/app/_types/Post";
import dayjs from "dayjs";
import Link from "next/link";
type Props = {
  post: Post;
};

const PostSummary: React.FC<Props> = (props) => {
  const { post } = props;
  return (
    <div className="border border-slate-400 p-3">
      <Link href={`/posts/${post.id}`}>
        <div>{dayjs(post.createdAt).format("YYYY/MM/DD HH:mm")}</div>
        <div className="font-bold">
          {post.title}
          <div className="category-list mb-2 flex justify-end">
            {post.categories.map((category) => (
              <span
                key={category.category.id}
                className="mr-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
              >
                {category.category.name}
              </span>
            ))}
          </div>
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="line-clamp-3"
        />
      </Link>
    </div>
  );
};

export default PostSummary;
