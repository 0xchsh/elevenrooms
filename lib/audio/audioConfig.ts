import type { SceneName } from '@/lib/three/types'

export interface LayerConfig {
  id: string
  src: string
  label: string
  prompt: string
  // Optional base gain (0-1) applied on top of layer step on/off. Defaults to 1.
  baseGain?: number
  // If set, layer plays in bursts rather than continuously
  intermittent?: {
    burstDuration: number   // seconds the burst lasts
    intervalMin: number     // min seconds between bursts
    intervalMax: number     // max seconds between bursts
    burstGain: number       // gain during burst (0-1)
    fadeTime: number        // fade in/out time constant
  }
}

export const AUDIO_CONFIG: Record<SceneName, LayerConfig[]> = {
  city: [
    {
      id: 'city-1',
      src: '/audio/city/layer1.mp3',
      label: 'Traffic',
      prompt: 'heavy city traffic ambience, cars passing, engine rumble, urban soundscape',
    },
    {
      id: 'city-2',
      src: '/audio/city/layer2.mp3',
      label: 'Crowd',
      prompt: 'busy street crowd, people talking and walking, urban pedestrians',
    },
    {
      id: 'city-3',
      src: '/audio/city/layer3.mp3',
      label: 'Rain',
      prompt: 'rain falling on city streets, steady light rain, wet pavement ambience',
    },
    {
      id: 'city-4',
      src: '/audio/city/layer4.mp3',
      label: 'Sirens',
      prompt: 'distant police and ambulance sirens, city emergency vehicles in the distance',
    },
  ],
  cafe: [
    {
      id: 'cafe-1',
      src: '/audio/cafe/layer1.mp3',
      label: 'Jazz',
      prompt: 'soft jazz piano background music, warm intimate cafe ambience',
    },
    {
      id: 'cafe-2',
      src: '/audio/cafe/layer2.mp3',
      label: 'Crowd',
      prompt: 'busy coffee shop crowd, murmuring conversations, social cafe atmosphere',
    },
    {
      id: 'cafe-3',
      src: '/audio/cafe/layer3.mp3',
      label: 'Machine',
      prompt: 'espresso machine steaming and hissing, coffee grinder sounds, barista equipment',
      intermittent: {
        burstDuration: 3,
        intervalMin: 14,
        intervalMax: 24,
        burstGain: 0.85,
        fadeTime: 0.4,
      },
    },
    {
      id: 'cafe-4',
      src: '/audio/cafe/layer4.mp3',
      label: 'Cups',
      prompt: 'cups and saucers clinking, coffee shop dishes, ceramic sounds in a cafe',
    },
  ],
  nature: [
    {
      id: 'nature-1',
      src: '/audio/nature/layer1.mp3',
      label: 'Birds',
      prompt: 'birds chirping, morning bird song, peaceful forest ambience',
    },
    {
      id: 'nature-2',
      src: '/audio/nature/layer2.mp3',
      label: 'Wind',
      prompt: 'wind through trees, gentle rustling leaves, outdoor breeze in a forest',
    },
    {
      id: 'nature-3',
      src: '/audio/nature/layer3.mp3',
      label: 'Stream',
      prompt: 'babbling brook, stream water flowing over rocks, gentle river ambience',
    },
    {
      id: 'nature-4',
      src: '/audio/nature/layer4.mp3',
      label: 'Crickets',
      prompt: 'crickets and night insects chirping, evening nature sounds, cicadas',
    },
  ],
  fireplace: [
    { id: 'fireplace-1', src: '/audio/fireplace/layer1.mp3', label: 'Fire', prompt: 'wood fire crackling and popping, cozy fireplace ambience, burning logs' },
    { id: 'fireplace-2', src: '/audio/fireplace/layer2.mp3', label: 'Music', prompt: 'soft classical piano music, gentle cozy instrumental, warm background piano melody' },
    { id: 'fireplace-3', src: '/audio/fireplace/layer3.mp3', label: 'Pops', prompt: 'wood logs popping and settling in a fire, occasional wood crack sounds' },
    { id: 'fireplace-4', src: '/audio/fireplace/layer4.mp3', label: 'Night', prompt: 'quiet night ambience, distant owl hooting, peaceful late night sounds' },
  ],
  library: [
    { id: 'library-1', src: '/audio/library/layer1.mp3', label: 'Room', prompt: 'quiet library ambience, HVAC hum, very quiet indoor room tone' },
    { id: 'library-2', src: '/audio/library/layer2.mp3', label: 'Pages', prompt: 'turning book pages, quiet page flips, library book sounds' },
    { id: 'library-3', src: '/audio/library/layer3.mp3', label: 'Steps', prompt: 'distant footsteps on hardwood floor, quiet library movement, hushed whispers' },
    { id: 'library-4', src: '/audio/library/layer4.mp3', label: 'Rain', prompt: 'gentle rain on windows, quiet exterior rain heard from inside a building, soft steady rain ambience', baseGain: 0.5 },
  ],
  barbershop: [
    { id: 'barbershop-1', src: '/audio/barbershop/layer1.mp3', label: 'Jazz', prompt: 'old AM radio jazz playing quietly in a barbershop, tinny vintage radio jazz, soft background music from a small radio', baseGain: 0.4 },
    { id: 'barbershop-2', src: '/audio/barbershop/layer2.mp3', label: 'Clippers', prompt: 'electric hair clippers buzzing, barbershop clippers sound, hair trimmer ambience', intermittent: { burstDuration: 4, intervalMin: 10, intervalMax: 18, burstGain: 0.85, fadeTime: 0.3 } },
    { id: 'barbershop-3', src: '/audio/barbershop/layer3.mp3', label: 'Chatter', prompt: 'two people having a relaxed barbershop conversation, low friendly chat, natural pauses in conversation', baseGain: 0.55 },
    { id: 'barbershop-4', src: '/audio/barbershop/layer4.mp3', label: 'Chime', prompt: 'shop door bell chime, door opening bell, occasional door entry chime', intermittent: { burstDuration: 1.5, intervalMin: 20, intervalMax: 40, burstGain: 0.7, fadeTime: 0.2 } },
  ],
  spacestation: [
    { id: 'spacestation-1', src: '/audio/spacestation/layer1.mp3', label: 'Hum', prompt: 'space station life support hum, spacecraft machinery ambient drone, deep mechanical hum' },
    { id: 'spacestation-2', src: '/audio/spacestation/layer2.mp3', label: 'Systems', prompt: 'spacecraft mechanical systems, space station ambient machinery, ventilation and pumps' },
    { id: 'spacestation-3', src: '/audio/spacestation/layer3.mp3', label: 'Beeps', prompt: 'spacecraft computer beeps, space station interface sounds, mission control beeps', intermittent: { burstDuration: 2, intervalMin: 8, intervalMax: 15, burstGain: 0.6, fadeTime: 0.2 } },
    { id: 'spacestation-4', src: '/audio/spacestation/layer4.mp3', label: 'Radio', prompt: 'NASA mission control radio in English, American astronaut voice over radio static, Houston we copy, English space radio communication' },
  ],
  underwater: [
    { id: 'underwater-1', src: '/audio/underwater/layer1.mp3', label: 'Depth', prompt: 'deep underwater ambience, ocean pressure hum, deep sea ambient sound' },
    { id: 'underwater-2', src: '/audio/underwater/layer2.mp3', label: 'Bubbles', prompt: 'underwater bubbles rising, scuba diving bubbles, ocean bubbles sound' },
    { id: 'underwater-3', src: '/audio/underwater/layer3.mp3', label: 'Whale', prompt: 'whale song, humpback whale calls, distant whale singing underwater' },
    { id: 'underwater-4', src: '/audio/underwater/layer4.mp3', label: 'Current', prompt: 'underwater ocean current, water flowing movement, deep sea current whoosh' },
  ],
  casino: [
    { id: 'casino-1', src: '/audio/casino/layer1.mp3', label: 'Floor', prompt: 'casino floor ambient hum, slot machines whirring, low murmur of a busy casino' },
    { id: 'casino-2', src: '/audio/casino/layer2.mp3', label: 'Slots', prompt: 'slot machine spinning and paying out, casino slot sounds, reel spinning and coins', intermittent: { burstDuration: 3, intervalMin: 8, intervalMax: 18, burstGain: 0.8, fadeTime: 0.2 } },
    { id: 'casino-3', src: '/audio/casino/layer3.mp3', label: 'Chips', prompt: 'poker chips clinking, casino chips shuffling on a table, card dealing sounds' },
    { id: 'casino-4', src: '/audio/casino/layer4.mp3', label: 'Crowd', prompt: 'casino crowd chatter, excited gamblers, cheering at a craps table, casino atmosphere' },
  ],
  gym: [
    { id: 'gym-1', src: '/audio/gym/layer1.mp3', label: 'Music', prompt: 'distant gym radio music, muffled upbeat workout music playing in background, low gym speaker music', baseGain: 0.38 },
    { id: 'gym-2', src: '/audio/gym/layer2.mp3', label: 'Machines', prompt: 'gym cardio machines, treadmill running sounds, steady rhythmic elliptical machine ambience', baseGain: 0.7 },
    { id: 'gym-3', src: '/audio/gym/layer3.mp3', label: 'Weights', prompt: 'weight plates clanking, dumbbells dropping on rubber floor, gym weight room sounds', intermittent: { burstDuration: 2, intervalMin: 6, intervalMax: 14, burstGain: 0.9, fadeTime: 0.1 } },
    { id: 'gym-4', src: '/audio/gym/layer4.mp3', label: 'Effort', prompt: 'occasional workout grunts and heavy exhales, single person exerting effort lifting weights, sparse gym breathing sounds', baseGain: 0.65, intermittent: { burstDuration: 1.5, intervalMin: 8, intervalMax: 20, burstGain: 0.65, fadeTime: 0.15 } },
  ],
  tennis: [
    { id: 'tennis-1', src: '/audio/tennis/layer1.mp3', label: 'Outdoor', prompt: 'outdoor tennis court ambience, light wind, open air sports facility' },
    { id: 'tennis-2', src: '/audio/tennis/layer2.mp3', label: 'Rally', prompt: 'tennis ball hitting racket, tennis rally sounds, ball bouncing on court' },
    { id: 'tennis-3', src: '/audio/tennis/layer3.mp3', label: 'Crowd', prompt: 'tennis match crowd, polite tennis applause, quiet tennis spectator crowd' },
    { id: 'tennis-4', src: '/audio/tennis/layer4.mp3', label: 'Birds', prompt: 'outdoor birds chirping, open air nature sounds, birds near sports facility' },
  ],
  ramen: [
    { id: 'ramen-1', src: '/audio/ramen/layer1.mp3', label: 'Kitchen', prompt: 'ramen restaurant kitchen ambience, Japanese kitchen sounds, wok sizzling' },
    { id: 'ramen-2', src: '/audio/ramen/layer2.mp3', label: 'Broth', prompt: 'soup broth bubbling, ramen pot boiling, gentle cooking liquid sounds' },
    { id: 'ramen-3', src: '/audio/ramen/layer3.mp3', label: 'Crowd', prompt: 'Japanese ramen shop chatter, intimate restaurant conversation, noodle shop ambience' },
    { id: 'ramen-4', src: '/audio/ramen/layer4.mp3', label: 'Slurp', prompt: 'noodle slurping sounds, ramen eating, Japanese noodle restaurant eating sounds', intermittent: { burstDuration: 2, intervalMin: 10, intervalMax: 22, burstGain: 0.5, fadeTime: 0.2 } },
  ],
  beach: [
    { id: 'beach-1', src: '/audio/beach/layer1.mp3', label: 'Waves', prompt: 'ocean waves on sandy beach, rhythmic surf sounds, gentle wave ambience' },
    { id: 'beach-2', src: '/audio/beach/layer2.mp3', label: 'Wind', prompt: 'coastal breeze, warm ocean wind, beach wind ambience' },
    { id: 'beach-3', src: '/audio/beach/layer3.mp3', label: 'Gulls', prompt: 'seagulls calling, beach seagull sounds, coastal birds' },
    { id: 'beach-4', src: '/audio/beach/layer4.mp3', label: 'Crowd', prompt: 'distant beach crowd, summer beach ambience, people at the beach' },
  ],
  laundromat: [
    { id: 'laundromat-1', src: '/audio/laundromat/layer1.mp3', label: 'Machines', prompt: 'washing machines running, laundromat ambient hum, washers and dryers cycling' },
    { id: 'laundromat-2', src: '/audio/laundromat/layer2.mp3', label: 'Drums', prompt: 'tumble dryer spinning, laundromat dryer drum rotating, clothes tumbling in dryer' },
    { id: 'laundromat-3', src: '/audio/laundromat/layer3.mp3', label: 'Fluorescent', prompt: 'fluorescent light hum, institutional indoor hum, quiet late night room tone with electrical buzz' },
    { id: 'laundromat-4', src: '/audio/laundromat/layer4.mp3', label: 'Spin', prompt: 'washing machine spin cycle, high speed spin, water draining from washer', intermittent: { burstDuration: 5, intervalMin: 20, intervalMax: 40, burstGain: 0.85, fadeTime: 0.6 } },
  ],
  club: [
    { id: 'club-1', src: '/audio/club/layer1.mp3', label: 'Music', prompt: 'full underground techno club track, driving four-on-the-floor kick, dark synths, powerful sub bass, DJ set at 128 bpm, no vocals' },
    { id: 'club-2', src: '/audio/club/layer2.mp3', label: 'Crowd', prompt: 'nightclub crowd ambient noise, people dancing and talking, club floor atmosphere, no music', baseGain: 0.5 },
    { id: 'club-3', src: '/audio/club/layer3.mp3', label: 'Cheer', prompt: 'crowd cheer and shout reaction at a nightclub, people yelling and whistling in excitement, club crowd burst', intermittent: { burstDuration: 2.5, intervalMin: 12, intervalMax: 25, burstGain: 0.75, fadeTime: 0.2 } },
    { id: 'club-4', src: '/audio/club/layer4.mp3', label: 'Drop', prompt: 'DJ air horn and bass drop sound effect at a club, hype DJ stab, crowd reacts to drop moment', intermittent: { burstDuration: 2, intervalMin: 20, intervalMax: 40, burstGain: 0.8, fadeTime: 0.15 } },
  ],
  recordingstudio: [
    { id: 'recordingstudio-1', src: '/audio/recordingstudio/layer1.mp3', label: 'Drums', prompt: 'live drum kit loop, pop song drum beat, snare kick hi-hat groove, studio recorded drums, clean tight production' },
    { id: 'recordingstudio-2', src: '/audio/recordingstudio/layer2.mp3', label: 'Bass', prompt: 'electric bass guitar loop, pop song bass line, groovy bass riff complementing drums, studio recorded clean bass', baseGain: 0.85 },
    { id: 'recordingstudio-3', src: '/audio/recordingstudio/layer3.mp3', label: 'Guitar', prompt: 'electric guitar rhythm chords loop, pop song chord progression, clean tone strumming pattern, studio recorded', baseGain: 0.75 },
    { id: 'recordingstudio-4', src: '/audio/recordingstudio/layer4.mp3', label: 'Keys', prompt: 'synth pad and piano melody loop, pop song lead melody hook, warm keys over guitar bass and drums, studio recorded', baseGain: 0.7 },
  ],
}
