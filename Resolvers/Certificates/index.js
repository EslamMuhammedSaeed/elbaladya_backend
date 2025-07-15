const prisma = require("../../config/database");

const CertificateQueries = {
  getAlllCertificates: async () => {
    return prisma.certificates.findMany();
  },
  getCertificateById: async (_, { id }) => {
    return prisma.certificates.findUnique({
      where: {
        id: id,
      },
    });
  },
};

const CertificateMutations = {
  createCertificate: async (_, { studentId }) => {
    return prisma.certificates.create({
      data: {
        studentId,
      },
    });
  },
  deleteCertificate: async (_, { id }) => {
    return prisma.certificates.delete({
      where: {
        id: id,
      },
    });
  },
};

const CertificateRelations = {
  Certificates: {
    student: async (parent) => {
      return prisma.student.findUnique({
        where: {
          id: parent.studentId,
        },
      });
    },
  },
};

module.exports = {
  CertificateQueries,
  CertificateMutations,
  CertificateRelations,
};
