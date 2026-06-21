import { CodeXml, Plug, Database, KeyRound, Upload, Globe } from 'lucide-react'
import type { ZoneId } from './maze-data'

export const ZONE_ICONS: Record<ZoneId, typeof CodeXml> = {
  github: CodeXml,
  api: Plug,
  db: Database,
  admin: KeyRound,
  exfil: Upload,
  world: Globe,
}
