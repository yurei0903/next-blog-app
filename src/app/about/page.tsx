"use client";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import type { Post } from "@/app/_types/Post";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";
const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // isLoading（取得中かどうかの判定）も useAuth から受け取ると便利です
  const { token, isLoading, user: authUser } = useAuth();

  useEffect(() => {
    // 認証確認中またはトークンがない場合は、データの取得を行わない
    if (isLoading || !token) return;

    const fetchPosts = async () => {
      try {
        const requestUrl = `/api/admin/posts`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
          headers: {
            //誰からのリクエストか証明するためにトークンを送る
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const data = await response.json();
        setPosts(data.posts as Post[]); // ※APIの返し方( { posts: [...] } )に合わせて調整してください
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };

    fetchPosts();
  }, [token, isLoading]);
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
      <div className="mb-5 text-2xl font-bold">プロフィール</div>

      <div
        className={twMerge(
          "mx-auto mb-5 w-full md:w-2/3",
          "flex justify-center",
        )}
      >
        <Image
          src="/images/ango.png"
          alt="Example Image"
          width={350}
          height={350}
          priority
          className="rounded-full border-4 border-slate-500 p-1.5"
        />
      </div>
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
      <div>
        {/* authUserの中に入っている名前とメールアドレスを表示 */}
        <div className="text-2xl font-bold text-slate-800">
          {authUser?.name || "名無しユーザー"}
        </div>
        <div className="mt-1 text-slate-500">{authUser?.email}</div>
      </div>
      <div className="my-1.5mb-2 text-2xl font-bold">作成したブログ</div>

      <div className="my-1.5 space-y-3">
        {posts.map((post) => (
          <PostSummary key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
};

export default Page;
