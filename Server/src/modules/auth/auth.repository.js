import prisma from "../../database/prisma.js";

export const getUserbyId = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      password: true,
    },
  });
};

// export const insertUser = async (
//   fullName,
//   username,
//   email,
//   password,
//   activationCode
// ) => {
//   return await prisma.user.create({
//     data: {
//       fullName,
//       username,
//       email,
//       password,
//       isActive: false,
//       activationCode,
//     },
//     select: {
//       id: true,
//       fullName: true,
//       username: true,
//       email: true,
//       activationCode: true,
//     },
//   });
// };

export const insertUser = async (fullName, username, email, password) => {
  return await prisma.user.create({
    data: {
      fullName,
      username,
      email,
      password,
    },
  });
};

export const findUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

export const findEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const updateRefreshToken = async (id, refreshToken) => {
  return await prisma.user.update({
    where: { id },
    data: { refreshToken },
  });
};

export const findByRefreshToken = async (refreshToken) => {
  return await prisma.user.findFirst({
    where: { refreshToken },
  });
};

export const findUserRefreshToken = async (refreshToken) => {
  return await prisma.user.findFirst({
    where: { refreshToken },
  });
};

export const deleteRefreshTOken = async (id) => {
  return await prisma.user.update({
    where: { id: id },
    data: { refreshToken: null },
  });
};

export const updatePassword = async (newPassword, id) => {
  return await prisma.user.update({
    where: { id },
    data: { password: newPassword },
  });
};

export const activateUserByCode = async (activationCode) => {
  const user = await prisma.user.findFirst({
    where: {
      activationCode: activationCode,
      isActive: false,
    },
  });

  if (!user) {
    throw new Error("Kode aktivasi tidak valid atau akun sudah aktif.");
  }

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      activationCode: null,
    },
    select: { id: true, email: true, isActive: true },
  });
};
