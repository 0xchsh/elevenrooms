import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_KEY = process.env.ELEVENLABS_API_KEY
if (!API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY not set in .env.local')
  process.exit(1)
}

interface SoundEntry {
  scene: string
  layer: number
  prompt: string
}

const SOUNDS: SoundEntry[] = [
  { scene: 'city', layer: 1, prompt: 'heavy city traffic ambience, cars passing, engine rumble, urban soundscape' },
  { scene: 'city', layer: 2, prompt: 'busy street crowd, people talking and walking, urban pedestrians' },
  { scene: 'city', layer: 3, prompt: 'rain falling on city streets, steady light rain, wet pavement ambience' },
  { scene: 'city', layer: 4, prompt: 'distant police and ambulance sirens, city emergency vehicles in the distance' },
  { scene: 'cafe', layer: 1, prompt: 'soft jazz piano background music, warm intimate cafe ambience' },
  { scene: 'cafe', layer: 2, prompt: 'busy coffee shop crowd, murmuring conversations, social cafe atmosphere' },
  { scene: 'cafe', layer: 3, prompt: 'espresso machine steaming and hissing, coffee grinder sounds, barista equipment' },
  { scene: 'cafe', layer: 4, prompt: 'cups and saucers clinking, coffee shop dishes, ceramic sounds in a cafe' },
  { scene: 'nature', layer: 1, prompt: 'birds chirping, morning bird song, peaceful forest ambience' },
  { scene: 'nature', layer: 2, prompt: 'wind through trees, gentle rustling leaves, outdoor breeze in a forest' },
  { scene: 'nature', layer: 3, prompt: 'babbling brook, stream water flowing over rocks, gentle river ambience' },
  { scene: 'nature', layer: 4, prompt: 'crickets and night insects chirping, evening nature sounds, cicadas' },
]

async function generateSound(prompt: string): Promise<ArrayBuffer> {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY!,
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: 20,
      model_id: 'eleven_text_to_sound_v2',
      output_format: 'mp3_44100_128',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`ElevenLabs error ${res.status}: ${body}`)
  }

  return res.arrayBuffer()
}

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public', 'audio')

  for (const { scene, layer, prompt } of SOUNDS) {
    const dir = path.join(publicDir, scene)
    fs.mkdirSync(dir, { recursive: true })

    const outPath = path.join(dir, `layer${layer}.mp3`)

    if (fs.existsSync(outPath)) {
      console.log(`Skipping ${scene}/layer${layer}.mp3 (already exists)`)
      continue
    }

    console.log(`Generating ${scene}/layer${layer}...`)
    console.log(`  Prompt: "${prompt}"`)

    const buffer = await generateSound(prompt)
    fs.writeFileSync(outPath, Buffer.from(buffer))
    console.log(`  Saved → ${outPath}`)

    // Rate limit: 600ms between requests
    await new Promise(r => setTimeout(r, 600))
  }

  console.log('\nDone! All sounds generated.')
}

main().catch(err => {
  console.error('Failed:', err.message)
  process.exit(1)
})
