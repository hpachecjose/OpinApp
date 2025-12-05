// backend/src/dbTest.js
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./utils/hashPassword.js"; // supondo que exista

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.users.findUnique({ where: { email: "henrique@example.com" } });
  if (!existing) {
    const hashed = await hashPassword("123456");
    const user = await prisma.users.create({
      data: {
        nome: "Henrique",
        email: "henrique@example.com",
        senha_hash: hashed   // <--- usar senha_hash para ficar consistente com server.js
      }
    });
    console.log("Usuário criado:", user);
  } else {
    console.log("Usuário já existe:", existing);
  }

  const users = await prisma.users.findMany();
  console.log("Usuários no banco:", users);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
