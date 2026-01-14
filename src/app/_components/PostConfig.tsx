// components/AdminPostSummary.tsx
"use client";
import type { Post } from "@/app/_types/Post";
import dayjs from "dayjs";
import Link from "next/link";

type Props = {
  post: Post;
  onDelete: (id: string) => void;
};

const AdminPostSummary: React.FC<Props> = ({ post, onDelete }) => {
  return (
    <div className="border border-slate-400 bg-white p-3">
      {/* 全体をLinkで囲まず、日付やタイトルだけ表示 */}
      <div>{dayjs(post.createdAt).format("YYYY/MM/DD HH:mm")}</div>

      <div className="font-bold">
        {/* タイトルだけリンクにするならここをLinkで囲む */}
        <Link href={`/posts/${post.id}`} className="hover:underline">
          {post.title}
        </Link>

        {/* カテゴリーエリア */}
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
        className="mb-4 line-clamp-3" // ボタンエリアとの余白を確保
      />

      {/* 右下にボタンを配置するエリア */}
      <div className="mt-2 flex justify-end gap-2 border-t pt-2">
        <Link
          href={`/admin/posts/${post.id}`}
          className="rounded bg-green-500 px-4 py-1 text-sm text-white hover:bg-green-600"
        >
          編集
        </Link>
        <button
          onClick={() => onDelete(post.id)}
          className="rounded bg-red-500 px-4 py-1 text-sm text-white hover:bg-red-600"
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default AdminPostSummary;
