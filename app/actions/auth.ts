"use server"

import { cookies } from "next/headers"

export async function loginWithPassword(password: string) {
  const correctPassword = process.env.APP_SECRET_PASSWORD

  if (password === correctPassword) {
    const cookieStore = await cookies()
    cookieStore.set("app_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    })
    return { success: true }
  }

  return { success: false, error: "Mot de passe incorrect" }
}
