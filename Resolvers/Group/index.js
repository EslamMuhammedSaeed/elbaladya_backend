const prisma = require("../../config/database");

const GroupQueries = {
  getAllGroupsPaginated: async (_, { page = 1, perPage = 10, sortBy, filters = {} }) => {
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

    const groups = await prisma.group.findMany({
      where: prismaFilters,
      include: {
        _count: {
          select: { students: true, admins: true },
        },
      },
    });

    const validSorts = ["name", "usersCount"];

    if (sortBy && validSorts.includes(sortBy)) {

      groups.sort((a, b) => {
        if (sortBy === "name") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "usersCount") {
          return b._count.admins + b._count.students - (a._count.admins + a._count.students); // descending
        }
        //   return b._count.students - a._count.students; // descending
      });
    }

    const total = groups.length;
    const start = (page - 1) * perPage;
    const paginated = groups.slice(start, start + perPage).map(group => ({
      ...group,
      usersCount: group._count.students + group._count.admins,

    }));

    return {
      data: paginated,
      total,
      per_page: perPage,
      current_page: page,
      last_page: Math.ceil(total / perPage),
    };
  },
  getAllGroups: async (_, { sortBy, filters = {} }) => {
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

    const groups = await prisma.group.findMany({
      where: prismaFilters,
      include: {
        _count: {
          select: { students: true, admins: true },
        },
      },
    });

    const validSorts = ["name", "usersCount"];

    if (sortBy && validSorts.includes(sortBy)) {
      groups.sort((a, b) => {
        if (sortBy === "name") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "usersCount") {
          return b._count.admins + b._count.students - (a._count.admins + a._count.students); // descending
        }
        //   return b._count.students - a._count.students; // descending
      });
    }


    const updated = groups.map(group => ({
      ...group,
      usersCount: group._count.students + group._count.admins,
    }));

    return {
      data: updated,
    };
  },

  getAllStudentGroups: async (_, { sortBy, filters = {} }) => {
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

    prismaFilters.category = "student";
    const groups = await prisma.group.findMany({
      where: prismaFilters,
      include: {
        _count: {
          select: { students: true, admins: true },
        },
      },
    });

    const validSorts = ["name", "usersCount"];

    if (sortBy && validSorts.includes(sortBy)) {
      groups.sort((a, b) => {
        if (sortBy === "name") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "usersCount") {
          return b._count.admins + b._count.students - (a._count.admins + a._count.students); // descending
        }
        //   return b._count.students - a._count.students; // descending
      });
    }


    const updated = groups.map(group => ({
      ...group,
      usersCount: group._count.students + group._count.admins,
    }));

    return {
      data: updated,
    };
  },

  getAllAdminGroups: async (_, { sortBy, filters = {} }) => {
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

    prismaFilters.category = "admin";
    const groups = await prisma.group.findMany({
      where: prismaFilters,
      include: {
        _count: {
          select: { students: true, admins: true },
        },
      },
    });

    const validSorts = ["name", "usersCount"];

    if (sortBy && validSorts.includes(sortBy)) {
      groups.sort((a, b) => {
        if (sortBy === "name") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "usersCount") {
          return b._count.admins + b._count.students - (a._count.admins + a._count.students); // descending
        }
        //   return b._count.students - a._count.students; // descending
      });
    }


    const updated = groups.map(group => ({
      ...group,
      usersCount: group._count.students + group._count.admins,
    }));

    return {
      data: updated,
    };
  },


};

const GroupMutations = {
  createGroup: async (_, { name, category = "student" }) => {
    const existingGroup = await prisma.group.findUnique({
      where: { name },
    });

    if (existingGroup) {
      throw new Error("Group already exists");
    }

    return prisma.group.create({ data: { name, category } });
  },

};

const GroupRelations = {
  Group: {
    students: async (parent) => {
      return prisma.student.findMany({ where: { groupId: parent.id } });
    },
    admins: async (parent) => {
      return prisma.admin.findMany({ where: { groupId: parent.id } });
    },
  },
};

module.exports = {
  GroupQueries,
  GroupMutations,
  GroupRelations,
};
