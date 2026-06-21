import type { ZoneId } from './maze-data'

export interface NodeLearningContent {
  name: string
  exploit: string
  defense: string
  doDont: string
}

export const NODE_CONTENT: Record<ZoneId, NodeLearningContent> = {
  github: {
    name: 'The Leaked Key',
    exploit:
      'A live API key gets committed to a public repo and is never rotated, so anyone scanning public code can find and use it.',
    defense:
      'Automated secret scanning catches exposed keys in commits instantly and can revoke them before they’re ever used.',
    doDont: 'Don’t hardcode secrets in code — do use a secrets manager and scan every commit.',
  },
  api: {
    name: 'The Open Door',
    exploit:
      'A stolen key logs straight into an internal API with no second factor required, so possession of the key alone is enough to get in.',
    defense:
      'Short-lived, automatically rotating credentials mean a leaked key stops working long before most attackers can use it.',
    doDont:
      'Don’t issue long-lived static keys — do rotate credentials frequently and require a second factor for sensitive access.',
  },
  db: {
    name: 'Too Much Access',
    exploit:
      'The stolen key turns out to have far more reach than the service ever needed, giving direct access to the customer database.',
    defense: 'Least-privilege access scoping means each key only reaches exactly what it needs, nothing more.',
    doDont: 'Don’t grant broad default access — do scope every credential to the minimum it actually requires.',
  },
  admin: {
    name: 'The Loose Permission',
    exploit:
      'A single overly broad permission lets the attacker escalate from limited access straight to full admin control.',
    defense: 'Regular permission audits catch and flag unusual privilege changes before they’re exploited.',
    doDont: 'Don’t let permissions accumulate unchecked — do audit access levels on a regular schedule.',
  },
  exfil: {
    name: 'The Quiet Exit',
    exploit:
      'Data leaves in small batches over several days, deliberately staying under the radar of obvious traffic spikes.',
    defense: 'Anomaly detection on export volume and patterns catches this even when it’s spread out over time.',
    doDont:
      'Don’t rely only on spotting large, obvious spikes — do monitor for unusual patterns over time, not just single events.',
  },
  world: {
    name: 'The Late Discovery',
    exploit:
      'The breach surfaces weeks later during an unrelated routine audit, by which point the damage is already done.',
    defense: 'Continuous, real-time monitoring would have caught this in hours instead of weeks.',
    doDont: 'Don’t depend on periodic audits alone — do invest in continuous monitoring and alerting.',
  },
}
