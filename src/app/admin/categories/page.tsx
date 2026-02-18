"use client";
import { useState, useEffect } from "react";
import type { Category } from "@/app/_types/Category";
import CategoryConfig from "@/app/_components/CategoryConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";
const Page: React.FC = () => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth(); // トークンの取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // microCMS からカテゴリデータを取得
        const requestUrl = `/api/categories`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const data = await response.json();
        setCategories(data as Category[]);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };
    fetchCategories();
  }, []);
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "本当にこの記事を削除しますか？この操作は元に戻せません。",
    );
    if (!confirmDelete) {
      return;
    }
    setIsSubmitting(true);
    setIsSubmitting(true);
    if (!token) {
      window.alert("予期せぬ動作：トークンが取得できません。");
      return;
    }
    try {
      const requestUrl = `/api/admin/categories/${id}`;
      const res = await fetch(requestUrl, {
        method: "DELETE",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事のDELETEリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
      setCategories((prevCategories) =>
        prevCategories
          ? prevCategories.filter((category) => category.id !== id)
          : null,
      );
    }
  };
  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!categories) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="flex items-center text-gray-500">処理中...</div>
          </div>
        </div>
      )}
      <div className="mb-2 text-2xl font-bold">カテゴリの管理</div>
      <div className="flex w-full justify-end">
        <Link
          href="/admin/categories/new"
          className="m-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          カテゴリの新規作成
        </Link>
      </div>
      <div className="my-1.5 space-y-3">
        {categories.map((category) => (
          <CategoryConfig
            key={category.id}
            category={category}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </main>
  );
};

export default Page;
