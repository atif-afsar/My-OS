import { prisma } from "./prisma";

export async function getOrCreateDefaultUser() {
  let user = await prisma.user.findFirst({
    include: { settings: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "MyOS User",
        email: "user@myos.local",
        avatar: "",
        settings: {
          create: {
            theme: "dark",
            accentColor: "#5E0ED7",
            language: "en",
            notifications: true,
          },
        },
      },
      include: { settings: true },
    });
  }

  return user;
}
