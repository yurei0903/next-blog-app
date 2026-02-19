import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; // ※ご自身の環境に合わせてパスを調整してください

// GETリクエストを処理する関数
export const GET = async (req: NextRequest) => {
  try {
    // 1. URLから「name」のクエリパラメータを取得（例: ?name=hoge太郎）
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");

    // 名前が空っぽで送られてきた場合はエラーを返す
    if (!name) {
      return NextResponse.json(
        { error: "アカウント名が指定されていません。" },
        { status: 400 },
      );
    }

    // 2. Prismaを使って、データベース内に同じ名前のユーザーがいるか検索
    // （見つかればそのユーザー情報が、見つからなければ null が返ります）
    const existingUser = await prisma.user.findFirst({
      where: {
        name: name,
      },
    });

    // 3. ユーザーが存在しなければ true (使用可能)、存在すれば false (使用不可) にする
    const isAvailable = existingUser === null;

    // 結果をフロントエンドに返す
    return NextResponse.json({ isAvailable }, { status: 200 });
  } catch (error) {
    console.error("名前重複チェックAPIエラー:", error);
    return NextResponse.json(
      { error: "サーバー内部でエラーが発生しました。" },
      { status: 500 },
    );
  }
};
