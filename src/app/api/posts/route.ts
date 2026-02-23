import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Post } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定
export const dynamic = "force-dynamic"; // ◀ 〃

export const GET = async (req: NextRequest) => {
  const serchParams = req.nextUrl.searchParams;
  const categoryId = serchParams.get("categoryId");
  const authorId = serchParams.get("authorId");
  const keywords = serchParams.get("keywords");
  const published = serchParams.get("published");
  const whereConditions: Prisma.PostWhereInput = {};
  if (categoryId) {
    whereConditions.categories = {
      some: {
        categoryId: categoryId,
      },
    };
  }
  if (authorId) {
    whereConditions.authorId = authorId;
  }
  if (keywords) {
    whereConditions.OR = [
      { title: { contains: keywords } },
      { content: { contains: keywords } },
    ];
  }
  whereConditions.published = true;
  if (published === "false") {
    whereConditions.published = false;
  }
  try {
    const posts = await prisma.post.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        categories: {
          select: { category: { select: { id: true, name: true } } },
        },
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
};
