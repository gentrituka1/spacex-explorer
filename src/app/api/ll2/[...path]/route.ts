import { NextRequest, NextResponse } from "next/server";

const LL2_BASE =
  process.env.LL2_API_BASE ?? "https://ll.thespacedevs.com/2.3.0";

const REVALIDATE_SECONDS = 300;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const segment = path.join("/");
  const search = request.nextUrl.search;
  const target = `${LL2_BASE}/${segment}/${search}`;

  try {
    const response = await fetch(target, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=600`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Upstream LL2 fetch failed",
      },
      { status: 502 },
    );
  }
}
