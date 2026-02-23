import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { User } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase"; // ◀ 追加
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type RequestBody = {
  name: string;
  email: string;
  ImageKey: string;
};

export const PUT = async (req: NextRequest, routeParams: RouteParams) => {
  const token = req.headers.get("Authorization") ?? "";
  const { data, error } = await supabase.auth.getUser(token);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });
  try {
    const requestBody: RequestBody = await req.json();

    // 分割代入
    const { id } = await routeParams.params;
    const { name, email, ImageKey } = requestBody;

    const user: User = await prisma.user.update({
      where: { id },
      data: { name, email, ImageKey },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "ユーザーの更新に失敗しました" },
      { status: 500 },
    );
  }
};
