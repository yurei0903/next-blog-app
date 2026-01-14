// components/AdminPostSummary.tsx
"use client";
import type { Category } from "@/app/_types/Category";
import dayjs from "dayjs";
import Link from "next/link";

type Props = {
  category: Category;
  onDelete: (id: string) => void;
};

const AdminCategorySummary: React.FC<Props> = ({ category, onDelete }) => {
  return (
    <div className="border border-slate-400 bg-white p-3">
      {/* 全体をLinkで囲まず、日付やタイトルだけ表示 */}

      <div className="font-bold">
        {/* タイトルだけリンクにするならここをLinkで囲む */}
        <Link href={`/posts/${category.id}`} className="hover:underline">
          {category.name}
        </Link>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: category.name }}
        className="mb-4 line-clamp-3" // ボタンエリアとの余白を確保
      />

      {/* 右下にボタンを配置するエリア */}
      <div className="mt-2 flex justify-end gap-2 border-t pt-2">
        <Link
          href={`/admin/posts/${category.id}`}
          className="rounded bg-green-500 px-4 py-1 text-sm text-white hover:bg-green-600"
        >
          編集
        </Link>
        <button
          onClick={() => onDelete(category.id)}
          className="rounded bg-red-500 px-4 py-1 text-sm text-white hover:bg-red-600"
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default AdminCategorySummary;
