import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定
export const dynamic = "force-dynamic";
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};
export const GET = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;

    if (!id) {
      return NextResponse.json(
        { error: "ユーザーIDが指定されていません。" },
        { status: 400 },
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりませんでした。" },
        { status: 404 },
      );
    }
    console.log(user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("ユーザー情報の取得エラー:", error);
    return NextResponse.json(
      { error: "サーバー内部でエラーが発生しました。" },
      { status: 500 },
    );
  }
};
