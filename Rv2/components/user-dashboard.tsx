"use client"

import type React from "react"

import { useState } from "react"
import { Coins, Gift, Zap, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UserDashboardProps {
  balance: number
  betAmount: number
  setBetAmount: (amount: number) => void
  lastResult: {
    win: boolean
    amount: number
    paylines?: number[]
  } | null
  canClaimDaily: boolean
  onClaimDaily: () => void
  onAddBalance: (amount: number) => void
}

export default function UserDashboard({
  balance,
  betAmount,
  setBetAmount,
  lastResult,
  canClaimDaily,
  onClaimDaily,
  onAddBalance,
}: UserDashboardProps) {
  const [customBetAmount, setCustomBetAmount] = useState<string>("")
  const [depositAmount, setDepositAmount] = useState<string>("")
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)

  // Format number with Indonesian Rupiah format
  const formatRupiah = (amount: number) => {
    return amount.toLocaleString("id-ID")
  }

  // Bet amount options
  const betOptions = [1000, 5000, 10000, 25000, 50000]

  // Handle custom bet amount
  const handleCustomBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setCustomBetAmount(value)
  }

  const applyCustomBet = () => {
    const amount = Number.parseInt(customBetAmount)
    if (!isNaN(amount) && amount > 0) {
      setBetAmount(amount)
      setCustomBetAmount("")
    }
  }

  // Handle deposit
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setDepositAmount(value)
  }

  const handleDeposit = () => {
    const amount = Number.parseInt(depositAmount)
    if (!isNaN(amount) && amount > 0) {
      onAddBalance(amount)
      setDepositAmount("")
      setIsDepositDialogOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-400" />
          <span className="font-bold">Saldo:</span>
        </div>
        <div className="flex items-center">
          <div className="text-xl font-bold text-amber-400 mr-2">{formatRupiah(balance)} IDR</div>
          <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full bg-green-600 hover:bg-green-700 border-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-blue-900 border-blue-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-amber-400">Tambah Saldo</DialogTitle>
                <DialogDescription className="text-blue-300">
                  Masukkan jumlah saldo yang ingin ditambahkan.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Jumlah saldo"
                    value={depositAmount}
                    onChange={handleDepositChange}
                    className="bg-blue-800 border-blue-700 text-white"
                  />
                  <span className="text-blue-300">IDR</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 50000, 100000, 250000, 500000, 1000000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="border-blue-700 text-blue-300 hover:bg-blue-800"
                      onClick={() => setDepositAmount(amount.toString())}
                    >
                      {formatRupiah(amount)}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleDeposit}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!depositAmount || Number.parseInt(depositAmount) <= 0}
                >
                  Tambah Saldo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {lastResult && (
        <Card className={`${lastResult.win ? "bg-green-900/50" : "bg-red-900/50"} border-0`}>
          <CardContent className="p-3 text-center">
            {lastResult.win ? (
              <div className="flex flex-col items-center justify-center gap-1 text-green-400">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-bold">Menang! +{formatRupiah(lastResult.amount)} IDR</span>
                </div>
                {lastResult.paylines && <span className="text-xs">{lastResult.paylines.length} payline aktif</span>}
              </div>
            ) : (
              <div className="text-amber-400">
                <span className="font-bold">Hadiah hiburan: +{formatRupiah(lastResult.amount)} IDR</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Taruhan:</span>
          <span className="font-bold text-amber-400">{formatRupiah(betAmount)} IDR</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {betOptions.map((option) => (
            <Button
              key={option}
              variant={betAmount === option ? "default" : "outline"}
              className={`${betAmount === option ? "bg-amber-500 hover:bg-amber-600 text-blue-900" : "border-blue-700 text-blue-300"}`}
              onClick={() => setBetAmount(option)}
              disabled={option > balance}
              size="sm"
            >
              {formatRupiah(option)}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <Input
            type="text"
            placeholder="Taruhan kustom"
            value={customBetAmount}
            onChange={handleCustomBetChange}
            className="bg-blue-800 border-blue-700 text-white"
          />
          <Button
            onClick={applyCustomBet}
            className="bg-amber-500 hover:bg-amber-600 text-blue-900"
            disabled={
              !customBetAmount || Number.parseInt(customBetAmount) <= 0 || Number.parseInt(customBetAmount) > balance
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Set
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Button
          onClick={onClaimDaily}
          disabled={!canClaimDaily}
          className={`w-full ${canClaimDaily ? "bg-green-600 hover:bg-green-700" : "bg-blue-800 text-blue-400"}`}
        >
          <Gift className="mr-2 h-4 w-4" />
          Klaim Bonus Harian
        </Button>
        {!canClaimDaily ? (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Tersedia lagi dalam</span>
              <span>24 jam</span>
            </div>
            <Progress value={100} className="h-2 bg-blue-800" />
          </div>
        ) : (
          <p className="text-xs text-center mt-1 text-green-400">25.000 IDR tersedia untuk diklaim!</p>
        )}
      </div>

      <div className="mt-4 bg-blue-900/50 p-3 rounded-lg border border-blue-800">
        <h3 className="font-bold text-amber-400 mb-1">Informasi Permainan</h3>
        <ul className="text-sm space-y-1 text-blue-300">
          <li>• Dapatkan 3 simbol yang sama untuk menang</li>
          <li>• Zeus (3x) memberikan pembayaran tertinggi</li>
          <li>• 8 payline berbeda untuk peluang menang</li>
          <li>• Klaim bonus harian Anda setiap 24 jam</li>
          <li>• Hadiah hiburan diberikan saat kalah</li>
        </ul>
      </div>
    </div>
  )
}

