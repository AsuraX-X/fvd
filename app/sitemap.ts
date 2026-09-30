import { PUBLIC_EXPERT_WHERE } from "@/lib/experts";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const experts = await prisma.profile.findMany({
    where: PUBLIC_EXPERT_WHERE,
    select: { id: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/services`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/experts`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const expertRoutes: MetadataRoute.Sitemap = experts.map((expert) => ({
    url: `${SITE_URL}/experts/${expert.id}`,
    lastModified: expert.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...expertRoutes];
}
