import type { CamelotKey } from '../types/spotify'

export class CamelotWheel {
  private static readonly CAMELOT_MAP: Record<string, CamelotKey> = {
    '0-0': { key: 0, mode: 0, camelotCode: '5A', musicalKey: 'C minor' },
    '0-1': { key: 0, mode: 1, camelotCode: '8B', musicalKey: 'C major' },
    '1-0': { key: 1, mode: 0, camelotCode: '12A', musicalKey: 'C# minor' },
    '1-1': { key: 1, mode: 1, camelotCode: '3B', musicalKey: 'C# major' },
    '2-0': { key: 2, mode: 0, camelotCode: '7A', musicalKey: 'D minor' },
    '2-1': { key: 2, mode: 1, camelotCode: '10B', musicalKey: 'D major' },
    '3-0': { key: 3, mode: 0, camelotCode: '2A', musicalKey: 'D# minor' },
    '3-1': { key: 3, mode: 1, camelotCode: '5B', musicalKey: 'D# major' },
    '4-0': { key: 4, mode: 0, camelotCode: '9A', musicalKey: 'E minor' },
    '4-1': { key: 4, mode: 1, camelotCode: '12B', musicalKey: 'E major' },
    '5-0': { key: 5, mode: 0, camelotCode: '4A', musicalKey: 'F minor' },
    '5-1': { key: 5, mode: 1, camelotCode: '7B', musicalKey: 'F major' },
    '6-0': { key: 6, mode: 0, camelotCode: '11A', musicalKey: 'F# minor' },
    '6-1': { key: 6, mode: 1, camelotCode: '2B', musicalKey: 'F# major' },
    '7-0': { key: 7, mode: 0, camelotCode: '6A', musicalKey: 'G minor' },
    '7-1': { key: 7, mode: 1, camelotCode: '9B', musicalKey: 'G major' },
    '8-0': { key: 8, mode: 0, camelotCode: '1A', musicalKey: 'G# minor' },
    '8-1': { key: 8, mode: 1, camelotCode: '4B', musicalKey: 'G# major' },
    '9-0': { key: 9, mode: 0, camelotCode: '8A', musicalKey: 'A minor' },
    '9-1': { key: 9, mode: 1, camelotCode: '11B', musicalKey: 'A major' },
    '10-0': { key: 10, mode: 0, camelotCode: '3A', musicalKey: 'A# minor' },
    '10-1': { key: 10, mode: 1, camelotCode: '6B', musicalKey: 'A# major' },
    '11-0': { key: 11, mode: 0, camelotCode: '10A', musicalKey: 'B minor' },
    '11-1': { key: 11, mode: 1, camelotCode: '1B', musicalKey: 'B major' },
  }
  
  static getCamelotKey(key: number, mode: number): CamelotKey {
    const mapKey = `${key}-${mode}`
    return this.CAMELOT_MAP[mapKey] || {
      key, mode,
      camelotCode: 'Unknown',
      musicalKey: 'Unknown'
    }
  }
  
  static getCompatibleKeys(camelotCode: string): string[] {
    const compatible: string[] = []
    
    // Same key
    compatible.push(camelotCode)
    
    // Adjacent keys (+1, -1 on wheel)
    const number = parseInt(camelotCode)
    const letter = camelotCode.slice(-1)
    
    const nextNum = number === 12 ? 1 : number + 1
    const prevNum = number === 1 ? 12 : number - 1
    
    compatible.push(`${nextNum}${letter}`)
    compatible.push(`${prevNum}${letter}`)
    
    // Relative major/minor (switch A/B)
    const relativeKey = letter === 'A' ? `${number}B` : `${number}A`
    compatible.push(relativeKey)
    
    return compatible
  }
  
  static calculateHarmonicCompatibility(key1: CamelotKey, key2: CamelotKey): number {
    const compatible = this.getCompatibleKeys(key1.camelotCode)
    
    if (key1.camelotCode === key2.camelotCode) return 1.0
    if (compatible.includes(key2.camelotCode)) return 0.8
    
    // Calculate semitone distance for partial compatibility
    const semitoneDist = Math.abs(key1.key - key2.key)
    const minDist = Math.min(semitoneDist, 12 - semitoneDist)
    
    return Math.max(0, 1 - (minDist / 6))
  }
}