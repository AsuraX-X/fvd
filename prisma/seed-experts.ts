import "dotenv/config";

import { put } from "@vercel/blob";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ExpertSeed = {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  location: string;
  headline: string;
  website: string;
  bio: string;
  specialty: string;
  avatarFile: string;
  links: { label: string; url: string }[];
  projects: { title: string; url: string; imageUrl: string }[];
};

const EXPERTS: ExpertSeed[] = [
  {
    firstName: "Maya",
    surname: "Chen",
    email: "maya.chen@example.com",
    password: "Password123!",
    location: "New York, NY",
    headline: "Brand direction for bold, sensory-first campaigns",
    website: "https://mayachen.design",
    bio: "Maya has spent the last decade shaping visual identities for experiential brands, blending typography, motion, and space into cohesive campaigns.",
    specialty: "Brand Direction",
    avatarFile: "person1.png",
    links: [
      { label: "Website", url: "https://mayachen.design" },
      { label: "Instagram", url: "https://instagram.com/mayachendesign" },
      { label: "LinkedIn", url: "https://linkedin.com/in/mayachen" },
    ],
    projects: [
      {
        title: "Lumen Festival Identity",
        url: "https://example.com/projects/lumen",
        imageUrl: "https://picsum.photos/seed/lumen-festival/800/600",
      },
      {
        title: "Nova Retail Rebrand",
        url: "https://example.com/projects/nova",
        imageUrl: "https://picsum.photos/seed/nova-retail/800/600",
      },
      {
        title: "Echo Product Launch",
        url: "https://example.com/projects/echo",
        imageUrl: "https://picsum.photos/seed/echo-launch/800/600",
      },
    ],
  },
  {
    firstName: "Amara",
    surname: "Okafor",
    email: "amara.okafor@example.com",
    password: "Password123!",
    location: "Lagos, Nigeria",
    headline: "Motion & animation for stories that move",
    website: "https://amaraokafor.studio",
    bio: "Amara directs motion graphics and animation for brands looking to turn static ideas into living, breathing narratives.",
    specialty: "Motion Graphics & Animation",
    avatarFile: "person2.png",
    links: [
      { label: "Website", url: "https://amaraokafor.studio" },
      { label: "Instagram", url: "https://instagram.com/amaraokafor" },
      { label: "Behance", url: "https://behance.net/amaraokafor" },
    ],
    projects: [
      {
        title: "Solstice Brand Film",
        url: "https://example.com/projects/solstice",
        imageUrl: "https://picsum.photos/seed/solstice-film/800/600",
      },
      {
        title: "Pulse App Motion System",
        url: "https://example.com/projects/pulse",
        imageUrl: "https://picsum.photos/seed/pulse-motion/800/600",
      },
      {
        title: "Wander Travel Campaign",
        url: "https://example.com/projects/wander",
        imageUrl: "https://picsum.photos/seed/wander-campaign/800/600",
      },
    ],
  },
  {
    firstName: "Diego",
    surname: "Torres",
    email: "diego.torres@example.com",
    password: "Password123!",
    location: "Barcelona, Spain",
    headline: "Experiential design for spaces people remember",
    website: "https://diegotorres.co",
    bio: "Diego designs experiential activations and installations that turn physical spaces into unforgettable brand moments.",
    specialty: "Experiential Design",
    avatarFile: "person3.png",
    links: [
      { label: "Website", url: "https://diegotorres.co" },
      { label: "Instagram", url: "https://instagram.com/diegotorres.design" },
    ],
    projects: [
      {
        title: "Aurora Pop-Up Activation",
        url: "https://example.com/projects/aurora",
        imageUrl: "https://picsum.photos/seed/aurora-popup/800/600",
      },
      {
        title: "Terra Exhibition Space",
        url: "https://example.com/projects/terra",
        imageUrl: "https://picsum.photos/seed/terra-exhibit/800/600",
      },
      {
        title: "Horizon Flagship Store",
        url: "https://example.com/projects/horizon",
        imageUrl: "https://picsum.photos/seed/horizon-store/800/600",
      },
      {
        title: "Nimbus Trade Booth",
        url: "https://example.com/projects/nimbus",
        imageUrl: "https://picsum.photos/seed/nimbus-booth/800/600",
      },
    ],
  },
];

async function uploadAvatar(userId: string, filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), filename);
  const original = readFileSync(filePath);
  const optimized = await sharp(original)
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();

  const webpFilename = filename.replace(/\.\w+$/, ".webp");
  const blob = await put(`profile/${userId}/avatar/${webpFilename}`, optimized, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: true,
  });
  return blob.url;
}

async function seedExpert(expert: ExpertSeed) {
  const existingProfile = await prisma.profile.findUnique({
    where: { email: expert.email },
  });

  const userId = existingProfile
    ? existingProfile.userId
    : (
        await auth.api.signUpEmail({
          body: {
            name: `${expert.firstName} ${expert.surname}`,
            email: expert.email,
            password: expert.password,
          },
        })
      ).user.id;

  const avatarUrl = await uploadAvatar(userId, expert.avatarFile);

  const profile = await prisma.profile.update({
    where: { userId },
    data: {
      firstName: expert.firstName,
      surname: expert.surname,
      location: expert.location,
      headline: expert.headline,
      website: expert.website,
      bio: expert.bio,
      specialty: expert.specialty,
      avatar: avatarUrl,
      role: "EXPERT",
    },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: `${expert.firstName} ${expert.surname}`,
        image: avatarUrl,
      },
    }),
    prisma.profileLink.deleteMany({ where: { profileId: profile.id } }),
    prisma.profileLink.createMany({
      data: expert.links.map((link, order) => ({
        ...link,
        order,
        profileId: profile.id,
      })),
    }),
    prisma.selectedProject.deleteMany({ where: { profileId: profile.id } }),
    prisma.selectedProject.createMany({
      data: expert.projects.map((project, order) => ({
        ...project,
        order,
        profileId: profile.id,
      })),
    }),
  ]);

  console.log(`Seeded expert -> ${expert.email}`);
}

async function main() {
  for (const expert of EXPERTS) {
    await seedExpert(expert);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
