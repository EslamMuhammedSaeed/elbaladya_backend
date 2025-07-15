const prisma = require("../../config/database");

const DeviceQueries = {
  getDeviceById: async (_, { id }) =>
    prisma.device.findUnique({ where: { id } }),
  getAllDevices: () => prisma.device.findMany(),
};

const DeviceMutations = {
  createDevice: async (_, { name, macAddress, studentId, adminId }) =>
    prisma.device.create({ data: { name, macAddress, studentId, adminId } }),
};

const DeviceRelations = {
  Device: {
    student: async (parent) => {
      return await prisma.student.findFirst({
        where: {
          deviceId: parent.deviceId,
        },
      });
    },
    admin: (parent) =>
      prisma.admin.findUnique({ where: { id: parent.adminId } }),
  },
};

module.exports = {
  DeviceQueries,
  DeviceMutations,
  DeviceRelations,
};
