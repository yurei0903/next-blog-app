"use client";
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import { User } from "@/generated/prisma/client";

type UserType = User | null;

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [isSessionFetched, setIsSessionFetched] = useState(false);
  // 1. Supabaseの認証状態を確認・監視する処理
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setToken(session?.access_token || null);
      } catch (error) {
        console.error(`セッションの取得に失敗しました。\n${error}`);
        setIsLoading(false);
      } finally {
        setIsSessionFetched(true);
      }
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setToken(session?.access_token || null);
        if (!session) {
          setUser(null);
        }
      },
    );

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  // 2. セッション情報を元に、Prismaからユーザー情報を取得する処理 【ここを追加！】
  useEffect(() => {
    if (!isSessionFetched) {
      return;
    }
    const fetchDBUser = async () => {
      // セッションがない（未ログイン）場合は何もせずローディングを終了
      if (!session?.user?.id) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // SupabaseのユーザーID(auth_id)を使って、自作のAPIを叩く
        const response = await fetch(`/api/user/${session.user.id}`);

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // データベースから取ってきたプロフィールをセット
        } else {
          console.error("ユーザーデータの取得に失敗しました");
        }
      } catch (error) {
        console.error("API通信エラー:", error);
      } finally {
        // データベースの取得が終わったここで、初めてローディングを完了させる
        setIsLoading(false);
      }
    };

    fetchDBUser();
  }, [session, isSessionFetched]); // 🌟 session が変化するたびにこの処理が走ります

  // 3. 取得した user も一緒に返すように変更 【ここを変更！】
  return { isLoading, session, token, user };
};
