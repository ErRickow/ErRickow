"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Volume2, VolumeX, X } from "lucide-react"
import React from "react"

// Update the SYMBOLS array to make winning even less likely
const SYMBOLS = [
  {
    id: "zeus",
    value: 15,
    probability: 0.015, // Extremely rare (1.5% chance)
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="32" cy="32" r="30" fill="#f0c14b" />
        <path d="M32 10 C20 10, 15 25, 20 40 C25 55, 39 55, 44 40 C49 25, 44 10, 32 10" fill="#e6e6e6" />
        <path d="M26 20 L38 20 L35 30 L40 30 L28 50 L30 35 L25 35 Z" fill="#f44336" />
      </svg>
    ),
  },
  {
    id: "lightning",
    value: 8,
    probability: 0.025, // Very rare (2.5% chance)
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M32 5 L38 30 L50 30 L25 59 L30 35 L18 35 Z" fill="#ffeb3b" stroke="#f57c00" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "temple",
    value: 5,
    probability: 0.04, // Rare (4% chance)
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <rect x="10" y="40" width="44" height="15" fill="#e0e0e0" />
        <rect x="5" y="55" width="54" height="5" fill="#bdbdbd" />
        <rect x="15" y="35" width="34" height="5" fill="#e0e0e0" />
        <rect x="20" y="20" width="24" height="15" fill="#e0e0e0" />
        <rect x="25" y="5" width="14" height="15" fill="#e0e0e0" />
        <rect x="15" y="20" width="5" height="20" fill="#bdbdbd" />
        <rect x="44" y="20" width="5" height="20" fill="#bdbdbd" />
      </svg>
    ),
  },
  {
    id: "helmet",
    value: 4,
    probability: 0.07, // Uncommon (7% chance)
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path d="M32 10 C20 10, 10 20, 10 35 L54 35 C54 20, 44 10, 32 10" fill="#795548" />
        <rect x="10" y="35" width="44" height="5" fill="#5d4037" />
        <path d="M25 40 L25 50 L39 50 L39 40" fill="#5d4037" />
        <rect x="20" y="35" width="24" height="5" fill="#f44336" />
        <path d="M32 10 L32 25 L40 35 L24 35 L32 25" fill="#f44336" />
      </svg>
    ),
  },
  {
    id: "trident",
    value: 3,
    probability: 0.15, // Common (15% chance)
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <rect x="30" y="20" width="4" height="40" fill="#8d6e63" />
        <path d="M20 15 L30 20 L30 25 L20 20 Z" fill="#5d4037" />
        <path d="M44 15 L34 20 L34 25 L44 20 Z" fill="#5d4037" />
        <path d="M32 5 L32 20 L30 25 L34 25 L32 20 Z" fill="#5d4037" />
      </svg>
    ),
  },
  {
    id: "grapes",
    value: 2,
    probability: 0.2, // Common (20% chance)
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle cx="25" cy="30" r="6" fill="#9c27b0" />
        <circle cx="35" cy="25" r="6" fill="#9c27b0" />
        <circle cx="30" cy="40" r="6" fill="#9c27b0" />
        <circle cx="40" cy="35" r="6" fill="#9c27b0" />
        <circle cx="20" cy="40" r="6" fill="#9c27b0" />
        <path d="M32 15 C32 15, 25 20, 35 25" stroke="#4caf50" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: "amphora",
    value: 2,
    probability: 0.22, // Very common (22% chance)
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path
          d="M32 10 C25 10, 20 15, 20 20 C20 30, 15 40, 20 50 C25 55, 39 55, 44 50 C49 40, 44 30, 44 20 C44 15, 39 10, 32 10"
          fill="#ff9800"
        />
        <path d="M28 10 L28 20 L36 20 L36 10" fill="#ff9800" stroke="#e65100" strokeWidth="1" />
        <path d="M25 30 C25 30, 32 35, 39 30" stroke="#e65100" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
  {
    id: "olive",
    value: 1,
    probability: 0.28, // Extremely common (28% chance)
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <ellipse cx="32" cy="35" rx="15" ry="20" fill="#7cb342" />
        <ellipse cx="32" cy="35" rx="10" ry="15" fill="#558b2f" />
        <path d="M32 15 C32 15, 25 5, 32 5" stroke="#795548" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
]

// Define paylines (for a 3x3 grid)
const PAYLINES = [
  [0, 1, 2], // horizontal top
  [3, 4, 5], // horizontal middle
  [6, 7, 8], // horizontal bottom
  [0, 4, 8], // diagonal top-left to bottom-right
  [2, 4, 6], // diagonal top-right to bottom-left
  [0, 3, 6], // vertical left
  [1, 4, 7], // vertical middle
  [2, 5, 8], // vertical right
]

// Winning combinations and their multipliers (adjusted to make winning harder)
const WINNING_COMBINATIONS = [
  { symbol: 0, count: 3, multiplier: 50 }, // Three Zeus
  { symbol: 1, count: 3, multiplier: 20 }, // Three Lightning
  { symbol: 2, count: 3, multiplier: 15 }, // Three Temple
  { symbol: 3, count: 3, multiplier: 10 }, // Three Helmet
  { symbol: 4, count: 3, multiplier: 8 }, // Three Trident
  { symbol: 5, count: 3, multiplier: 5 }, // Three Grapes
  { symbol: 6, count: 3, multiplier: 5 }, // Three Amphora
  { symbol: 7, count: 3, multiplier: 3 }, // Three Olive
  { symbol: 0, count: 2, multiplier: 5 }, // Two Zeus
  { symbol: 1, count: 2, multiplier: 3 }, // Two Lightning
]

interface ZeusSlotMachineProps {
  onSpinComplete: (result: { win: boolean; multiplier: number; paylines: number[] }) => void
  isSpinning: boolean
}

export default function ZeusSlotMachine({ onSpinComplete, isSpinning }: ZeusSlotMachineProps) {
  // 3x3 grid of symbols (9 positions total)
  const [reels, setReels] = useState([
    [
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
    ],
    [
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
    ],
    [
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
      { spinning: false, selected: Math.floor(Math.random() * SYMBOLS.length) },
    ],
  ])

  const [winningPaylines, setWinningPaylines] = useState<number[]>([])
  const [lightningEffect, setLightningEffect] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const announcementTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Audio references
  const spinSoundRef = useRef<HTMLAudioElement | null>(null)
  const winSoundRef = useRef<HTMLAudioElement | null>(null)
  const loseSoundRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements with error handling
    const createAudio = (src: string, volume = 0.5, loop = false) => {
      try {
        const audio = new Audio()
        audio.src = src
        audio.volume = volume
        audio.loop = loop

        // Add error event listener to handle missing files
        audio.addEventListener("error", (e) => {
          console.log(`Audio file ${src} not available yet. Sound will work when files are added.`)
        })

        return audio
      } catch (e) {
        console.log(`Error creating audio for ${src}. Sound will work when files are added.`)
        return null
      }
    }

    spinSoundRef.current = createAudio("/sounds/spin.mp3", 0.5, true)
    winSoundRef.current = createAudio("/sounds/win.mp3", 0.7)
    loseSoundRef.current = createAudio("/sounds/lose.mp3", 0.7)
    clickSoundRef.current = createAudio("/sounds/click.mp3", 0.5)

    return () => {
      // Clean up audio elements
      const cleanupAudio = (audio: HTMLAudioElement | null) => {
        if (audio) {
          audio.pause()
          audio.src = ""
        }
      }

      cleanupAudio(spinSoundRef.current)
      cleanupAudio(winSoundRef.current)
      cleanupAudio(loseSoundRef.current)
      cleanupAudio(clickSoundRef.current)

      spinSoundRef.current = null
      winSoundRef.current = null
      loseSoundRef.current = null
      clickSoundRef.current = null
    }
  }, [])

  // Set up announcement timer
  useEffect(() => {
    // Show announcement initially after a short delay
    const initialTimer = setTimeout(() => {
      setShowAnnouncement(true)
      // No auto-hide timeout - stays visible until user dismisses
    }, 5000)

    // Function to show announcement periodically
    const showAnnouncementPeriodically = () => {
      // Only show if it's not already showing
      if (!showAnnouncement) {
        setShowAnnouncement(true)
        // No auto-hide timeout - stays visible until user dismisses
      }
    }

    // Set up interval to show announcement every 20 minutes
    const intervalTime = 1200000 // 20 minutes in milliseconds
    const intervalTimer = setInterval(showAnnouncementPeriodically, intervalTime)

    announcementTimerRef.current = intervalTimer as unknown as NodeJS.Timeout

    return () => {
      clearTimeout(initialTimer)
      if (announcementTimerRef.current) {
        clearInterval(announcementTimerRef.current)
      }
    }
  }, [showAnnouncement])

  // Helper function to get a weighted random symbol based on probability
  const getWeightedRandomSymbol = () => {
    const totalProbability = SYMBOLS.reduce((sum, symbol) => sum + symbol.probability, 0)
    let random = Math.random() * totalProbability

    for (let i = 0; i < SYMBOLS.length; i++) {
      random -= SYMBOLS[i].probability
      if (random <= 0) {
        return i
      }
    }

    return SYMBOLS.length - 1 // Fallback to last symbol
  }

  // Handle spinning effect
  const playSoundSafely = (audio: HTMLAudioElement | null) => {
    if (!audio || !soundEnabled) return

    try {
      audio.currentTime = 0
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          // Auto-play was prevented or audio file missing
          console.log("Audio playback was prevented or file is missing:", e)
        })
      }
    } catch (e) {
      console.log("Error playing sound:", e)
    }
  }

  // Update the useEffect for spinning to use the safe play function
  useEffect(() => {
    if (isSpinning) {
      // Play spin sound safely
      if (spinSoundRef.current && soundEnabled) {
        playSoundSafely(spinSoundRef.current)
      }

      // Reset winning paylines
      setWinningPaylines([])

      // Start spinning all reels
      setReels(reels.map((reel) => reel.map((position) => ({ ...position, spinning: true }))))

      // Generate weighted random results for each position
      const results = [
        [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()],
        [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()],
        [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()],
        [getWeightedRandomSymbol(), getWeightedRandomSymbol(), getWeightedRandomSymbol()],
      ]

      // Add extra randomization to make winning even harder
      // Occasionally replace a high-value symbol with a low-value one
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // If it's a high-value symbol (Zeus, Lightning, Temple)
          if (results[i][j] <= 2 && Math.random() < 0.7) {
            // 70% chance to replace
            // Replace with a common symbol
            results[i][j] = Math.floor(Math.random() * 3) + 5 // Indices 5-7 (common symbols)
          }
        }
      }

      // Stop reels one by one with delays
      const stopReel = (reelIndex: number) => {
        setReels((prev) =>
          prev.map((reel, i) =>
            i === reelIndex
              ? reel.map((position, j) => ({
                  ...position,
                  spinning: false,
                  selected: results[i][j],
                }))
              : reel,
          ),
        )

        // Play click sound when reel stops
        playSoundSafely(clickSoundRef.current)
      }

      // Schedule stopping of reels with staggered timing for more suspense
      setTimeout(() => stopReel(0), 1800)
      setTimeout(() => stopReel(1), 2600)

      // Stop last reel and calculate win
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }

      spinTimeoutRef.current = setTimeout(() => {
        stopReel(2)

        // Stop spin sound
        if (spinSoundRef.current) {
          spinSoundRef.current.pause()
          spinSoundRef.current.currentTime = 0
        }

        // Flatten the 3x3 grid for easier payline checking
        const flatResults = [
          results[0][0],
          results[0][1],
          results[0][2],
          results[1][0],
          results[1][1],
          results[1][2],
          results[2][0],
          results[2][1],
          results[2][2],
        ]

        // Check each payline for wins
        let win = false
        let highestMultiplier = 0
        const winningLines: number[] = []

        // Make the game even harder by reducing the chances of winning on paylines
        PAYLINES.forEach((payline, paylineIndex) => {
          const symbols = payline.map((position) => flatResults[position])

          // Check if all symbols in the payline are the same (reduced chance)
          if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
            // Only count as a win if it's a high-value symbol
            if (symbols[0] <= 3) {
              // Only Zeus, Lightning, Temple, Helmet count for 3 in a row
              const combo = WINNING_COMBINATIONS.find((c) => c.symbol === symbols[0] && c.count === 3)

              if (combo) {
                // Add a random factor to make winning even less predictable
                // Reduced chance to 40% (from 80%)
                if (Math.random() < 0.4) {
                  win = true
                  winningLines.push(paylineIndex)
                  if (combo.multiplier > highestMultiplier) {
                    highestMultiplier = combo.multiplier
                  }
                }
              }
            }
          }
          // Check for 2 matching symbols (only for Zeus and Lightning)
          else if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) {
            let symbolToCheck: number

            if (symbols[0] === symbols[1]) symbolToCheck = symbols[0]
            else if (symbols[1] === symbols[2]) symbolToCheck = symbols[1]
            else symbolToCheck = symbols[0]

            // Only count if it's Zeus or Lightning
            if (symbolToCheck <= 1) {
              const combo = WINNING_COMBINATIONS.find((c) => c.symbol === symbolToCheck && c.count === 2)

              if (combo) {
                // Reduced chance to 30% (from 60%)
                if (Math.random() < 0.3) {
                  win = true
                  winningLines.push(paylineIndex)
                  if (combo.multiplier > highestMultiplier) {
                    highestMultiplier = combo.multiplier
                  }
                }
              }
            }
          }
        })

        // Additional global win chance reduction
        // Even if we found a win, there's a chance we'll ignore it
        if (win && Math.random() < 0.3) {
          // 30% chance to ignore a win
          win = false
          winningLines.length = 0
          highestMultiplier = 0
        }

        // Show lightning effect and highlight winning paylines
        if (win) {
          setLightningEffect(true)
          setWinningPaylines(winningLines)
          setTimeout(() => setLightningEffect(false), 2000)

          // Play win sound
          playSoundSafely(winSoundRef.current)
        } else {
          // Play lose sound
          playSoundSafely(loseSoundRef.current)
        }

        onSpinComplete({
          win,
          multiplier: highestMultiplier,
          paylines: winningLines,
        })
      }, 3400)
    }

    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }

      // Stop spin sound if component unmounts during spin
      if (spinSoundRef.current) {
        spinSoundRef.current.pause()
        spinSoundRef.current.currentTime = 0
      }
    }
  }, [isSpinning, onSpinComplete, soundEnabled])

  // Helper function to check if a position is part of a winning payline
  const isWinningPosition = (reelIndex: number, positionIndex: number) => {
    const flatPosition = reelIndex * 3 + positionIndex
    return winningPaylines.some((paylineIndex) => PAYLINES[paylineIndex].includes(flatPosition))
  }

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)

    // Play/pause any active sounds
    if (spinSoundRef.current && isSpinning) {
      if (soundEnabled) {
        spinSoundRef.current.pause()
      } else {
        playSoundSafely(spinSoundRef.current)
      }
    }
  }

  return (
    <div className="flex flex-col items-center relative">
      {/* Creator Announcement */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="fixed top-4 right-4 z-50 bg-blue-800/90 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs"
          >
            <button
              onClick={() => setShowAnnouncement(false)}
              className="absolute top-1 right-1 text-white/80 hover:text-white"
              aria-label="Close announcement"
            >
              <X size={14} />
            </button>
            <p className="text-xs text-center">
              Game ini dibuat oleh{" "}
              <a
                href="https://t.me/chakszzz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                t.me/chakszzz
              </a>
              <br />
              Dukung via{" "}
              <a
                href="https://trakteer.id/er_rickow/tip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                trakteer.id/er_rickow/tip
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zeus header image */}
      <div className="mb-4 w-full max-w-md">
        <div className="relative h-24 w-full flex items-center justify-center">
          <h2 className="text-3xl font-bold text-amber-400 flex items-center">
            ZEUS THUNDER
            <Zap className="h-8 w-8 mx-1 text-yellow-400" />
            SLOTS
          </h2>

          {/* Sound toggle button */}
          <button
            onClick={toggleSound}
            className="absolute right-0 top-0 p-2 text-blue-300 hover:text-amber-400 transition-colors"
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>
      </div>

      {/* Lightning effect overlay */}
      <AnimatePresence>
        {lightningEffect && (
          <motion.div
            className="absolute inset-0 bg-yellow-400 opacity-30 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0, 0.3, 0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        )}
      </AnimatePresence>

      {/* Slot machine frame */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-700 to-amber-900 rounded-xl -m-2 z-0"></div>

        <div className="relative z-10 bg-gradient-to-b from-blue-950 to-blue-900 p-6 rounded-lg border-4 border-amber-600">
          {/* Payline indicators (left) */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 flex flex-col gap-2">
            {[0, 3, 6].map((paylineIndex) => (
              <div
                key={`left-${paylineIndex}`}
                className={`w-3 h-3 rounded-full ${winningPaylines.includes(paylineIndex) ? "bg-amber-400 animate-pulse" : "bg-blue-700"}`}
              />
            ))}
          </div>

          {/* Payline indicators (right) */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 flex flex-col gap-2">
            {[0, 3, 6].map((paylineIndex) => (
              <div
                key={`right-${paylineIndex}`}
                className={`w-3 h-3 rounded-full ${winningPaylines.includes(paylineIndex) ? "bg-amber-400 animate-pulse" : "bg-blue-700"}`}
              />
            ))}
          </div>

          {/* Payline indicators (top) */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 flex gap-2">
            {[0, 1, 2].map((paylineIndex) => (
              <div
                key={`top-${paylineIndex}`}
                className={`w-3 h-3 rounded-full ${winningPaylines.includes(paylineIndex) ? "bg-amber-400 animate-pulse" : "bg-blue-700"}`}
              />
            ))}
          </div>

          {/* Payline indicators (bottom) */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 flex gap-2">
            {[0, 1, 2].map((paylineIndex) => (
              <div
                key={`bottom-${paylineIndex}`}
                className={`w-3 h-3 rounded-full ${winningPaylines.includes(paylineIndex) ? "bg-amber-400 animate-pulse" : "bg-blue-700"}`}
              />
            ))}
          </div>

          {/* 3x3 Grid of symbols */}
          <div className="grid grid-cols-3 gap-2">
            {reels.map((reel, reelIndex) => (
              <div key={`reel-${reelIndex}`} className="flex flex-col gap-2">
                {reel.map((position, positionIndex) => (
                  <div
                    key={`position-${reelIndex}-${positionIndex}`}
                    className={`w-20 h-20 bg-blue-800 rounded-md flex items-center justify-center overflow-hidden border-4 
                      ${
                        isWinningPosition(reelIndex, positionIndex) && !position.spinning
                          ? "border-amber-400 shadow-[0_0_10px_#f59e0b]"
                          : "border-amber-500"
                      } 
                      shadow-inner`}
                  >
                    {position.spinning ? (
                      <div className="w-full h-full overflow-hidden relative">
                        <motion.div
                          animate={{ y: [0, -1600] }}
                          transition={{
                            duration: 1.2, // Slightly faster for smoother appearance
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                            repeatType: "loop",
                          }}
                          className="flex flex-col items-center absolute left-0 right-0"
                          style={{ willChange: "transform" }} // Performance optimization
                        >
                          {/* Repeat symbols multiple times to create a continuous loop */}
                          {[...Array(3)].map((_, loopIndex) => (
                            <React.Fragment key={`loop-${loopIndex}`}>
                              {SYMBOLS.map((symbol, i) => (
                                <div
                                  key={`symbol-${loopIndex}-${i}`}
                                  className="w-20 h-20 flex items-center justify-center p-2"
                                >
                                  {symbol.svg}
                                </div>
                              ))}
                            </React.Fragment>
                          ))}
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div
                        className="w-14 h-14"
                        initial={isSpinning ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {SYMBOLS[position.selected].svg}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Diagonal payline indicators */}
          <div className="absolute inset-0 pointer-events-none">
            {winningPaylines.includes(3) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-amber-400 rotate-45 transform origin-center animate-pulse"></div>
              </div>
            )}
            {winningPaylines.includes(4) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-amber-400 -rotate-45 transform origin-center animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Horizontal paylines */}
          <div className="absolute inset-0 pointer-events-none">
            {winningPaylines.includes(0) && (
              <div className="absolute top-[20%] left-0 right-0 h-1 bg-amber-400 animate-pulse"></div>
            )}
            {winningPaylines.includes(1) && (
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-400 transform -translate-y-1/2 animate-pulse"></div>
            )}
            {winningPaylines.includes(2) && (
              <div className="absolute bottom-[20%] left-0 right-0 h-1 bg-amber-400 animate-pulse"></div>
            )}
          </div>

          {/* Vertical paylines */}
          <div className="absolute inset-0 pointer-events-none">
            {winningPaylines.includes(5) && (
              <div className="absolute top-0 bottom-0 left-[16.7%] w-1 bg-amber-400 animate-pulse"></div>
            )}
            {winningPaylines.includes(6) && (
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-amber-400 transform -translate-x-1/2 animate-pulse"></div>
            )}
            {winningPaylines.includes(7) && (
              <div className="absolute top-0 bottom-0 right-[16.7%] w-1 bg-amber-400 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Paytable */}
      <div className="mt-6 bg-blue-900/50 p-3 rounded-lg border border-blue-700 w-full max-w-md">
        <h3 className="text-center text-amber-400 font-bold mb-2">Paylines & Pembayaran</h3>
        <div className="grid grid-cols-4 gap-2 text-sm">
          {SYMBOLS.slice(0, 4).map((symbol, i) => (
            <div key={i} className="flex flex-col items-center gap-1 bg-blue-800/50 p-2 rounded">
              <div className="w-8 h-8">{symbol.svg}</div>
              <span className="text-xs text-center">
                x3: {WINNING_COMBINATIONS.find((c) => c.symbol === i && c.count === 3)?.multiplier}x
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-center text-blue-300">
          8 Paylines Aktif: Horizontal, Vertikal, dan Diagonal
        </div>
      </div>

      {/* Hidden audio elements */}
      <div className="hidden">
        <audio id="spinSound" src="/sounds/spin.mp3" preload="auto"></audio>
        <audio id="winSound" src="/sounds/win.mp3" preload="auto"></audio>
        <audio id="loseSound" src="/sounds/lose.mp3" preload="auto"></audio>
        <audio id="clickSound" src="/sounds/click.mp3" preload="auto"></audio>
      </div>
    </div>
  )
}

