"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ◀ 注目

import type { Post } from "@/app/_types/Post";
import dummyPosts from "@/app/_mocks/dummyPosts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";
const apiBaseEp = process.env.NEXT_PUBLIC_MICROCMS_BASE_EP!;
const apiKey = process.env.NEXT_PUBLIC_MICROCMS_API_KEY!;
// 投稿記事の詳細表示 /posts/[id]

const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 環境変数から「APIキー」と「エンドポイント」を取得
  const apiBaseEp = process.env.NEXT_PUBLIC_MICROCMS_BASE_EP!;
  const apiKey = process.env.NEXT_PUBLIC_MICROCMS_API_KEY!;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // microCMS から記事データを取得
        const requestUrl = `${apiBaseEp}/posts`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
          headers: {
            "X-MICROCMS-API-KEY": apiKey,
          },
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const data = await response.json();
        setPosts(data.contents as Post[]);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };
    fetchPosts();
  }, [apiBaseEp, apiKey]);

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
      <div className="space-y-2">
        {posts.map((post) => {
          const safeHTML = DOMPurify.sanitize(post.content);
          return (
            <div key={post.id}>
              <div className="mb-2 text-2xl font-bold">{post.title}</div>
              <div className="text-sm text-gray-500">
                投稿日: {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
              </div>
              <div className="category-list">
                {post.categories.map((category) => (
                  <div
                    key={category.id}
                    className="mr-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
                  >
                    {category.name}
                  </div>
                ))}
              </div>
              <div>
                <Image
                  src={post.coverImage.url}
                  alt="Example Image"
                  width={post.coverImage.width}
                  height={post.coverImage.height}
                  priority
                  className="rounded-xl"
                />
              </div>
              <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Page;
