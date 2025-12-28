declare module 'diff-match-patch' {
  export type Diff = [number, string]

  export class DiffMatchPatch {
    diff_main(text1: string, text2: string): Diff[]
    diff_cleanupSemantic(diffs: Diff[]): void
    diff_prettyHtml(diffs: Diff[]): string
  }
}

