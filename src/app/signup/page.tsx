"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import ValidationAlert from "../_components/ValidationAlert";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [account_name, setAccountName] = useState("");
  const [nameError, setNameError] = useState("");

  const router = useRouter();
  const updateEmailField = (value: string) => {
    setEmail(value);
    if (value.length > 0 && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("メールアドレスの形式で入力してください。");
      return;
    }
    setEmailError("");
  };
  const updatenameField = (value: string) => {
    setAccountName(value);
    if (value.length === 0) {
      setNameError("アカウント名を入力してください。");
      return;
    }
    setNameError("");
  };

  // フォームのログインボタンが押下されたときの処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      console.log("サインアップ処理を実行します。");
      const checkRes = await fetch(
        `/api/user/check-availability?name=${account_name}&email=${email}`,
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setLoginError(`サインアップに失敗しました（${error.code}）。`);
        console.error(JSON.stringify(error, null, 2));
        return;
      }
      if (data.user) {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auth_id: data.user.id,
            email: email,
            name: account_name,
          }),
        });
        if (!res.ok) {
          throw new Error(
            `ユーザー情報の保存に失敗しました（${res.status}）。`,
          );
        }
      }
      console.log("サインアップ処理に成功しました。");
      router.replace("/login");
    } catch (error) {
      setLoginError("サインアップ処理中に予期せぬエラーが発生しました。");
      console.error(JSON.stringify(error, null, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div className="mb-2 text-2xl font-bold">新規作成</div>
      <ValidationAlert msg={loginError} />
      <form
        onSubmit={handleSubmit}
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="name" className="block font-bold">
            <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
            アカウント名
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="hoge太郎"
            value={account_name}
            onChange={(e) => updatenameField(e.target.value)}
            required
          />
          <ValidationAlert msg={nameError} />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block font-bold">
            <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
            ログインID（email）
          </label>
          <input
            type="text"
            id="email"
            name="email"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="hoge@example.com"
            value={email}
            onChange={(e) => updateEmailField(e.target.value)}
            required
          />
          <ValidationAlert msg={emailError} />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block font-bold">
            <FontAwesomeIcon icon={faKey} className="mr-1" />
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            disabled={
              isSubmitting ||
              emailError !== "" ||
              email.length === 0 ||
              password.length === 0
            }
          >
            作成
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
