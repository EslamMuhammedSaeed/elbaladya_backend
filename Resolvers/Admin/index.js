const prisma = require("../../config/database");
const csv = require("csv-parser");

const {
  generatePassword,
  validatePassword,
} = require("../../Middlewares/password");

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePasswordStrength = (password) => {
  // At least 8 characters, including uppercase, lowercase, number, special character
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};
const AdminQueries = {
  getAdminById: async (_, { id }) => prisma.admin.findUnique({ where: { id } }),
  getAllAdmins: () => prisma.admin.findMany(),
  getAllAdminsPaginated: async (_, { page = 1, perPage = 10, sortBy, filters = {} }) => {
    const prismaFilters = {};

    if (filters.id) {
      prismaFilters.id = { contains: filters.id };
    }

    if (filters.name) {
      prismaFilters.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters.email) {
      prismaFilters.email = {
        contains: filters.email,
        mode: "insensitive",
      };
    }

    if (filters.group) {
      prismaFilters.groupId = filters.group;
    }
    const admins = await prisma.admin.findMany({

      where: prismaFilters,
      include: { group: true },

    });


    const validSorts = [
      "name",
      "email",
    ];

    if (sortBy && validSorts.includes(sortBy)) {
      admins.sort((a, b) => {
        if (sortBy === "name") {
          return b.name.localeCompare(a.name);
        } else if (sortBy === "email") {
          return b.email.localeCompare(a.email);
        } else {
          return (b[sortBy] || 0) - (a[sortBy] || 0);
        }
      });
    }

    const total = admins.length;
    const start = (page - 1) * perPage;
    const paginated = admins.slice(start, start + perPage);

    return {
      data: paginated,
      total,
      per_page: perPage,
      current_page: page,
      last_page: Math.ceil(total / perPage),
    };
  },
  getAllAdminsNotPaginated: async (_, { sortBy, filters = {} }) => {
    const prismaFilters = {};

    if (filters.id) {
      prismaFilters.id = { contains: filters.id };
    }

    if (filters.name) {
      prismaFilters.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters.email) {
      prismaFilters.email = {
        contains: filters.email,
        mode: "insensitive",
      };
    }

    if (filters.group) {
      prismaFilters.groupId = filters.group;
    }

    const admins = await prisma.admin.findMany({
      where: prismaFilters,
      include: { group: true },

    });


    const validSorts = [
      "name",
      "email",
    ];

    if (sortBy && validSorts.includes(sortBy)) {
      admins.sort((a, b) => {
        if (sortBy === "name") {
          return b.name.localeCompare(a.name);
        } else if (sortBy === "email") {
          return b.email.localeCompare(a.email);
        } else {
          return (b[sortBy] || 0) - (a[sortBy] || 0);
        }
      });
    }



    return {
      data: admins,

    };
  }

};

const AdminMutations = {
  createAdmin: async (_, { name, email, hashedPassword, groupId }) => {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new Error("Email already exists");
    }
    hashedPassword = generatePassword(hashedPassword);
    email = email.toLowerCase();
    return prisma.admin.create({ data: { name, email, hashedPassword, groupId } });
  },

  bulkCreateAdmins: async (_, { file }) => {
    const { createReadStream } = await file;
    const stream = createReadStream();

    const admins = [];
    const failed = [];
    let rowNumber = 1;

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (row) => {
          rowNumber++;
          const { name, email, password, groupId } = row;
          admins.push({
            name: name?.trim(),
            email: email?.trim(),
            password: password?.trim(),
            groupId: groupId?.trim(),
            row: rowNumber,
          });
        })
        .on("end", async () => {
          const success = [];

          for (const s of admins) {
            const { name, email, password, groupId, row } = s;

            // Validate required fields
            if (!name || !email || !password || !groupId) {
              failed.push({
                row,
                reason: "Missing required fields",
                name,
                email,
              });
              continue;
            }
            const modifiedEmail = email.toLowerCase();


            // Validate email format
            if (!validateEmail(modifiedEmail)) {
              failed.push({ row, reason: "Invalid email format", name, email });
              continue;
            }

            // Validate password strength
            if (!validatePasswordStrength(password)) {
              failed.push({ row, reason: "Weak password", name, email });
              continue;
            }

            // ✅ Validate group exists and category is "admin"
            const group = await prisma.group.findUnique({ where: { id: groupId } });
            if (!group || group.category !== "admin") {
              failed.push({
                row,
                reason: !group ? "Group does not exist" : "Group is not in 'admin' category",
                name,
                email,
              });
              continue;
            }

            // Check for uniqueness
            const [existsName, existsEmail] = await Promise.all([
              prisma.admin.findFirst({ where: { name } }),
              prisma.admin.findFirst({ where: { email: modifiedEmail } }),
            ]);

            if (existsName || existsEmail) {
              failed.push({
                row,
                reason:
                  (existsName && "Name exists") ||
                  (existsEmail && "Email exists"),
                name,
                email,
              });
              continue;
            }

            // Insert admin
            const hashedPassword = generatePassword(password);

            try {
              await prisma.admin.create({
                data: { name, email: modifiedEmail, hashedPassword, groupId },
              });
              success.push(s);
            } catch (err) {
              failed.push({
                row,
                reason: "DB Error: " + err.message,
                name,
                email,
              });
            }
          }

          resolve({
            successCount: success.length,
            failed,
          });
        })
        .on("error", (error) => reject(error));
    });
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
  adminLoginMain: async (_, { email, hashedPassword }) => {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new Error("Admin not found");
    }
    if (!validatePassword(hashedPassword, admin.hashedPassword)) {
      throw new Error("Invalid password");
    }
    // if (macAddress && deviceName) {
    //   const device = await prisma.device.findUnique({ where: { macAddress } });
    //   if (!device) {
    //     await prisma.device.create({
    //       data: {
    //         name: deviceName,
    //         macAddress,
    //         adminId: admin.id,
    //       },
    //     });
    //   }
    // }
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
