import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;
    const result = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!result) {
      return NextResponse.json(
        { error: "id=投稿記事は見つかりませんでした" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の作成に失敗しました" },
      { status: 500 },
    );
  }
};
