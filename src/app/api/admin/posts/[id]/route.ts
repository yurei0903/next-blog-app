import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Post } from "@/generated/prisma/client";
import { supabase } from "@/utils/supabase"; // ◀ 追加
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type RequestBody = {
  title: string;
  content: string;
  coverImageURL: string;
  categoryIds: string[];
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
    const { title, content, coverImageURL, categoryIds } = requestBody;
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
    await prisma.postCategory.deleteMany({
      where: {
        postId: id,
      },
    });

    const post: Post = await prisma.post.update({
      where: { id },
      data: { title, content, coverImageURL },
    });
    for (const categoryId of categoryIds) {
      await prisma.postCategory.create({
        data: {
          postId: id,
          categoryId: categoryId,
        },
      });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "記事の更新に失敗しました" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest, routeParams: RouteParams) => {
  const token = req.headers.get("Authorization") ?? "";
  const { data, error } = await supabase.auth.getUser(token);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });
  try {
    const { id } = await routeParams.params;
    const post: Post = await prisma.post.delete({ where: { id } });
    return NextResponse.json({ msg: `「${post.title}」を削除しました。` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "記事の削除に失敗しました" },
      { status: 500 },
    );
  }
};
