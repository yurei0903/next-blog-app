import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { User } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase"; // ◀ 追加
export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定
type RequestBody = {
  email: string;
  name: string;
  auth_id: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const requestBody: RequestBody = await req.json();

    // 分割代入
    const { email, name, auth_id } = requestBody;

    const user: User = await prisma.user.create({
      data: {
        email,
        name,
        auth_id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ユーザーの作成に失敗しました" },
      { status: 500 },
    );
  }
};
