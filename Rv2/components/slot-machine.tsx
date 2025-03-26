"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

// Define slot symbols with their respective values
const SYMBOLS = [
  { id: "🍒", value: 2 }, // Cherry
  { id: "🍋", value: 2 }, // Lemon
  { id: "🍊", value: 3 }, // Orange
  { id: "🍇", value: 3 }, // Grapes
  { id: "🍉", value: 4 }, // Watermelon
  { id: "🔔", value: 5 }, // Bell
  { id: "💎", value: 10 }, // Diamond
  { id: "7️⃣", value: 15 }, // Seven
]

// Winning combinations and their multipliers
const WINNING_COMBINATIONS = [
  { pattern: [0, 0, 0], multiplier: 10 }, // Three of the same symbol
  { pattern: [1, 1, 1], multiplier: 10 },
  { pattern: [2, 2, 2], multiplier: 15 },
  { pattern: [3, 3, 3], multiplier: 15 },
  { pattern: [4, 4, 4], multiplier: 20 },
  { pattern: [5, 5, 5], multiplier: 25 },
  { pattern: [6, 6, 6], multiplier: 50 },
  { pattern: [7, 7, 7], multiplier: 100 },
  // Two of the same symbol
  { pattern: [0, 0, null], multiplier: 2 },
  { pattern: [1, 1, null], multiplier: 2 },
  { pattern: [2, 2, null], multiplier: 3 },
  { pattern: [3, 3, null], multiplier: 3 },
  { pattern: [4, 4, null], multiplier: 4 },
  { pattern: [5, 5, null], multiplier: 5 },
  { pattern: [6, 6, null], multiplier: 10 },
  { pattern: [7, 7, null], multiplier: 15 },
]

interface SlotMachineProps {
  onSpinComplete: (winAmount: number) => void
  isSpinning: boolean
}

export default function SlotMachine({ onSpinComplete, isSpinning }: SlotMachineProps) {
  const [reels, setReels] = useState([
    { spinning: false, symbols: [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]], selected: 0 },
    { spinning: false, symbols: [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]], selected: 0 },
    { spinning: false, symbols: [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]], selected: 0 },
  ])

  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle spinning effect
  useEffect(() => {
    if (isSpinning) {
      // Start spinning all reels
      setReels(reels.map((reel) => ({ ...reel, spinning: true })))

      // Generate random results for each reel
      const results = reels.map(() => Math.floor(Math.random() * SYMBOLS.length))

      // Stop reels one by one with delays
      const stopReel = (reelIndex: number) => {
        setReels((prev) =>
          prev.map((reel, i) => (i === reelIndex ? { ...reel, spinning: false, selected: results[i] } : reel)),
        )
      }

      // Schedule stopping of reels
      setTimeout(() => stopReel(0), 1000)
      setTimeout(() => stopReel(1), 1500)

      // Stop last reel and calculate win
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }

      spinTimeoutRef.current = setTimeout(() => {
        stopReel(2)

        // Calculate win amount
        const finalResult = results
        let winAmount = 0

        // Check for winning combinations
        for (const combo of WINNING_COMBINATIONS) {
          const { pattern, multiplier } = combo

          // Check if result matches pattern
          const matches = pattern.every((val, index) => val === null || val === finalResult[index])

          if (matches) {
            // Get the symbol value for the matching pattern
            const symbolIndex = finalResult[0]
            const symbolValue = SYMBOLS[symbolIndex].value

            // Calculate win amount based on symbol value and multiplier
            winAmount = symbolValue * multiplier
            break
          }
        }

        // Special case: all symbols are the same
        if (finalResult[0] === finalResult[1] && finalResult[1] === finalResult[2]) {
          const symbolIndex = finalResult[0]
          const symbolValue = SYMBOLS[symbolIndex].value
          winAmount = symbolValue * 10
        }

        onSpinComplete(winAmount)
      }, 2000)
    }

    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [isSpinning, onSpinComplete])

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center gap-2 bg-amber-800 p-4 rounded-lg">
        {reels.map((reel, reelIndex) => (
          <div
            key={reelIndex}
            className="w-20 h-20 bg-white rounded-md flex items-center justify-center overflow-hidden border-4 border-amber-600"
          >
            {reel.spinning ? (
              <motion.div
                animate={{ y: [0, -100, -200, -300, -400, -500, -600, -700, -800] }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="flex flex-col items-center"
              >
                {SYMBOLS.map((symbol, i) => (
                  <div key={i} className="w-20 h-20 flex items-center justify-center text-4xl">
                    {symbol.id}
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="text-4xl">{SYMBOLS[reel.selected].id}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

