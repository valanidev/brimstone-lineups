"use client"

import { useState } from "react"
import { loginWithPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await loginWithPassword(password)
    if (result.success) {
      window.location.href = "/" // Recharge pour que le middleware valide la session
    } else {
      setError(result.error || "Erreur")
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0f1115]">
      <Card className="w-[350px] border-gray-800 bg-[#14171c] text-white">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Accès Restreint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Entrez le code secret"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-800 bg-[#0f1115]"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" className="bg-[#ff4655] hover:bg-[#e03e4b]">
              Valider
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
