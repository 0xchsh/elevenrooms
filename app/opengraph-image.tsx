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
            opacity: 0.12,
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

        {/* Logo centered */}
        <div style={{ display: 'flex', opacity: 0.18 }}>
          <svg width="280" height="280" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="48" height="48" rx="12" stroke="white" stroke-width="4"/>
            <path d="M35.406 38.5999H30.294V22.2559H23.958V18.4039C24.846 18.4279 25.698 18.3679 26.514 18.2239C27.354 18.0559 28.098 17.7799 28.746 17.3959C29.418 16.9879 29.982 16.4599 30.438 15.8119C30.894 15.1639 31.194 14.3599 31.338 13.3999H35.406V38.5999Z" fill="white"/>
            <path d="M24.0417 38.5999H18.9297V22.2559H12.5938V18.4039C13.4818 18.4279 14.3338 18.3679 15.1498 18.2239C15.9897 18.0559 16.7338 17.7799 17.3818 17.3959C18.0538 16.9879 18.6177 16.4599 19.0737 15.8119C19.5297 15.1639 19.8298 14.3599 19.9738 13.3999H24.0417V38.5999Z" fill="white"/>
          </svg>
        </div>
      </div>
    ),
    { ...size }
  )
}
