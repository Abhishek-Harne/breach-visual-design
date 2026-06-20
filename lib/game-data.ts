// ============================================================
// TYPES
// ============================================================

export type NodeId = 'github' | 'api' | 'db' | 'admin' | 'exfil' | 'world'
export type NodeStatus = 'neutral' | 'active' | 'breached' | 'defended'
export type GameScreen = 'welcome' | 'modeChoice' | 'game' | 'roundComplete'
export type GameMode = 'thief' | 'cop' | null
export type ResultPhase = 'idle' | 'choosing' | 'resolving' | 'revealed'

export interface ThiefOption {
  id: string
  label: string
  risk: 'none' | 'low' | 'medium' | 'high'
  detectionDelta: number
  successChance: number
  narrative: string
  outcomeIfCaught: string
}

export interface CopOption {
  id: string
  label: string
  cost: number
  effectiveness: number
  narrative: string
}

export interface Stage {
  id: NodeId
  label: string
  order: number
  icon: string
  thief: {
    setup: string
    options: ThiefOption[]
    defenseLine: string
  }
  cop: {
    setup: string
    options: CopOption[]
  }
}

export interface NodeStatusMap {
  github: NodeStatus
  api: NodeStatus
  db: NodeStatus
  admin: NodeStatus
  exfil: NodeStatus
  world: NodeStatus
}

export interface GameState {
  screen: GameScreen
  mode: GameMode
  thiefCompleted: boolean
  copCompleted: boolean
  nodeStatus: NodeStatusMap
  detectionLevel: number
  securityBudget: number
  budgetSpent: number
  activeNodeId: NodeId | null
  selectedOptionId: string | null
  resultPhase: ResultPhase
  spritePosition: number
  // runtime-only: which option was resolved + its narrative text
  resolvedNarrative: string | null
  resolvedDefenseLine: string | null
  resolvedWasCaught: boolean
  // cop mode: track effectiveness of chosen options
  chosenEffectiveness: number[]
}

// ============================================================
// INITIAL STATE
// ============================================================

export const INITIAL_NODE_STATUS: NodeStatusMap = {
  github: 'neutral',
  api: 'neutral',
  db: 'neutral',
  admin: 'neutral',
  exfil: 'neutral',
  world: 'neutral',
}

export const INITIAL_STATE: GameState = {
  screen: 'welcome',
  mode: null,
  thiefCompleted: false,
  copCompleted: false,
  nodeStatus: { ...INITIAL_NODE_STATUS },
  detectionLevel: 0,
  securityBudget: 10,
  budgetSpent: 0,
  activeNodeId: null,
  selectedOptionId: null,
  resultPhase: 'idle',
  spritePosition: 0,
  resolvedNarrative: null,
  resolvedDefenseLine: null,
  resolvedWasCaught: false,
  chosenEffectiveness: [],
}

// ============================================================
// STAGES DATA
// ============================================================

