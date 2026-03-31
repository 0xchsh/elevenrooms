import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ElevenRooms — Ambient soundscape experience'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ASCII_CHARS = '.,;:!|[]{}+-=*#@%&/\\^~'

function generateAsciiGrid(cols: number, rows: number, seed: number) {
  let result = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = Math.sin(seed + c * 0.37 + r * 0.61) * 0.5 + 0.5
      const idx = Math.floor(n * ASCII_CHARS.length) % ASCII_CHARS.length
      // Vary density — sparser toward center
      const dx = (c / cols - 0.5) * 2
      const dy = (r / rows - 0.5) * 2
      const distFromCenter = Math.sqrt(dx * dx + dy * dy)
      result += distFromCenter < 0.55 && Math.random() > 0.3 ? ' ' : ASCII_CHARS[idx]
    }
    result += '\n'
  }
  return result
}

export default function OGImage() {
  const seed = 42.7
  const cols = 110
  const rows = 36
  const ascii = generateAsciiGrid(cols, rows, seed)

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'monospace',
        }}
      >
        {/* ASCII texture background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.18,
          }}
        >
          <pre
            style={{
              color: '#ffffff',
              fontSize: 11,
              lineHeight: 1.4,
              letterSpacing: '0.05em',
              margin: 0,
              whiteSpace: 'pre',
            }}
          >
            {ascii}
          </pre>
        </div>

        {/* Center content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontSize: 64,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            ELEVEN ROOMS
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 20,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            AMBIENT SOUNDSCAPE EXPERIENCE
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
