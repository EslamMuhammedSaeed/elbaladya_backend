const prisma = require("../../config/database");
const {
  generatePassword,
  validatePassword,
} = require("../../Middlewares/password");
const AdminQueries = {
  getAdminById: async (_, { id }) => prisma.admin.findUnique({ where: { id } }),
  getAllAdmins: () => prisma.admin.findMany(),
};

const AdminMutations = {
  createAdmin: async (_, { name, email, hashedPassword }) => {
    hashedPassword = generatePassword(hashedPassword);
    email = email.toLowerCase();
    return prisma.admin.create({ data: { name, email, hashedPassword } });
  },
  adminLogin: async (_, { email, hashedPassword, macAddress, deviceName }) => {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new Error("Admin not found");
    }
    if (!validatePassword(hashedPassword, admin.hashedPassword)) {
      throw new Error("Invalid password");
    }
    if (macAddress && deviceName) {
      const device = await prisma.device.findUnique({ where: { macAddress } });
      if (!device) {
        await prisma.device.create({
          data: {
            name: deviceName,
            macAddress,
            adminId: admin.id,
          },
        });
      }
    }
    return admin;
  },
};

const AdminRelations = {
  Admin: {
    devices: async (parent) => {
      return prisma.device.findMany({ where: { adminId: parent.id } });
    },
    students: (parent) => {
      return prisma.student.findMany({ where: { adminId: parent.id } });
    },
  },
};

module.exports = {
  AdminQueries,
  AdminMutations,
  AdminRelations,
};
