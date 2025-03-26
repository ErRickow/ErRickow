"use client"

import { useState, useEffect } from "react"
import ZeusSlotMachine from "@/components/zeus-slot-machine"
import UserDashboard from "@/components/user-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const { toast } = useToast()
  const [balance, setBalance] = useState(50000) // Starting with 50,000 IDR
  const [betAmount, setBetAmount] = useState(5000)
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastResult, setLastResult] = useState<{
    win: boolean
    amount: number
    paylines?: number[]
  } | null>(null)
  const [stats, setStats] = useState({
    spins: 0,
    wins: 0,
    losses: 0,
    biggestWin: 0,
    totalWon: 0,
    totalLost: 0,
  })
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null)
  const [clickSound, setClickSound] = useState<HTMLAudioElement | null>(null)

  // Update the audio initialization in the app page to ensure it works when audio files are added later
  // Initialize click sound
  useEffect(() => {
    const audio = new Audio()
    audio.src = "/sounds/click.mp3"
    audio.volume = 0.5

    // Add error handling
    audio.addEventListener("error", () => {
      console.log("Click sound not available yet. Sound will work when files are added.")
    })

    setClickSound(audio)

    return () => {
      if (clickSound) {
        clickSound.pause()
        clickSound.src = ""
      }
    }
  }, [])

  // Create a safe play function for the click sound
  const playClickSound = () => {
    if (!clickSound) return

    try {
      clickSound.currentTime = 0
      const playPromise = clickSound.play()

      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          // Auto-play was prevented or audio file missing
          console.log("Click sound playback was prevented or file is missing")
        })
      }
    } catch (e) {
      console.log("Error playing click sound:", e)
    }
  }

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("zeusSlots")

    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setBalance(parsedData.balance)
      setStats(parsedData.stats)
      setLastClaimDate(parsedData.lastClaimDate)
    }
  }, [])

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem(
      "zeusSlots",
      JSON.stringify({
        balance,
        stats,
        lastClaimDate,
      }),
    )
  }, [balance, stats, lastClaimDate])

  // Update the handleSpin function to use the safe play function
  const handleSpin = () => {
    if (balance < betAmount || isSpinning) return

    // Play click sound safely
    playClickSound()

    setIsSpinning(true)
    setBalance((prev) => prev - betAmount)

    // Update stats
    setStats((prev) => ({
      ...prev,
      spins: prev.spins + 1,
      totalLost: prev.totalLost + betAmount,
    }))

    // Reset last result
    setLastResult(null)
  }

  const handleSpinComplete = (result: { win: boolean; multiplier: number; paylines: number[] }) => {
    setIsSpinning(false)

    if (result.win) {
      // Player wins
      const winAmount = Math.floor(betAmount * result.multiplier)

      // Show win notification
      toast({
        title: "Kemenangan!",
        description: `Anda memenangkan ${winAmount.toLocaleString()} IDR pada ${result.paylines.length} payline!`,
        variant: "default",
        className: "bg-amber-100 border-amber-400",
      })

      // Update stats
      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        biggestWin: Math.max(prev.biggestWin, winAmount),
        totalWon: prev.totalWon + winAmount,
      }))

      // Update balance
      setBalance((prev) => prev + winAmount)

      // Set last result
      setLastResult({
        win: true,
        amount: winAmount,
        paylines: result.paylines,
      })
    } else {
      // Player loses - give consolation coins
      const consolationAmount = Math.floor(betAmount * 0.1) // 10% consolation

      // Update stats
      setStats((prev) => ({
        ...prev,
        losses: prev.losses + 1,
      }))

      // Update balance with consolation
      setBalance((prev) => prev + consolationAmount)

      // Set last result
      setLastResult({
        win: false,
        amount: consolationAmount,
      })

      // Show loss notification with consolation
      toast({
        title: "Coba lagi!",
        description: `Anda mendapatkan ${consolationAmount.toLocaleString()} IDR sebagai hadiah hiburan.`,
        variant: "destructive",
      })
    }
  }

  // Update the claimDailyBonus function to use the safe play function
  const claimDailyBonus = () => {
    const today = new Date().toDateString()

    if (lastClaimDate !== today) {
      const bonusAmount = 25000 // 25,000 IDR daily bonus
      setBalance((prev) => prev + bonusAmount)
      setLastClaimDate(today)

      // Play click sound safely
      playClickSound()

      toast({
        title: "Bonus Harian!",
        description: `Anda telah mengklaim ${bonusAmount.toLocaleString()} IDR bonus harian!`,
        variant: "default",
        className: "bg-green-100 border-green-400",
      })
    } else {
      toast({
        title: "Sudah Diklaim",
        description: "Anda sudah mengklaim bonus harian hari ini. Silakan kembali besok!",
        variant: "default",
      })
    }
  }

  // Update the handleAddBalance function to use the safe play function
  const handleAddBalance = (amount: number) => {
    setBalance((prev) => prev + amount)

    // Play click sound safely
    playClickSound()

    toast({
      title: "Saldo Ditambahkan!",
      description: `${amount.toLocaleString()} IDR telah ditambahkan ke saldo Anda.`,
      variant: "default",
      className: "bg-green-100 border-green-400",
    })
  }

  const canClaimDaily = lastClaimDate !== new Date().toDateString()

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-amber-400 text-center">Zeus Thunder Slots</h1>
          <p className="text-blue-300 mb-8 text-center">Rasakan kekuatan dewa dalam permainan slot!</p>

          <Tabs defaultValue="play" className="w-full max-w-4xl">
            <TabsList className="grid w-full grid-cols-2 bg-blue-800">
              <TabsTrigger value="play" className="text-lg">
                Main Slot
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="text-lg">
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="play" className="mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-blue-800 border-blue-700">
                  <CardContent className="p-6">
                    <ZeusSlotMachine onSpinComplete={handleSpinComplete} isSpinning={isSpinning} />

                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={handleSpin}
                        disabled={balance < betAmount || isSpinning}
                        className="bg-amber-500 hover:bg-amber-600 text-blue-900 px-8 py-6 rounded-full text-xl font-bold shadow-lg transition-all hover:shadow-amber-500/50 active:scale-95"
                        size="lg"
                      >
                        {isSpinning ? "Berputar..." : "PUTAR"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-800 border-blue-700">
                  <CardContent className="p-6">
                    <UserDashboard
                      balance={balance}
                      betAmount={betAmount}
                      setBetAmount={setBetAmount}
                      lastResult={lastResult}
                      canClaimDaily={canClaimDaily}
                      onClaimDaily={claimDailyBonus}
                      onAddBalance={handleAddBalance}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              <Card className="bg-blue-800 border-blue-700">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-amber-400">Statistik Pemain</h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-700 p-4 rounded-lg">
                      <h3 className="text-blue-300 text-sm">Total Putaran</h3>
                      <p className="text-2xl font-bold">{stats.spins}</p>
                    </div>

                    <div className="bg-blue-700 p-4 rounded-lg">
                      <h3 className="text-blue-300 text-sm">Kemenangan</h3>
                      <p className="text-2xl font-bold">{stats.wins}</p>
                    </div>

                    <div className="bg-blue-700 p-4 rounded-lg">
                      <h3 className="text-blue-300 text-sm">Kekalahan</h3>
                      <p className="text-2xl font-bold">{stats.losses}</p>
                    </div>

                    <div className="bg-blue-700 p-4 rounded-lg">
                      <h3 className="text-blue-300 text-sm">Kemenangan Terbesar</h3>
                      <p className="text-2xl font-bold">{stats.biggestWin.toLocaleString()} IDR</p>
                    </div>

                    <div className="bg-blue-700 p-4 rounded-lg">
                      <h3 className="text-blue-300 text-sm">Total Dimenangkan</h3>
                      <p className="text-2xl font-bold">{stats.totalWon.toLocaleString()} IDR</p>
                    </div>

                    <div className="bg-blue-700 p-4 rounded-lg">
                      <h3 className="text-blue-300 text-sm">Total Dipertaruhkan</h3>
                      <p className="text-2xl font-bold">{stats.totalLost.toLocaleString()} IDR</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-2 text-amber-400">Tentang Permainan</h3>
                    <p className="text-blue-300">
                      Zeus Thunder Slots adalah permainan slot bertema mitologi Yunani. Permainan ini hanya untuk
                      hiburan dan menggunakan mata uang virtual (IDR). Klaim bonus harian Anda untuk mendapatkan koin
                      gratis!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-sm text-blue-400 text-center">
            Permainan ini hanya untuk hiburan. Tidak menggunakan uang sungguhan.
          </p>
        </div>
      </div>
      <Toaster />
    </main>
  )
}

