"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import type { Post } from "@/app/_types/Post";
import { useParams } from "next/navigation";

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};
type SelectableCategory = {
  id: string;
  name: string;
  isSelect: boolean;
};

// カテゴリの新規作成 (追加) のページ
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTitleError, setNewTitleError] = useState("");
  const [newCoverImage, setNewCoverImage] = useState("");
  const [newCoverImageError, setNewCoverImageError] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newContentError, setNewContentError] = useState("");
  const [post, setPost] = useState<Post | null>(null);

  const params = useParams();

  const id = params.id as string;
  // カテゴリ配列 (State)。取得中と取得失敗時は null、既存カテゴリが0個なら []
  const [checkableCategories, setCheckableCategories] = useState<
    SelectableCategory[] | null
  >(null);

  // ウェブAPI (/api/categories) からカテゴリの一覧をフェッチする関数の定義
  const fetchCategories = async () => {
    try {
      // フェッチ処理の本体
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      // レスポンスのステータスコードが200以外の場合 (カテゴリのフェッチに失敗した場合)
      if (!res.ok) {
        setCheckableCategories(null);
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }

      // レスポンスのボディをJSONとして読み取りカテゴリ配列 (State) にセット
      const apiResBody = (await res.json()) as CategoryApiResponse[];
      setCheckableCategories(
        apiResBody.map((body) => ({
          id: body.id,
          name: body.name,
          isSelect: false,
        })),
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    }
  };

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
    setIsLoading(true);
    const fetchPost = async () => {
      try {
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
        console.error(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      }
    };
    fetchCategories();
    fetchPost();
    setIsLoading(false);
  }, [id]);
  useEffect(() => {
    if (post) {
      setNewTitle(post.title);
      setNewContent(post.content);
      setNewCoverImage(post.coverImageURL.url);

      // もしカテゴリのチェック状態も復元する必要があるならここで処理します
      // (post.categoryIds などを使って checkableCategories を更新するなど)
    }
  }, [post]);
  // チェックボックスの状態 (State) を更新する関数
  const switchCategoryState = (categoryId: string) => {
    if (!checkableCategories) return;

    setCheckableCategories(
      checkableCategories.map((category) =>
        category.id === categoryId
          ? { ...category, isSelect: !category.isSelect }
          : category,
      ),
    );
  };

  // カテゴリの名前のバリデーション
  const isValidTitle = (name: string): string => {
    if (name.length < 2 || name.length > 16) {
      return "2文字以上16文字以内で入力してください。";
    }
    return "";
  };
  const isValidContent = (content: string): string => {
    if (content.length <= 2 || content.length >= 256) {
      return "2文字以上256文字以内で入力してください。";
    }
    return "";
  };
  const isValidCoverImage = (url: string): string => {
    if (url.length <= 5 || url.length >= 256) {
      return "5文字以上256文字以内で入力してください。";
    }
    return "";
  };
  // テキストボックスの値が変更されたときにコールされる関数
  const updateNewTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitleError(isValidTitle(e.target.value));
    setNewTitle(e.target.value);
  };
  const updateNewContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewContentError(isValidContent(e.target.value));
    setNewContent(e.target.value);
  };
  const updateNewCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCoverImageError(isValidCoverImage(e.target.value));
    setNewCoverImage(e.target.value);
  };
  // 記事の削除を実行する関数
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "本当にこの記事を削除しますか？この操作は元に戻せません。",
    );
    if (!confirmDelete) {
      return;
    }
    setIsSubmitting(true);
    try {
      const requestUrl = `/api/admin/posts/${id}`;
      const res = await fetch(requestUrl, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      // 削除成功後、管理画面の投稿一覧ページにリダイレクト
      window.location.href = "/admin/posts";
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
  // フォームのボタン (type="submit") がクリックされたときにコールされる関数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // これを実行しないと意図せずページがリロードされるので注意
    setIsSubmitting(true);

    // ▼▼ 追加 ウェブAPI (/api/admin/categories) にPOSTリクエストを送信する処理
    try {
      const requestUrl = `/api/admin/posts/${id}`;
      const res = await fetch(requestUrl, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          coverImageURL: {
            url: newCoverImage,
          },
          categoryIds: checkableCategories
            ?.filter((c) => c.isSelect)
            .map((c) => c.id),
        }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }

      await fetchCategories(); // カテゴリの一覧を再取得
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事のPOSTリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // カテゴリをウェブAPIから取得中の画面
  if (isLoading || !post) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // カテゴリをウェブAPIから取得することに失敗したときの画面
  if (!checkableCategories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  // カテゴリ取得完了後の画面
  return (
    <main>
      <div className="mb-4 text-2xl font-bold">投稿記事の新規作成</div>

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

      <form
        onSubmit={handleSubmit}
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="name" className="block font-bold">
            タイトル
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="新しい投稿記事のタイトルを記入してください"
            value={newTitle}
            onChange={updateNewTitle}
            autoComplete="off"
            required
          />
          {newTitleError && (
            <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mr-0.5"
              />
              <div>{newTitleError}</div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="name" className="block font-bold">
            本文
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-md border-2 px-2 py-2.5"
            placeholder="新しい投稿記事の本文を記入してください"
            value={newContent}
            onChange={updateNewContent}
            autoComplete="off"
            required
          />
          {newContentError && (
            <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mr-0.5"
              />
              <div>{newContentError}</div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="name" className="block font-bold">
            カバーイメージ(画像URL)
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="新しい投稿記事のカバーイメージ(画像URL)を記入してください"
            value={newCoverImage}
            onChange={updateNewCoverImage}
            autoComplete="off"
            required
          />
          {newCoverImageError && (
            <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mr-0.5"
              />
              <div>{newCoverImageError}</div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="font-bold">タグ</div>
          <div className="flex flex-wrap gap-x-3.5">
            {checkableCategories.length > 0 ? (
              checkableCategories.map((c) => (
                <label key={c.id} className="flex space-x-1">
                  <input
                    id={c.id}
                    type="checkbox"
                    checked={c.isSelect}
                    className="mt-0.5 cursor-pointer"
                    onChange={() => switchCategoryState(c.id)}
                  />
                  <span className="cursor-pointer">{c.name}</span>
                </label>
              ))
            ) : (
              <div>選択可能なカテゴリが存在しません。</div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            disabled={isSubmitting || newTitleError !== "" || newTitle === ""}
          >
            記事の更新
          </button>
          <button
            type="button"
            className={twMerge(
              "ml-2 rounded-md px-5 py-1 font-bold",
              "bg-red-500 text-white hover:bg-red-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            onClick={handleDelete}
          >
            記事の削除
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
