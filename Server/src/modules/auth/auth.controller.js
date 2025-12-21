import * as Yup from "yup";
import {
  changePassword,
  createUser,
  finduserdata,
  loginUser,
  logoutUser,
  refreshAccessToken,
  activateUser,
} from "./auth.service.js";
import { sendVerificationEmail } from "../services/email.service.js";

const Cookie_Options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required("Nama lengkap wajib diisi"),
  username: Yup.string().required("Username wajib diisi"),
  email: Yup.string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
  password: Yup.string().required("Password wajib diisi"),
  confirmPassword: Yup.string()
    .required("Konfirmasi password wajib diisi")
    .oneOf(
      [Yup.ref("password")],
      "Konfirmasi password tidak sama dengan password"
    ),
});

export const meController = async (req, res) => {
  try {
    const user = await finduserdata(req.user.userId);
    const { password: _, ...userDataSafe } = user;
    res.status(200).json({ data: userDataSafe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const registerController = async (req, res) => {
  const { fullName, username, email, password, confirmPassword } = req.body;

  try {
    await registerValidateSchema.validate(
      { fullName, username, email, password, confirmPassword },
      { abortEarly: false }
    );

    const newUser = await createUser(fullName, username, email, password);

    // await sendVerificationEmail(
    //   newUser.email,
    //   newUser.activationCode,
    //   newUser.fullName
    // );

    res.status(202).json({
      message: "Registrasi berhasil. Cek email Anda untuk mengaktifkan akun.",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return res.status(500).json({
        message: "Validasi Gagal",
        errors: error.message,
      });
    }

    console.error("Error dalam registrasi:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyController = async (req, res) => {
  const { code } = req.query;

  try {
    if (!code) {
      return res
        .status(400)
        .json({ message: "Kode aktivasi tidak ditemukan." });
    }

    const verifiedUser = await activateUser(code);

    res.status(200).json({
      message: "Akun berhasil diaktifkan. Anda sekarang dapat login.",
      data: {
        id: verifiedUser.id,
        isActive: verifiedUser.isActive,
      },
    });
  } catch (error) {
    if (error.message.includes("Kode aktivasi tidak valid")) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Error saat verifikasi akun:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const loginController = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const { user, accessToken, refreshToken } = await loginUser(
      identifier,
      password
    );
    const { password: _, refreshToken: __, ...userDataSafe } = user;

    res.cookie("refreshToken", refreshToken, Cookie_Options);

    res.status(200).json({
      message: "Login Berhasil",
      data: {
        id: userDataSafe.id,
        fullName: userDataSafe.fullName,
        username: userDataSafe.username,
        email: userDataSafe.email,
      },
      accessToken,
    });
  } catch (error) {
    res.status(400).json({
      message: "Email atau password salah",
    });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401);

    const { accessToken, newRefreshToken } = await refreshAccessToken(
      refreshToken
    );

    res.cookie("refreshToken", newRefreshToken, Cookie_Options);

    res.status(200).json({
      message: "Access token berhasil diperbarui",
      accessToken,
    });
  } catch (error) {
    if (
      error.name === "InvalidTokenError" ||
      error.name === "ReuseDetectedError"
    ) {
      res.clearCookie("refreshToken");
      return res
        .status(403)
        .json({ message: "Session expired, please login again" });
    }

    console.error("Refresh Token Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(204);

    await logoutUser(refreshToken, req.user.userId);

    const { maxAge, ...clearOptions } = Cookie_Options;
    res.clearCookie("refreshToken", clearOptions);
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const data = await changePassword(password, newPassword, req.user.userId);
    res.status(200).json({
      message: "Password berhasil diubah",
      data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
