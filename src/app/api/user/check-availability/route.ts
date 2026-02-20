import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");
    const email = searchParams.get("email");

    // どちらも空っぽの場合はエラー
    if (!name && !email) {
      return NextResponse.json(
        { error: "確認するパラメータ(nameまたはemail)が指定されていません。" },
        { status: 400 },
      );
    }

    const [existingName, existingEmail] = await Promise.all([
      // nameが送られてきたら検索、なければ null を返す
      name
        ? prisma.user.findFirst({ where: { name: name } })
        : Promise.resolve(null),
      // emailが送られてきたら検索、なければ null を返す
      email
        ? prisma.user.findUnique({ where: { email: email } })
        : Promise.resolve(null),
    ]);

    // それぞれ「存在しなければ true (使用可能)」とする
    const isNameAvailable = existingName === null;
    const isEmailAvailable = existingEmail === null;

    // 判定結果をまとめてフロントエンドに返す
    return NextResponse.json(
      {
        isNameAvailable,
        isEmailAvailable,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("重複チェックAPIエラー:", error);
    return NextResponse.json(
      { error: "サーバー内部でエラーが発生しました。" },
      { status: 500 },
    );
  }
};
