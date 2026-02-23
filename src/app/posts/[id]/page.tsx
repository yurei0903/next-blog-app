"use client";
import { useState, useEffect, use } from "react";
import { useParams } from "next/navigation"; // ◀ 注目

import type { Post } from "@/app/_types/Post";
import type { User } from "@/app/_types/User";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";
import CryptoJS from "crypto-js";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

const Page: React.FC = () => {
  const bucketName = "cover-image";
  const [post, setPost] = useState<Post | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const params = useParams();
  // params.id は string | string[] なので、明示的に文字列として扱います
  const id = params.id as string;
  // 環境変数から「APIキー」と「エンドポイント」を取得
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // microCMS から記事データを取得
        const requestUrl = `/api/posts/${id}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const data = await response.json();
        setPost(data as Post);
        if (data.coverImageKey) {
          const publicUrlResult = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.coverImageKey);
          setCoverImageUrl(publicUrlResult.data.publicUrl);
        }
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };
    fetchPosts();
  }, [id]);
  useEffect(() => {
    if (!post || !post.author.id) return;

    const fechAuthUser = async () => {
      try {
        const authorId = post.author.id;
        // useidの状態を介さず直接IDを使っても良い
        const requestUrl = `/api/user/namemail/${authorId}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("情報の取得に失敗しました");
        }
        const data = await response.json();
        console.log("APIから届いたユーザー情報:", data);
        setAuthUser(data.user as User);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };

    fechAuthUser();
  }, [post]);
  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!post) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }
  const safeHTML = DOMPurify.sanitize(post.content);
  return (
    <main>
      <div className="space-y-2">
        <div key={post.id}>
          <div className="mb-2 text-2xl font-bold">{post.title}</div>
          <div className="text-sm text-gray-500">
            投稿日: {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
          </div>
          <Link
            href={`/about/${post.author.id}`}
            className="text-sm text-gray-500"
          >
            作者: {authUser?.name ?? "名無しさん"}
          </Link>
          <div className="category-list">
            {post.categories.map((category) => (
              <div
                key={category.category.id}
                className="mr-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
              >
                {category.category.name}
              </div>
            ))}
          </div>
          <div>
            {coverImageUrl && (
              <Image
                src={coverImageUrl} // coverImageUrlが利用可能ならそれを、そうでなければプレースホルダー画像を表示
                alt="Example Image"
                priority
                className="h-auto w-full rounded-xl"
                width={800}
                height={450}
              />
            )}
          </div>
          <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
        </div>
      </div>
    </main>
  );
};

export default Page;
