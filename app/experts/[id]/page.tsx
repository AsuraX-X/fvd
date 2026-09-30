import AvatarImage from "@/components/common/AvatarImage";
import ProjectDialog from "@/components/experts/ProjectDialog";
import RatingCard from "@/components/experts/RatingCard";
import Review from "@/components/experts/Review";
import Reviews from "@/components/experts/Reviews";
import SaveExpertButton from "@/components/experts/SaveExpertButton";
import { auth } from "@/lib/auth";
import { isPublicExpert } from "@/lib/experts";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    select: {
      firstName: true,
      surname: true,
      specialty: true,
      headline: true,
      bio: true,
      avatar: true,
      role: true,
      listingStatus: true,
    },
  });

  if (!profile || !isPublicExpert(profile)) {
    return { title: "Expert not found", robots: { index: false } };
  }

  const name = `${profile.firstName} ${profile.surname}`.trim();
  const title = profile.specialty ? `${name} — ${profile.specialty}` : name;
  const description =
    profile.headline || profile.bio || `View ${name}'s expert profile on FVD.`;

  return {
    title,
    description,
    alternates: { canonical: `/experts/${id}` },
    openGraph: {
      title,
      description,
      url: `/experts/${id}`,
      images: profile.avatar ? [profile.avatar] : ["/home/hero.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: profile.avatar ? [profile.avatar] : ["/home/hero.png"],
    },
  };
};

