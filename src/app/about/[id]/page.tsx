"use client";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import type { Post } from "@/app/_types/Post";
import type { User } from "@/app/_types/User";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "next/navigation";
import Link from "next/link";
const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const params = useParams();
  const id = params.id as string;
  useEffect(() => {
    // ユーザーのメールアドレスと名前を取得するAPIを呼び出す
    const fechAuthUser = async () => {
      try {
        const requestUrl = `/api/user/namemail/?id=${id}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("情報の取得に失敗しました");
        }
        const data = await response.json();
        setAuthUser(data.user as User);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };
    fechAuthUser();

    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams();
        params.append("authorId", id);
        const requestUrl = `/api/posts?${params.toString()}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const data = await response.json();
        setPosts(data as Post[]); // ※APIの返し方( { posts: [...] } )に合わせて調整してください
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };

    fetchPosts();
  }, [id]);

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
      <div className="my-3 mb-2 text-2xl font-bold">作成したブログ</div>

      <div className="my-2.5 space-y-3">
        {posts.map((post) => (
          <PostSummary key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
};

export default Page;
