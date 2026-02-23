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
    // ① 親要素に relative を付け、hover時の動きなどを追加すると分かりやすいです
    <div className="group relative border border-slate-400 p-3 transition-colors hover:bg-slate-50">
      {/* ② カード全体をクリック可能にするメインリンク（透明に広げる） */}
      <Link
        href={`/posts/${post.id}`}
        className="absolute inset-0 z-0"
        aria-label={`${post.title}の記事を読む`}
      />

      <div className="pointer-events-none relative z-10">
        {/* pointer-events-none を付けると、文字上のクリックも背後のメインリンクに貫通します */}
        <div>{dayjs(post.createdAt).format("YYYY/MM/DD HH:mm")}</div>

        <div className="pointer-events-auto font-bold">
          {post.title}

          {/* ④ 著者リンクを配置（z-20で一番手前に出し、クリック可能にする） */}
          <Link
            href={`/about/${post.author?.id}`}
            className="relative z-20 ml-2 text-sm font-normal text-gray-500 hover:text-blue-600"
          >
            by {post.author?.name || "名無しユーザー"}
          </Link>

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
      </div>
    </div>
  );
};

export default PostSummary;
