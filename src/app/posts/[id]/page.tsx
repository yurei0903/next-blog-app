"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ◀ 注目

import type { Post } from "@/app/_types/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";

const Page: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
            {post.coverImageURL && (
              <Image
                src={post.coverImageURL}
                alt="Example Image"
                priority
                className="rounded-xl"
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
