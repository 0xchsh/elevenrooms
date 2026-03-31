import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const API_KEY = process.env.ELEVENLABS_API_KEY
if (!API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY not set in .env.local')
  process.exit(1)
}

const client = new ElevenLabsClient({ apiKey: API_KEY })

interface SoundEntry {
  scene: string
  layer: number
  prompt: string
  type: 'sfx' | 'music'
}

const SOUNDS: SoundEntry[] = [
  // ── City ─────────────────────────────────────────────────────────────────
  { scene: 'city', layer: 1, type: 'sfx', prompt: 'heavy city traffic ambience, cars passing, engine rumble, urban soundscape' },
  { scene: 'city', layer: 2, type: 'sfx', prompt: 'busy street crowd, people talking and walking, urban pedestrians' },
  { scene: 'city', layer: 3, type: 'sfx', prompt: 'rain falling on city streets, steady light rain, wet pavement ambience' },
  { scene: 'city', layer: 4, type: 'sfx', prompt: 'distant police and ambulance sirens, city emergency vehicles in the distance' },

  // ── Cafe ──────────────────────────────────────────────────────────────────
  { scene: 'cafe', layer: 1, type: 'music', prompt: 'soft jazz piano trio, warm intimate cafe background music, gentle upright bass and brushed drums, relaxed bossa nova feel' },
  { scene: 'cafe', layer: 2, type: 'sfx',   prompt: 'busy coffee shop crowd, murmuring conversations, social cafe atmosphere' },
  { scene: 'cafe', layer: 3, type: 'sfx',   prompt: 'espresso machine steaming and hissing, coffee grinder sounds, barista equipment' },
  { scene: 'cafe', layer: 4, type: 'sfx',   prompt: 'cups and saucers clinking, coffee shop dishes, ceramic sounds in a cafe' },

  // ── Nature ────────────────────────────────────────────────────────────────
  { scene: 'nature', layer: 1, type: 'sfx', prompt: 'birds chirping, morning bird song, peaceful forest ambience' },
  { scene: 'nature', layer: 2, type: 'sfx', prompt: 'wind through trees, gentle rustling leaves, outdoor breeze in a forest' },
  { scene: 'nature', layer: 3, type: 'sfx', prompt: 'babbling brook, stream water flowing over rocks, gentle river ambience' },
  { scene: 'nature', layer: 4, type: 'sfx', prompt: 'crickets and night insects chirping, evening nature sounds, cicadas' },

  // ── Fireplace ─────────────────────────────────────────────────────────────
  { scene: 'fireplace', layer: 1, type: 'sfx',   prompt: 'wood fire crackling and popping, cozy fireplace ambience, burning logs' },
  { scene: 'fireplace', layer: 2, type: 'music', prompt: 'gentle solo piano, slow introspective melody, warm cozy classical feel, soft and intimate, no percussion' },
  { scene: 'fireplace', layer: 3, type: 'sfx',   prompt: 'wood logs popping and settling in a fire, occasional wood crack sounds' },
  { scene: 'fireplace', layer: 4, type: 'sfx',   prompt: 'quiet night ambience, distant owl hooting, peaceful late night sounds' },

  // ── Library ───────────────────────────────────────────────────────────────
  { scene: 'library', layer: 1, type: 'sfx',   prompt: 'quiet library ambience, HVAC hum, very quiet indoor room tone' },
  { scene: 'library', layer: 2, type: 'sfx',   prompt: 'turning book pages, quiet page flips, library book sounds' },
  { scene: 'library', layer: 3, type: 'music', prompt: 'soft classical chamber music, quiet study room background, gentle strings and piano, slow tempo, peaceful and focused' },
  { scene: 'library', layer: 4, type: 'sfx',   prompt: 'distant footsteps on hardwood floor, quiet library movement, hushed whispers' },

  // ── Barbershop ────────────────────────────────────────────────────────────
  { scene: 'barbershop', layer: 1, type: 'music', prompt: 'vintage AM radio jazz, classic 1950s barbershop jazz, swinging big band, warm lo-fi radio quality, upbeat and nostalgic' },
  { scene: 'barbershop', layer: 2, type: 'sfx',   prompt: 'electric hair clippers buzzing, barbershop clippers sound, hair trimmer ambience' },
  { scene: 'barbershop', layer: 3, type: 'sfx',   prompt: 'barbershop conversation, customers chatting, friendly barbershop talk' },
  { scene: 'barbershop', layer: 4, type: 'sfx',   prompt: 'shop door bell chime, door opening bell, occasional door entry chime' },

  // ── Space Station ─────────────────────────────────────────────────────────
  { scene: 'spacestation', layer: 1, type: 'sfx', prompt: 'space station life support hum, spacecraft machinery ambient drone, deep mechanical hum' },
  { scene: 'spacestation', layer: 2, type: 'sfx', prompt: 'spacecraft mechanical systems, space station ambient machinery, ventilation and pumps' },
  { scene: 'spacestation', layer: 3, type: 'sfx', prompt: 'spacecraft computer beeps, space station interface sounds, mission control beeps' },
  { scene: 'spacestation', layer: 4, type: 'sfx', prompt: 'NASA mission control radio in English, American astronaut voice over radio static, Houston we copy, English space radio communication' },

  // ── Underwater ────────────────────────────────────────────────────────────
  { scene: 'underwater', layer: 1, type: 'sfx', prompt: 'deep underwater ambience, ocean pressure hum, deep sea ambient sound' },
  { scene: 'underwater', layer: 2, type: 'sfx', prompt: 'underwater bubbles rising, scuba diving bubbles, ocean bubbles sound' },
  { scene: 'underwater', layer: 3, type: 'sfx', prompt: 'whale song, humpback whale calls, distant whale singing underwater' },
  { scene: 'underwater', layer: 4, type: 'sfx', prompt: 'underwater ocean current, water flowing movement, deep sea current whoosh' },

  // ── Casino ────────────────────────────────────────────────────────────────
  { scene: 'casino', layer: 1, type: 'sfx', prompt: 'casino floor ambient hum, slot machines whirring, low murmur of a busy casino' },
  { scene: 'casino', layer: 2, type: 'sfx', prompt: 'slot machine spinning and paying out, casino slot sounds, reel spinning and coins' },
  { scene: 'casino', layer: 3, type: 'sfx', prompt: 'poker chips clinking, casino chips shuffling on a table, card dealing sounds' },
  { scene: 'casino', layer: 4, type: 'sfx', prompt: 'casino crowd chatter, excited gamblers, cheering at a craps table, casino atmosphere' },

  // ── Gym ───────────────────────────────────────────────────────────────────
  { scene: 'gym', layer: 1, type: 'music', prompt: 'high energy workout music, driving electronic beats, pump up fitness instrumental, heavy bass and synth, fast tempo 140 bpm' },
  { scene: 'gym', layer: 2, type: 'sfx',   prompt: 'gym cardio machines, treadmill running sounds, elliptical machine ambience' },
  { scene: 'gym', layer: 3, type: 'sfx',   prompt: 'weight plates clanking, dumbbells dropping, gym weight room sounds' },
  { scene: 'gym', layer: 4, type: 'sfx',   prompt: 'gym crowd, people exercising, workout grunts and breathing, fitness room ambience' },

  // ── Tennis ────────────────────────────────────────────────────────────────
  { scene: 'tennis', layer: 1, type: 'sfx', prompt: 'outdoor tennis court ambience, light wind, open air sports facility' },
  { scene: 'tennis', layer: 2, type: 'sfx', prompt: 'tennis ball hitting racket, tennis rally sounds, ball bouncing on court' },
  { scene: 'tennis', layer: 3, type: 'sfx', prompt: 'tennis match crowd, polite tennis applause, quiet tennis spectator crowd' },
  { scene: 'tennis', layer: 4, type: 'sfx', prompt: 'outdoor birds chirping, open air nature sounds, birds near sports facility' },

  // ── Ramen ─────────────────────────────────────────────────────────────────
  { scene: 'ramen', layer: 1, type: 'sfx', prompt: 'ramen restaurant kitchen ambience, Japanese kitchen sounds, wok sizzling' },
  { scene: 'ramen', layer: 2, type: 'sfx', prompt: 'soup broth bubbling, ramen pot boiling, gentle cooking liquid sounds' },
  { scene: 'ramen', layer: 3, type: 'sfx', prompt: 'Japanese ramen shop chatter, intimate restaurant conversation, noodle shop ambience' },
  { scene: 'ramen', layer: 4, type: 'sfx', prompt: 'noodle slurping sounds, ramen eating, Japanese noodle restaurant eating sounds' },

  // ── Beach ─────────────────────────────────────────────────────────────────
  { scene: 'beach', layer: 1, type: 'sfx', prompt: 'ocean waves on sandy beach, rhythmic surf sounds, gentle wave ambience' },
  { scene: 'beach', layer: 2, type: 'sfx', prompt: 'coastal breeze, warm ocean wind, beach wind ambience' },
  { scene: 'beach', layer: 3, type: 'sfx', prompt: 'seagulls calling, beach seagull sounds, coastal birds' },
  { scene: 'beach', layer: 4, type: 'sfx', prompt: 'distant beach crowd, summer beach ambience, people at the beach' },

  // ── Laundromat ────────────────────────────────────────────────────────────
  { scene: 'laundromat', layer: 1, type: 'sfx', prompt: 'washing machines running, laundromat ambient hum, washers and dryers cycling' },
  { scene: 'laundromat', layer: 2, type: 'sfx', prompt: 'tumble dryer spinning, laundromat dryer drum rotating, clothes tumbling in dryer' },
  { scene: 'laundromat', layer: 3, type: 'sfx', prompt: 'fluorescent light hum, institutional indoor hum, quiet late night room tone with electrical buzz' },
  { scene: 'laundromat', layer: 4, type: 'sfx', prompt: 'washing machine spin cycle, high speed spin, water draining from washer' },

  // ── Club ──────────────────────────────────────────────────────────────────
  { scene: 'club', layer: 1, type: 'music', prompt: 'deep pulsing club bass line, dark minimal techno, sub-bass heavy, 128 bpm, underground club feel' },
  { scene: 'club', layer: 2, type: 'music', prompt: 'energetic electronic dance music, DJ set, driving four-on-the-floor beat, euphoric synths, clear crisp mix, 128 bpm' },
  { scene: 'club', layer: 3, type: 'sfx',   prompt: 'nightclub crowd, people dancing and cheering, club atmosphere crowd noise' },
  { scene: 'club', layer: 4, type: 'sfx',   prompt: 'crowd eruption at DJ bass drop, dance floor cheer, club crowd reaction' },

  // ── Recording Studio ──────────────────────────────────────────────────────
  { scene: 'recordingstudio', layer: 1, type: 'sfx',   prompt: 'recording studio room tone, quiet studio ambience, professional studio silence hum' },
  { scene: 'recordingstudio', layer: 2, type: 'music', prompt: 'indie rock track playing through studio monitors, slightly muffled playback, rough mix in progress, guitar and drums' },
  { scene: 'recordingstudio', layer: 3, type: 'sfx',   prompt: 'mixing console equipment hum, studio equipment sounds, professional audio gear ambience' },
  { scene: 'recordingstudio', layer: 4, type: 'sfx',   prompt: 'musician recording a take, acoustic guitar or piano being recorded, studio session sounds' },
]

