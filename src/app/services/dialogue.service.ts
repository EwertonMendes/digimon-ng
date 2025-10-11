import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { DialogueLine, DialoguePayload } from './ai.service'

@Injectable({ providedIn: 'root' })
export class DialogueService {
  private readonly _currentLine = new BehaviorSubject<DialogueLine | null>(null)
  readonly currentLine$ = this._currentLine.asObservable()

  async playDialogue(dialogue: DialoguePayload) {
    if (!dialogue?.dialogue?.length) return
    for (const line of dialogue.dialogue) {
      this._currentLine.next(line)
      await new Promise((r) => setTimeout(r, 4000))
    }
    this._currentLine.next(null)
  }
}
