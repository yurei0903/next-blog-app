"use client";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";
import type { Post } from "@/app/_types/Post";
import PostConfig from "@/app/_components/PostConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";
import ValidationAlert from "@/app/_components/ValidationAlert";
const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  // isLoading（取得中かどうかの判定）も useAuth から受け取ると便利です
  const { token, isLoading, user: authUser } = useAuth();
  const [localUser, setLocalUser] = useState<typeof authUser | null>(null);
  useEffect(() => {
    if (authUser) {
      setLocalUser(authUser);
    }
  }, [authUser]);
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
  }, [token, isLoading, authUser]);
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
  const updateEmailField = (value: string) => {
    setEditEmail(value);
    if (value.length > 0 && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("メールアドレスの形式で入力してください。");
      return;
    }
    setEmailError("");
  };
  const updatenameField = (value: string) => {
    setEditName(value);
    if (value.length === 0) {
      setNameError("アカウント名を入力してください。");
      return;
    }
    setNameError("");
  };
  // 名前の「変更」ボタンを押した時
  const handleEditNameClick = () => {
    setEditName(authUser?.name || ""); // 現在の名前を入力欄にセット
    setIsEditingName(true); // 編集モードをON
  };

  // 名前の「保存」ボタンを押した時
  const handleSaveName = async () => {
    if (!token) {
      window.alert("予期せぬ動作：トークンが取得できません。");
      return;
    }
    const checkRes = await fetch(
      `/api/user/check-availability?name=${editName}&email=${authUser?.email || ""}`,
    );

    if (!checkRes.ok) {
      throw new Error("重複チェックAPIの通信に失敗しました。");
    }

    const { isNameAvailable, isEmailAvailable } = await checkRes.json();

    //判定結果をもとに、エラーメッセージをセットする
    let hasError = false;

    if (!isNameAvailable) {
      setNameError("このアカウント名は既に使われています。");
      hasError = true;
    }
    if (!isEmailAvailable) {
      setEmailError("このメールアドレスは既に登録されています。");
      hasError = true;
    }

    // どちらか1つでも重複していたら、ここで処理を止める
    if (hasError) {
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const requestUrl = `/api/admin/user/${authUser?.id}`;

      const res = await fetch(requestUrl, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          name: editName,
          email: authUser?.email || "", // メールアドレスは変更しないので、現在の値をそのまま送る
        }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }
      setLocalUser((prev) => (prev ? { ...prev, name: editName } : null));
      setIsEditingName(false);
    } catch (error) {
      alert("名前の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // メールアドレスの「変更」ボタンを押した時
  const handleEditEmailClick = () => {
    setEditEmail(authUser?.email || "");
    setIsEditingEmail(true);
  };

  // メールアドレスの「保存」ボタンを押した時
  const handleSaveEmail = async () => {
    setIsSubmitting(true);
    if (!token) {
      window.alert("予期せぬ動作：トークンが取得できません。");
      setIsSubmitting(false);
      return;
    }
    const checkRes = await fetch(
      `/api/user/check-availability?name=${authUser?.name || ""}&email=${editEmail}`,
    );

    if (!checkRes.ok) {
      throw new Error("重複チェックAPIの通信に失敗しました。");
    }

    const { isNameAvailable, isEmailAvailable } = await checkRes.json();

    //判定結果をもとに、エラーメッセージをセットする
    let hasError = false;

    if (!isNameAvailable) {
      setNameError("このアカウント名は既に使われています。");
      hasError = true;
    }
    if (!isEmailAvailable) {
      setEmailError("このメールアドレスは既に登録されています。");
      hasError = true;
    }

    // どちらか1つでも重複していたら、ここで処理を止める
    if (hasError) {
      setIsSubmitting(false);
      return;
    }
    try {
      const requestUrl = `/api/admin/user/${authUser?.id}`;

      const res = await fetch(requestUrl, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          name: authUser?.name || "", // 名前は変更しないので、現在の値をそのまま送る
          email: editEmail,
        }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }
      setIsEditingEmail(false);
    } catch (error) {
      alert("メールアドレスの更新に失敗しました");
    } finally {
      setLocalUser((prev) => (prev ? { ...prev, email: editEmail } : null));
      setIsEditingEmail(false);
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
        <div className="space-y-4">
          {/* --- 名前の表示・編集エリア --- */}
          <div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => updatenameField(e.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 text-2xl font-bold text-slate-800 outline-none focus:border-blue-500"
                />
                <ValidationAlert msg={nameError} />
                <button
                  onClick={handleSaveName}
                  className="rounded bg-blue-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-blue-600"
                >
                  保存
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="rounded bg-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-300"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-slate-800">
                  {localUser?.name || "名無しユーザー"}
                </div>
                <button
                  onClick={handleEditNameClick}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  変更
                </button>
              </div>
            )}
          </div>

          {/* --- メールアドレスの表示・編集エリア --- */}
          <div>
            {isEditingEmail ? (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => updateEmailField(e.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 text-slate-800 outline-none focus:border-blue-500"
                />
                <ValidationAlert msg={emailError} />
                <button
                  onClick={handleSaveEmail}
                  className="rounded bg-blue-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-blue-600"
                >
                  保存
                </button>
                <button
                  onClick={() => setIsEditingEmail(false)}
                  className="rounded bg-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-300"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="mt-1 text-slate-500">{localUser?.email}</div>
                <button
                  onClick={handleEditEmailClick}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  変更
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="my-3 mb-2 text-2xl font-bold">作成したブログ</div>
      <Link
        href="/admin/posts/new"
        className="my-2.5 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        投稿記事の新規作成
      </Link>
      <div className="my-2.5 space-y-3">
        {posts.map((post) => (
          <PostConfig key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>
    </main>
  );
};

export default Page;
