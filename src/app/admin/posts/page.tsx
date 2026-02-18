"use client";
import { useState, useEffect } from "react";
import type { Post } from "@/app/_types/Post";
import PostConfig from "@/app/_components/PostConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { is } from "date-fns/locale";
import Link from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";

const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // microCMS から記事データを取得
        const requestUrl = `/api/posts`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const data = await response.json();
        setPosts(data as Post[]);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };
    fetchPosts();
  }, []);
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "本当にこの記事を削除しますか？この操作は元に戻せません。",
    );
    if (!confirmDelete) {
      return;
    }
    if (!token) {
      window.alert("予期せぬ動作：トークンが取得できません。");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestUrl = `/api/admin/posts/${id}`;
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
      setPosts((prevPosts) =>
        prevPosts ? prevPosts.filter((post) => post.id !== id) : null,
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事のDELETEリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!posts) {
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
      <div className="my-1.5mb-2 text-2xl font-bold">Main</div>
      <div className="my-2 flex w-full justify-end">
        <Link
          href="/admin/posts/new"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          投稿記事の新規作成
        </Link>
      </div>
      <div className="my-1.5 space-y-3">
        {posts.map((post) => (
          <PostConfig key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>
    </main>
  );
};

export default Page;