async function streamToBuffer(stream: AsyncIterable<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

async function generateSfx(prompt: string): Promise<Buffer> {
  const stream = await client.textToSoundEffects.convert({
    text: prompt,
    durationSeconds: 22,
    promptInfluence: 0.5,
    loop: true,
    outputFormat: 'mp3_44100_128',
  })
  return streamToBuffer(stream)
}

async function generateMusic(prompt: string): Promise<Buffer> {
  const stream = await client.music.compose({
    prompt,
    musicLengthMs: 90_000,
    forceInstrumental: true,
    outputFormat: 'mp3_44100_128',
  })
  return streamToBuffer(stream)
}

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public', 'audio')

  for (const { scene, layer, prompt, type } of SOUNDS) {
    const dir = path.join(publicDir, scene)
    fs.mkdirSync(dir, { recursive: true })

    const outPath = path.join(dir, `layer${layer}.mp3`)

    if (fs.existsSync(outPath)) {
      console.log(`Skipping ${scene}/layer${layer}.mp3 (already exists)`)
      continue
    }

    console.log(`Generating [${type.toUpperCase()}] ${scene}/layer${layer}...`)
    console.log(`  Prompt: "${prompt}"`)

    const buffer = type === 'music' ? await generateMusic(prompt) : await generateSfx(prompt)
    fs.writeFileSync(outPath, buffer)
    console.log(`  Saved → ${outPath}`)

    // Rate limit: 800ms between requests
    await new Promise(r => setTimeout(r, 800))
  }

  console.log('\nDone! All sounds generated.')
}

main().catch(err => {
  console.error('Failed:', err.message)
  process.exit(1)
})