const page = async ({ params }: PageProps) => {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const verifiedSession = session?.user.emailVerified ? session : null;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      links: { orderBy: { order: "asc" } },
      selectedProjects: { orderBy: { order: "asc" } },
    },
  });

  if (!profile || profile.role !== "EXPERT") {
    notFound();
  }

  const isOwnProfile = verifiedSession?.user.id === id;
  const isPublic = isPublicExpert(profile);

  // Unlisted profiles 404 for everyone except the expert themselves and admins,
  // who get a preview with a banner explaining why it's hidden.
  if (!isPublic && !isOwnProfile) {
    const viewerProfile = verifiedSession
      ? await prisma.profile.findUnique({
          where: { id: verifiedSession.user.id },
          select: { role: true },
        })
      : null;

    if (viewerProfile?.role !== "ADMIN") {
      notFound();
    }
  }

  const isSaved = verifiedSession
    ? Boolean(
        await prisma.savedExpert.findUnique({
          where: {
            userId_expertId: { userId: verifiedSession.user.id, expertId: id },
          },
        }),
      )
    : false;

  const [reviewRows, ratingGroups] = await Promise.all([
    prisma.review.findMany({
      where: { expertId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            profile: { select: { firstName: true, surname: true, avatar: true } },
          },
        },
      },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { expertId: id },
      _count: { _all: true },
    }),
  ]);

  const ratingCounts: Record<number, number> = {};
  let ratingTotal = 0;
  let ratingCount = 0;
  for (const group of ratingGroups) {
    ratingCounts[group.rating] = group._count._all;
    ratingTotal += group.rating * group._count._all;
    ratingCount += group._count._all;
  }
  const ratingAverage = ratingCount > 0 ? ratingTotal / ratingCount : 0;

  const reviews = reviewRows.map((review) => {
    // user is null once the reviewer has deleted their account.
    const reviewerProfile = review.user?.profile;
    const reviewerName =
      (reviewerProfile &&
        `${reviewerProfile.firstName} ${reviewerProfile.surname}`.trim()) ||
      review.user?.name ||
      "Former member";
    return {
      id: review.id,
      name: reviewerName,
      avatar: reviewerProfile?.avatar ?? review.user?.image ?? null,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  });

  const viewerReview = verifiedSession
    ? reviewRows.find((review) => review.userId === verifiedSession.user.id)
    : undefined;

  const name = `${profile.firstName} ${profile.surname}`.trim();

  return (
    <main className="py-30 px-4 sm:px-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {!isPublic && (
        <p className="text-xs rounded-xl border border-secondary/20 bg-primary-light px-4 py-3">
          {profile.listingStatus === "UNLISTED_BY_ADMIN"
            ? "This profile has been unlisted by an admin and is hidden from the public directory."
            : "This profile is unlisted and hidden from the public directory."}
        </p>
      )}
      <div>
        <Link href={"/experts"}>
          <p className="text-body flex items-center gap-1 text-xs hover:text-secondary transition-colors">
            <ArrowLeft size={14} />
            All Experts
          </p>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex gap-4 min-w-0">
          <div className="relative my-auto w-20 sm:w-32 shrink-0 self-start aspect-square rounded-2xl bg-secondary overflow-hidden">
            {profile.avatar ? (
              <AvatarImage
                key={profile.avatar}
                src={profile.avatar}
                alt={`${name} photo`}
                className="absolute inset-0 h-full w-full object-cover"
                fallback={
                  <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-primary">
                    {name[0]?.toUpperCase() ?? "U"}
                  </span>
                }
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-primary">
                {name[0]?.toUpperCase() ?? "U"}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-between gap-1 min-w-0">
            <div className="text-[10px] sm:text-xs flex flex-wrap uppercase items-center gap-2">
              {profile.specialty && (
                <p className="bg-primary-light px-2 py-1 border border-secondary/20 rounded-full ">
                  {profile.specialty}
                </p>
              )}
              <p>Member since {profile.createdAt.getFullYear()}</p>
            </div>
            <h1 className="text-3xl sm:text-5xl wrap-break-word">{name}</h1>
            {profile.headline && (
              <h2 className="text-sm sm:text-base text-body font-body!">
                {profile.headline}
              </h2>
            )}
          </div>
        </div>

        <SaveExpertButton
          expertId={id}
          initialSaved={isSaved}
          size={14}
          showLabel
          className="button-secondary flex items-center justify-center gap-1 w-full sm:w-auto shrink-0"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="uppercase font-body! text-xs mb-2 text-body">
              About
            </h3>
            <p className="text-sm whitespace-pre-line wrap-break-word">
              {profile.bio || "This expert hasn't added a bio yet."}
            </p>
          </div>
          {profile.selectedProjects.length > 0 && (
            <div>
              <h3 className="uppercase font-body! text-xs mb-4 text-body">
                Selected Work
              </h3>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {profile.selectedProjects.map((project) => (
                  <ProjectDialog
                    image={project.imageUrl}
                    title={project.title}
                    url={project.url}
                    key={project.id}
                  />
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="uppercase font-body! text-xs mb-4 text-body">
              Reviews & Ratings
            </h3>
            <div className="space-y-4">
              <RatingCard
                average={ratingAverage}
                count={ratingCount}
                counts={ratingCounts}
              />
              {!isOwnProfile && isPublic && (
                <Review
                  expertId={id}
                  signedIn={Boolean(verifiedSession)}
                  initialRating={viewerReview?.rating}
                  initialComment={viewerReview?.comment}
                />
              )}
              <Reviews reviews={reviews} />
            </div>
          </div>
        </div>
        <div className="order-first lg:order-0">
          <div className="bg-primary-light lg:sticky lg:top-25 space-y-2 px-4 py-4 rounded-2xl border border-secondary/20">
            <div>
              <p className="small-header mb-1">Rate</p>
              <p className="text-sm sm:text-base">
                {profile.rate
                  ? `from ¢${profile.rate.toLocaleString()}`
                  : "Rate on request"}
              </p>
            </div>
            {profile.links.length > 0 && (
              <div>
                <p className="small-header mb-1">Links</p>
                <ul>
                  {profile.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex text-sm sm:text-base items-center gap-1 py-0.5 border-b w-fit max-w-full break-all border-primary-light hover:border-secondary transition-colors"
                      >
                        {link.label} <ArrowUpRight size={16} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href={`/messages/${id}`}>
              <button className="button-primary mt-2 w-full">
                Start a conversation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
