import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MESSAGE_ATTACHMENT_MAX_BYTES } from "@/lib/upload-limits";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session || !session.user.emailVerified) {
          throw new Error("You must be signed in to upload files.");
        }

        const match = pathname.match(/^messages\/([^/]+)\//);
        if (!match) {
          throw new Error("Invalid upload path.");
        }

        const profile = await prisma.profile.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        });

        const conversation = profile
          ? await prisma.conversation.findFirst({
              where: {
                id: match[1],
                OR: [
                  { participantOneId: profile.id },
                  { participantTwoId: profile.id },
                ],
              },
              select: { id: true },
            })
          : null;

        if (!conversation) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MESSAGE_ATTACHMENT_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
