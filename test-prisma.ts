import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("User:", user);
    
    // Simulate what the GET route does
    const payments = await prisma.payment.findMany({ where: { userId: user?.id }, orderBy: { createdAt: "desc" } });
    console.log("Payments:", payments);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    // We shouldn't disconnect in the script but just to exit cleanly
    // await prisma.$disconnect();
  }
}
main();
