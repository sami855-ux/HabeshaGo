import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient(); // no need to pass adapter or config
export default prisma;
