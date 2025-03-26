"use client"

import { Coins, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CoinSystemProps {
  coins: number
  betAmount: number
  setBetAmount: (amount: number) => void
  lastWin: number
  canClaimDaily: boolean
  onClaimDaily: () => void
}

export default function CoinSystem({
  coins,
  betAmount,
  setBetAmount,
  lastWin,
  canClaimDaily,
  onClaimDaily,
}: CoinSystemProps) {
  // Format number with Indonesian Rupiah format
  const formatRupiah = (amount: number) => {
    return amount.toLocaleString("id-ID")
  }

  // Bet amount options
  const betOptions = [500, 1000, 2000, 5000, 10000]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-600" />
          <span className="font-bold">Saldo:</span>
        </div>
        <div className="text-xl font-bold text-amber-800">Rp {formatRupiah(coins)}</div>
      </div>

      {lastWin > 0 && (
        <div className="bg-green-100 border border-green-300 rounded-md p-2 text-center animate-pulse">
          <span className="font-bold text-green-700">Menang! +Rp {formatRupiah(lastWin)}</span>
        </div>
      )}

      <div className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Taruhan:</span>
          <span className="font-bold">Rp {formatRupiah(betAmount)}</span>
        </div>

        <div className="flex justify-between gap-2 flex-wrap">
          {betOptions.map((option) => (
            <Button
              key={option}
              variant={betAmount === option ? "default" : "outline"}
              className={`flex-1 min-w-[70px] ${betAmount === option ? "bg-amber-600 hover:bg-amber-700" : "border-amber-300"}`}
              onClick={() => setBetAmount(option)}
              disabled={option > coins}
            >
              {formatRupiah(option)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        <Button
          onClick={onClaimDaily}
          disabled={!canClaimDaily}
          className={`w-full ${canClaimDaily ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
        >
          <Gift className="mr-2 h-4 w-4" />
          Klaim Bonus Harian
        </Button>
        {!canClaimDaily && (
          <p className="text-xs text-center mt-1 text-gray-500">Anda sudah mengklaim bonus hari ini</p>
        )}
      </div>
    </div>
  )
}