export const STAGES: Stage[] = [
  {
    id: 'github',
    label: 'GITHUB',
    order: 0,
    icon: 'code',
    thief: {
      setup: 'A live API key was committed to a public repo six months ago.',
      options: [
        {
          id: 'quick',
          label: 'GREP FOR SECRETS',
          risk: 'low',
          detectionDelta: 5,
          successChance: 0.95,
          narrative:
            'You scan recent commits for exposed strings. Found it in under a minute.',
          outcomeIfCaught:
            "A bot scanning the same repo flags your traffic pattern, but you're already gone.",
        },
        {
          id: 'careful',
          label: 'MANUALLY AUDIT COMMIT HISTORY',
          risk: 'none',
          detectionDelta: 1,
          successChance: 0.99,
          narrative:
            'You go commit by commit, quiet and slow. It takes longer but leaves almost no trace.',
          outcomeIfCaught:
            'Even this slow approach eventually shows up in access logs, just much later.',
        },
      ],
      defenseLine:
        'Secret scanning on every commit catches leaked keys instantly and can auto-revoke them.',
    },
    cop: {
      setup: "You're deciding how to protect this repo before the key leaks.",
      options: [
        {
          id: 'scan',
          label: 'ENABLE SECRET SCANNING',
          cost: 2,
          effectiveness: 0.95,
          narrative:
            'Every commit is now scanned for credential patterns before it merges.',
        },
        {
          id: 'review',
          label: 'MANUAL CODE REVIEW POLICY',
          cost: 1,
          effectiveness: 0.6,
          narrative: "You add a review step, but humans miss things bots don't.",
        },
      ],
    },
  },
  {
    id: 'api',
    label: 'INT_API',
    order: 1,
    icon: 'plug',
    thief: {
      setup: 'You have a valid key. Time to see what it can reach.',
      options: [
        {
          id: 'quick',
          label: 'BRUTE-FORCE ENDPOINT LIST',
          risk: 'high',
          detectionDelta: 20,
          successChance: 0.9,
          narrative: 'You hammer common endpoint paths until one responds.',
          outcomeIfCaught:
            'Rate limiting flags the burst of requests almost immediately.',
        },
        {
          id: 'careful',
          label: 'READ THE PUBLIC API DOCS FIRST',
          risk: 'low',
          detectionDelta: 5,
          successChance: 0.97,
          narrative:
            'Turns out the docs already tell you exactly which endpoint to hit.',
          outcomeIfCaught:
            'A single authenticated call barely registers as unusual.',
        },
      ],
      defenseLine:
        'Short-lived credentials mean a leaked key expires fast and stops working on its own.',
    },
    cop: {
      setup: 'This key is about to authenticate without a second factor.',
      options: [
        {
          id: 'rotate',
          label: 'SHORT-LIVED TOKENS + ROTATION',
          cost: 2,
          effectiveness: 0.9,
          narrative: 'Keys now expire in hours, not years.',
        },
        {
          id: 'mfa',
          label: 'REQUIRE SECOND FACTOR',
          cost: 3,
          effectiveness: 0.85,
          narrative:
            'Even a valid key now needs a second proof of identity.',
        },
      ],
    },
  },
  {
    id: 'db',
    label: 'CUST_DB',
    order: 2,
    icon: 'database',
    thief: {
      setup: "This key has more reach than it should. Let's see how far.",
      options: [
        {
          id: 'quick',
          label: 'DUMP ENTIRE TABLE',
          risk: 'high',
          detectionDelta: 25,
          successChance: 0.85,
          narrative: 'One big query, all the rows, all at once.',
          outcomeIfCaught:
            'A single query returning this much data trips a size-based alert.',
        },
        {
          id: 'careful',
          label: 'QUERY IN SMALL PAGES',
          risk: 'low',
          detectionDelta: 8,
          successChance: 0.95,
          narrative:
            'You paginate the requests so each one looks unremarkable.',
          outcomeIfCaught:
            'Slower, but each individual query looks like normal traffic.',
        },
      ],
      defenseLine:
        'Least-privilege access scoping means this key should never have reached the database at all.',
    },
    cop: {
      setup: 'This key currently has read access to the entire customer table.',
      options: [
        {
          id: 'scope',
          label: 'SCOPE ACCESS TO MINIMUM NEEDED',
          cost: 3,
          effectiveness: 0.92,
          narrative:
            'The key can now only touch the three fields it actually needs.',
        },
        {
          id: 'monitor',
          label: 'LOG ALL QUERIES, ALERT ON VOLUME',
          cost: 2,
          effectiveness: 0.7,
          narrative:
            "You'll catch it, but only after some data is already gone.",
        },
      ],
    },
  },
  {
    id: 'admin',
    label: 'ADMIN',
    order: 3,
    icon: 'key',
    thief: {
      setup: 'A loose permission sits between you and full admin control.',
      options: [
        {
          id: 'quick',
          label: 'EXPLOIT THE PERMISSION DIRECTLY',
          risk: 'medium',
          detectionDelta: 15,
          successChance: 0.88,
          narrative: 'You escalate in one move, straight to admin.',
          outcomeIfCaught:
            'Privilege escalation events are logged, but rarely reviewed in real time.',
        },
        {
          id: 'careful',
          label: 'CHAIN THROUGH A LOWER ROLE FIRST',
          risk: 'low',
          detectionDelta: 6,
          successChance: 0.93,
          narrative: 'You escalate in two smaller, less obvious steps.',
          outcomeIfCaught:
            'Each individual step looks like a normal permission change.',
        },
      ],
      defenseLine:
        'Regular permission audits catch and alert on unusual privilege changes before they\'re exploited.',
    },
    cop: {
      setup: "This role has a permission that's broader than anyone intended.",
      options: [
        {
          id: 'audit',
          label: 'RUN PERMISSION AUDIT + REVOKE EXCESS',
          cost: 3,
          effectiveness: 0.9,
          narrative: "You find and close the gap before it's used.",
        },
        {
          id: 'alert',
          label: 'ALERT ON PRIVILEGE CHANGES ONLY',
          cost: 1,
          effectiveness: 0.55,
          narrative:
            "You'll know it happened, just not in time to stop it.",
        },
      ],
    },
  },
  {
    id: 'exfil',
    label: 'EXFIL',
    order: 4,
    icon: 'upload',
    thief: {
      setup: "Time to get the data out without tripping any alarms.",
      options: [
        {
          id: 'quick',
          label: 'ONE LARGE TRANSFER',
          risk: 'high',
          detectionDelta: 30,
          successChance: 0.8,
          narrative:
            'Fast, but a huge spike in outbound traffic is hard to miss.',
          outcomeIfCaught:
            'Volume-based anomaly detection catches this almost every time.',
        },
        {
          id: 'careful',
          label: 'SMALL BATCHES OVER SEVERAL DAYS',
          risk: 'low',
          detectionDelta: 7,
          successChance: 0.96,
          narrative:
            "Slow and quiet, each batch looks like ordinary background traffic.",
          outcomeIfCaught:
            "Even small batches add up to a pattern over time, if anyone's looking.",
        },
      ],
      defenseLine:
        'Anomaly detection on export volume and rate catches this even when it\'s spread out.',
    },
    cop: {
      setup: "Data is about to leave in a way that looks like normal traffic.",
      options: [
        {
          id: 'anomaly',
          label: 'DEPLOY EXPORT ANOMALY DETECTION',
          cost: 3,
          effectiveness: 0.88,
          narrative:
            'The system now tracks export patterns over time, not just single events.',
        },
        {
          id: 'cap',
          label: 'HARD CAP ON DAILY EXPORT VOLUME',
          cost: 1,
          effectiveness: 0.65,
          narrative:
            'Simple, cheap, but a patient attacker can still work within the limit.',
        },
      ],
    },
  },
  {
    id: 'world',
    label: 'WORLD',
    order: 5,
    icon: 'globe',
    thief: {
      setup: "The data is out. Now it's just a matter of time.",
      options: [
        {
          id: 'quick',
          label: 'SELL IMMEDIATELY',
          risk: 'high',
          detectionDelta: 20,
          successChance: 0.85,
          narrative: 'Fast payout, but moving stolen data quickly draws attention.',
          outcomeIfCaught:
            'Marketplaces selling fresh breach data get flagged by researchers quickly.',
        },
        {
          id: 'careful',
          label: 'WAIT AND STAY QUIET',
          risk: 'low',
          detectionDelta: 5,
          successChance: 0.94,
          narrative:
            "Patience pays off. Nothing draws eyes faster than urgency.",
          outcomeIfCaught:
            'Eventually, this still surfaces in an unrelated audit.',
        },
      ],
      defenseLine:
        'Continuous monitoring would have caught the original breach in hours, not the two weeks it actually took.',
    },
    cop: {
      setup: "If everything upstream failed, this is the last line of defense.",
      options: [
        {
          id: 'continuous',
          label: 'CONTINUOUS MONITORING + ALERTING',
          cost: 3,
          effectiveness: 0.93,
          narrative: 'Unusual activity surfaces in hours, not weeks.',
        },
        {
          id: 'periodic',
          label: 'QUARTERLY SECURITY AUDIT',
          cost: 1,
          effectiveness: 0.4,
          narrative: 'Cheaper, but a lot can happen between audits.',
        },
      ],
    },
  },
]

// ============================================================
// HELPERS
// ============================================================

export const NODE_IDS: NodeId[] = ['github', 'api', 'db', 'admin', 'exfil', 'world']

export function getStage(id: NodeId): Stage {
  return STAGES.find((s) => s.id === id)!
}

export function countBreached(nodeStatus: NodeStatusMap): number {
  return NODE_IDS.filter((id) => nodeStatus[id] === 'breached').length
}

export function countDefended(nodeStatus: NodeStatusMap): number {
  return NODE_IDS.filter((id) => nodeStatus[id] === 'defended').length
}

export function detectionCommentary(level: number): string {
  if (level < 30) return 'A clean, careful job — no alarms tripped.'
  if (level <= 60) return 'A few close calls along the way.'
  return "You got lucky — any one of these should have triggered a response."
}
