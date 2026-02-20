import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { Post } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase"; // ◀ 追加
export const dynamic = "force-dynamic";
type RequestBody = {
  title: string;
  content: string;
  coverImageURL: string;
  categoryIds: string[];
};

export const POST = async (req: NextRequest) => {
  const token = req.headers.get("Authorization") ?? "";
  const { data, error } = await supabase.auth.getUser(token);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });
  try {
    const requestBody: RequestBody = await req.json();

    // 分割代入
    const { title, content, coverImageURL, categoryIds } = requestBody;

    // categoryIds で指定されるカテゴリがDB上に存在するか確認
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });
    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "指定されたカテゴリのいくつかが存在しません" },
        { status: 400 }, // 400: Bad Request
      );
    }

    // 投稿記事テーブルにレコードを追加
    const post: Post = await prisma.post.create({
      data: {
        title, // title: title の省略形であることに注意。以下も同様
        content,
        coverImageURL,
      },
    });

    // 中間テーブルにレコードを追加
    for (const categoryId of categoryIds) {
      await prisma.postCategory.create({
        data: {
          postId: post.id,
          categoryId: categoryId,
        },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の作成に失敗しました" },
      { status: 500 },
    );
  }
};
export const GET = async (req: NextRequest) => {
  try {
    // 1. フロントエンドから送られてきたトークン（Authorizationヘッダー）を取得
    const token = req.headers.get("Authorization");

    if (!token) {
      return NextResponse.json(
        { error: "認証トークンがありません。" },
        { status: 401 },
      );
    }

    // 2. トークンを使ってSupabaseに「このユーザーは本物か？」を確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "認証に失敗しました。ログインし直してください。" },
        { status: 401 },
      );
    }

    // 3. SupabaseのID (auth_id) から、Prisma(データベース)上のユーザー情報を探す
    const dbUser = await prisma.user.findUnique({
      where: {
        auth_id: user.id,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "データベースにユーザーが存在しません。" },
        { status: 404 },
      );
    }

    // 4. そのユーザーが書いた記事（authorId が一致するもの）だけを全て取得
    const posts = await prisma.post.findMany({
      where: {
        authorId: dbUser.id, // 🌟 ここで「自分の記事だけ」に絞り込み！
      },
      orderBy: {
        createdAt: "desc", // 新しい記事が一番上に来るように並び替え
      },
      // 中間テーブルを経由して、カテゴリ情報なども一緒に取得（必要に応じて）
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // 5. 取得した記事の配列をフロントエンドに返す
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("ユーザー専用記事取得エラー:", error);
    return NextResponse.json(
      { error: "サーバー内部でエラーが発生しました。" },
      { status: 500 },
    );
  }
};
