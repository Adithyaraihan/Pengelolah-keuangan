import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import {
  findEmail,
  findUsername,
  insertUser,
  updateRefreshToken,
  findByRefreshToken,
  getUserbyId,
  deleteRefreshTOken,
  findUserRefreshToken,
  updatePassword,
  activateUserByCode,
} from "./auth.repository.js";

// ================== TOKEN GENERATION ==================
const generateTokens = (userId) => {
  const accessToken = JWT.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = JWT.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

export const finduserdata = async (id) => {
  if (!id) throw new Error("User tidak ditemukan.");

  return await getUserbyId(id);
};

export const createUser = async (fullName, username, email, password) => {
  if (!fullName || !username || !email || !password) {
    throw new Error("fullname, username, email, dan password wajib diisi.");
  }

  const existUsername = await findUsername(username);
  const existEmail = await findEmail(email);

  if (existEmail) throw new Error("Email sudah terdaftar");
  if (existUsername) throw new Error("Username sudah ada, coba ganti username");

  const hashedPassword = await bcrypt.hash(password, 10);

  // const activationCode = randomUUID();

  return await insertUser(
    fullName,
    username,
    email,
    hashedPassword
    // activationCode
  );
};

export const activateUser = async (activationCode) => {
  if (!activationCode) throw new Error("Kode aktivasi tidak ditemukan.");

  return await activateUserByCode(activationCode);
};

export const loginUser = async (identifier, password) => {
  const user =
    (await findEmail(identifier)) || (await findUsername(identifier));
  if (!user) throw new Error("Email atau username tidak ada");

  // if (!user.isActive) {
  //   throw new Error(
  //     "Akun belum diverifikasi. Silakan cek email Anda untuk aktivasi."
  //   );
  // }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Email atau password salah");

  const { accessToken, refreshToken } = generateTokens(user.id);

  await updateRefreshToken(user.id, refreshToken);

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
  const user = await findByRefreshToken(refreshToken);
  if (!user) throw new Error("Refresh token tidak valid");

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user.id
  );

  await updateRefreshToken(user.id, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken, id) => {
  const user = await findUserRefreshToken(refreshToken);

  if (!user) return null;

  return await deleteRefreshTOken(user.id);
};

export const changePassword = async (password, newPassword, id) => {
  if (!id) throw new Error("User tidak ditemukan.");

  const user = await getUserbyId(id);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("password salah");

  if (newPassword.length < 8)
    throw new Error("Password harus terdiri dari 8 karakter");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  if (isMatch) {
    return await updatePassword(hashedPassword, id);
  }
};
