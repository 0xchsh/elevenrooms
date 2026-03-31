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
{ scene: 'fireplace', layer: 1, type: 'sfx',   prompt: 'wood fire crackling and popping, cozy fireplace ambience, burning logs, warm close recording' },
{ scene: 'fireplace', layer: 2, type: 'music', prompt: 'gentle solo piano, slow introspective melody, warm cozy classical feel, soft and intimate, no percussion' },
{ scene: 'fireplace', layer: 3, type: 'sfx',   prompt: 'old house settling sounds, quiet creaks, warm interior room tone with slight wind outside windows' },
{ scene: 'fireplace', layer: 4, type: 'sfx',   prompt: 'quiet winter night ambience, muffled wind through walls, distant owl hoot, peaceful late night exterior heard from indoors' },

// ── Library ───────────────────────────────────────────────────────────────
{ scene: 'library', layer: 1, type: 'sfx',   prompt: 'quiet library ambience, HVAC air vent hum, very quiet indoor room tone, large open room' },
{ scene: 'library', layer: 2, type: 'sfx',   prompt: 'turning book pages slowly, quiet page flips, occasional pen writing on paper' },
{ scene: 'library', layer: 3, type: 'sfx',   prompt: 'distant footsteps on hardwood floor, quiet chair creaks, occasional soft cough, hushed library atmosphere' },
{ scene: 'library', layer: 4, type: 'music', prompt: 'extremely faint classical piano from another room, muffled through walls, barely audible background music, distant and warm' },

// ── Barbershop ────────────────────────────────────────────────────────────
{ scene: 'barbershop', layer: 1, type: 'music', prompt: 'vintage AM radio jazz, classic 1950s barbershop jazz, swinging big band, warm lo-fi radio quality, upbeat and nostalgic' },
{ scene: 'barbershop', layer: 2, type: 'sfx',   prompt: 'hair scissors snipping, electric clippers buzzing intermittently, barbershop cutting sounds, spray bottle spritz' },
{ scene: 'barbershop', layer: 3, type: 'sfx',   prompt: 'indistinct male voices talking, muffled friendly chatter, busy shop atmosphere, occasional laughter' },
{ scene: 'barbershop', layer: 4, type: 'sfx',   prompt: 'shop door bell chime, cash register sounds, barber chair hydraulic pump, occasional door entry bell' },

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
  { scene: 'gym', layer: 1, type: 'music', prompt: 'aggressive trap rap instrumental, hard hitting 808 bass, trap hi-hats, dark gym workout beat, no vocals, heavy rap production 140 bpm' },
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
{ scene: 'recordingstudio', layer: 1, type: 'sfx',   prompt: 'recording studio room tone, dead quiet treated room, professional studio silence with faint equipment hum' },
{ scene: 'recordingstudio', layer: 2, type: 'music', prompt: 'indie rock rough mix playing through studio monitors, slightly muffled nearfield speaker playback, guitar and drums, lo-fi monitor quality' },
{ scene: 'recordingstudio', layer: 3, type: 'sfx',   prompt: 'mixing console button clicks, mouse clicks, office chair creaks on hard floor, studio control room movement' },
{ scene: 'recordingstudio', layer: 4, type: 'sfx',   prompt: 'studio headphone bleed, faint talkback mic click, transport button press, tape machine or DAW playback sounds' },
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
