import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, Subject, finalize, lastValueFrom, takeUntil } from 'rxjs';
import { invoke } from '@tauri-apps/api/core';
import { TranslocoService } from '@jsverse/transloco';
import { languageOptions } from '@core/consts/languages';
import { Digimon } from '@core/interfaces/digimon.interface';
import { DialogueService } from '@services/dialogue.service';
import { DialoguePayload, DialogueLine, OllamaStreamChunk, TextDownloadProgressEvent } from '@core/interfaces/dialogue.interface';
import { StreamOut } from '@core/types/ai.type';
import { ConfigStateDataSource } from '@state/config-state.datasource';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly transloco = inject(TranslocoService);
  private readonly dialogueService = inject(DialogueService);
  private readonly configState = inject(ConfigStateDataSource);

  private readonly MODEL = 'gemma3n:e4b';
  private readonly KEEP_ALIVE = '30m';
  private readonly API_URL = 'http://127.0.0.1:11434/api/generate';

  private cancel$ = new Subject<void>();
  private wasCancelled = false;

  async generateDialogue(sceneContext: string, digimons: Digimon[]): Promise<DialoguePayload> {
    if (!this.configState.localAiEnabled()) return this.wrapError('Local AI is not enabled.');
    if (!this.isValidParticipants(digimons)) return this.wrapError('No digimons informed.');
    if (!(await this.ensureOllamaRunning())) return this.wrapError('Ollama is not available.');

    const language = this.resolveCurrentLanguage();
    const prompt = this.buildPrompt(sceneContext, digimons, language, 'json');

    try {
      this.resetCancelFlag();
      const response = await lastValueFrom(
        this.http
          .post(
            this.API_URL,
            { model: this.MODEL, prompt, stream: false, keep_alive: this.KEEP_ALIVE, format: 'json' },
            { responseType: 'text' as const }
          )
          .pipe(takeUntil(this.cancel$))
      );
      if (!this.isNonEmptyString(response)) throw new Error('Empty response from model.');
      return this.parseOllamaResponse(response, digimons);
    } catch (err) {
      if (this.wasCancelled) {
        console.warn('[AI] ⚠️ Request aborted by user.');
        return this.wrapError('Dialogue generation cancelled.');
      }
      console.error('[AI] ❌ Error generating dialogue:', err);
      return this.wrapError('Error generating dialogue via Ollama.');
    }
  }

  generateDialogueStream(sceneContext: string, digimons: Digimon[]): Observable<StreamOut> | null {

    if (!this.configState.localAiEnabled()) return null;

    const output$ = new Subject<StreamOut>();

    this.cancelActiveStream();
    this.resetCancelFlag();

    (async () => {
      if (!this.isValidParticipants(digimons)) {
        output$.error('No valid Digimons informed.');
        return;
      }
      if (!(await this.ensureOllamaRunning())) {
        output$.error('Ollama is not available.');
        return;
      }

      const language = this.resolveCurrentLanguage();
      const prompt = this.buildPrompt(sceneContext, digimons, language, 'jsonl');

      this.dialogueService.beginStreaming(digimons.map(d => d.id));

      const requestBody = { model: this.MODEL, prompt, stream: true, keep_alive: this.KEEP_ALIVE, context: [] };
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      let processedLength = 0;
      let ndjsonCarry = '';
      let textBuffer = '';
      const idToNameMap = this.buildIdToNameMap(digimons);

      const req = new HttpRequest('POST', this.API_URL, requestBody, {
        headers,
        reportProgress: true,
        responseType: 'text',
      });

      this.http
        .request<string>(req)
        .pipe(
          takeUntil(this.cancel$),
          finalize(() => {
            output$.complete();
          })
        )
        .subscribe({
          next: (event: HttpEvent<string>) => {
            switch (event.type) {
              case HttpEventType.Sent:
                return;

              case HttpEventType.ResponseHeader:
                return;

              case HttpEventType.DownloadProgress: {
                const completeDownloadText = (event as TextDownloadProgressEvent).partialText;
                if (!this.isNonEmptyString(completeDownloadText)) return;

                const newSegment = completeDownloadText.slice(processedLength);
                processedLength = completeDownloadText.length;
                if (!this.isNonEmptyString(newSegment)) return;

                const joined = ndjsonCarry + newSegment;
                const lines = joined.split('\n');
                ndjsonCarry = lines.pop() ?? '';

                for (const raw of lines) {
                  const trimmed = raw.trim();
                  if (!this.isNonEmptyString(trimmed)) continue;

                  const envelope = this.safeJsonParse<OllamaStreamChunk>(trimmed);
                  if (!envelope) {
                    textBuffer += trimmed;
                    textBuffer += '\n';
                    output$.next({ type: 'partial', data: trimmed });
                    continue;
                  }

                  if (this.isNonEmptyString(envelope.response)) {
                    textBuffer += envelope.response;
                    output$.next({ type: 'partial', data: envelope.response });
                    const { objects, remaining } = this.extractBalancedJsonObjects(textBuffer);
                    for (const obj of objects) this.tryEmitDialogueLine(obj, idToNameMap, output$);
                    textBuffer = remaining;
                  }

                  if (envelope.done === true) {
                    const { objects, remaining } = this.extractBalancedJsonObjects(textBuffer);
                    for (const obj of objects) this.tryEmitDialogueLine(obj, idToNameMap, output$);
                    textBuffer = remaining;
                  }
                }
                return;
              }

              case HttpEventType.Response: {
                const finalTail = ndjsonCarry.trim();
                if (!this.isNonEmptyString(finalTail)) return;

                  const envelope = this.safeJsonParse<OllamaStreamChunk>(finalTail);
                if (!envelope) {
                  textBuffer += finalTail;
                  const { objects, remaining } = this.extractBalancedJsonObjects(textBuffer);
                  for (const obj of objects) this.tryEmitDialogueLine(obj, idToNameMap, output$);
                  textBuffer = remaining;
                  ndjsonCarry = '';
                  return;
                }

                if (this.isNonEmptyString(envelope.response)) {
                    textBuffer += envelope.response;
                    const { objects, remaining } = this.extractBalancedJsonObjects(textBuffer);
                    for (const obj of objects) this.tryEmitDialogueLine(obj, idToNameMap, output$);
                    textBuffer = remaining;
                  }

                if (envelope.done === true) {
                  const { objects, remaining } = this.extractBalancedJsonObjects(textBuffer);
                  for (const obj of objects) this.tryEmitDialogueLine(obj, idToNameMap, output$);
                  textBuffer = remaining;
                  ndjsonCarry = '';
                  return;
                }

                ndjsonCarry = '';
                return;
              }
            }
          },
          error: () => {
            this.dialogueService.endStreaming();
            output$.error('Error during streaming dialogue generation.');
          },
        });
    })();

    return output$.asObservable();
  }

  cancelActiveStream(): void {
    this.wasCancelled = true;
    this.cancel$.next();
    this.cancel$.complete();
    this.cancel$ = new Subject<void>();
  }

  private resetCancelFlag(): void {
    this.wasCancelled = false;
  }

  private tryEmitDialogueLine(jsonText: string, idToNameMap: Map<string, string>, output$: Subject<StreamOut>): void {
    const parsed = this.safeJsonParse<Record<string, unknown>>(jsonText);
    if (!parsed) return;
    if (!(typeof parsed['id'] === 'string' && typeof parsed['text'] === 'string')) return;

    const id = parsed['id'] as string;
    const fallbackName = (parsed['digimon'] as string) ?? 'Unknown';
    const resolvedName = idToNameMap.get(id.toLowerCase()) ?? fallbackName;
    const finalLine: DialogueLine = { id, digimon: resolvedName, text: parsed['text'] as string };
    output$.next({ type: 'completeLine', data: finalLine });
  }

  private isValidParticipants(digimons: Digimon[]): boolean {
    return Array.isArray(digimons) && digimons.length > 0;
  }

  async ensureOllamaRunning(): Promise<boolean> {
    try {
      const isRunning = await invoke<boolean>('ensure_ollama');
      return isRunning;
    } catch {
      return false;
    }
  }

  private resolveCurrentLanguage(): string {
    const activeLang = this.transloco.getActiveLang()?.toLowerCase() || 'en';
    const option = languageOptions.find(o => o.value === activeLang);
    if (option?.label) return option.label;
    return 'English';
  }

  private buildPrompt(context: string, digimons: Digimon[], language: string, mode: 'json' | 'jsonl'): string {
    const shuffledDigimons = [...digimons].sort(() => Math.random() - 0.5);

    const attributeToneMap: Record<string, Record<'lowRank' | 'midRank' | 'highRank', string>> = {
      virus: {
        lowRank: 'Has hints of a darker or mischievous side, impulsive and unpredictable, but not evil.',
        midRank: 'Confident and intense, with a chaotic or rebellious streak, often blunt or cynical.',
        highRank: 'Calm but intimidating, wise and calculating, occasionally menacing yet composed.',
      },
      vaccine: {
        lowRank: 'Kind and optimistic, though naive and still discovering their strength.',
        midRank: 'Brave and determined, with a sense of justice tempered by doubt or emotion.',
        highRank: 'Speaks with calm confidence and leadership, inspiring allies through hope and courage.',
      },
      data: {
        lowRank: 'Curious and observant, analyzing things with innocence and curiosity.',
        midRank: 'Balanced and rational, acts as a mediator and voice of reason.',
        highRank: 'Wise and thoughtful, deeply analytical, expressing logic and empathy in equal measure.',
      },
    };

    const participants = shuffledDigimons
      .map((d) => {
        const attribute = d.attribute.toLowerCase();
        const rank = d.rank.toLowerCase();
        const hasNickname = typeof d.nickName === 'string' && d.nickName.trim().length > 0;

        const displayName = hasNickname ? `${d.nickName} (${d.name})` : d.name;
        const nameContext = hasNickname
          ? `Referred to by other Digimons as "${d.nickName}", but is actually a ${d.name}.`
          : `Referred to as "${d.name}".`;

        const isMidRank = ['champion', 'ultimate'].includes(rank);
        const isHighRank = rank === 'mega';

        const rankCategory: 'lowRank' | 'midRank' | 'highRank' = isHighRank ? 'highRank' : isMidRank ? 'midRank' : 'lowRank';
        const attributeTone =
          attributeToneMap[attribute]?.[rankCategory] ??
          'Speaks in a neutral tone appropriate to their nature.';

        const rankTone =
          isHighRank
            ? 'Speaks with authority, composure, and wisdom, as a being of great experience.'
            : isMidRank
              ? 'Speaks with energy and confidence — experienced, but still emotional and imperfect.'
              : 'Speaks with a curious, youthful tone — uncertain yet full of wonder.';

        const summary = [
          `- ${displayName} (ID: ${d.id})`,
          `Rank: ${d.rank}, Attribute: ${d.attribute}, Species: ${d.species}, Level: ${d.level}, HP: ${d.currentHp}/${d.maxHp}, MP: ${d.currentMp}/${d.maxMp}, ATK: ${d.atk}, DEF: ${d.def}, SPEEDS: ${d.speed}.`,
          nameContext,
          attributeTone,
          rankTone,
        ].join(' ');

        return summary;
      })
      .join('\n');

    const isSingle = digimons.length === 1;
    const style = isSingle
      ? 'If only one Digimon, produce 1–3 short monologue lines.'
      : 'If multiple Digimons, produce 3–7 short lines alternating speakers in natural tone and random order. The order of speakers should feel organic and unpredictable.';

    const commonHeader = `
You are a dialogue writer for a Digimon video game.

Language: ${language}
Participants (shuffled order):
${participants}

Rules:
- Keys: "id", "digimon", "text"
- ${style}
- When speaking, Digimons refer to each other by nickname if they have one.
- Adjust tone of each Digimon based on their rank, attribute, and personality.
- Alternate speakers naturally, but preserve logical conversational flow:
  - If a Digimon asks something, another relevant Digimon should answer before changing topics.
  - Avoid breaking immersion — each line should feel like a reply, reaction, or continuation.
  - Do not repeat the same turn order every time.
- Keep the dialogue short, emotional, and anime-like.
- Make short sentences, no long paragraphs (about 10 words or less).
- No narration, no markdown, no meta comments.
- Do not end conversations (dialogue) with questions for other digimons to answer.
- No grammatical errors.
`.trim();

    if (mode === 'json') {
      return `
${commonHeader}

Output:
Return ONLY a single valid JSON object:
{
  "dialogue": [
    { "id": "<digimon_id>", "digimon": "<digimon_name>", "text": "<dialogue_line>" }
  ]
}

Scene:
${context}
    `.trim();
    }

    return `
${commonHeader}

Output:
Stream as JSONL: one complete JSON object per line, no surrounding array:
{"id":"<digimon_id>","digimon":"<digimon_name>","text":"<line>"}
End naturally without summaries.

Scene:
${context}
  `.trim();
  }

  private parseOllamaResponse(rawResponse: string, digimons: Digimon[]): DialoguePayload {
    const parsedEnvelope = this.safeJsonParse<{ response?: string } & Record<string, unknown>>(rawResponse);
    const extractedBody = parsedEnvelope?.response ?? rawResponse;
    const jsonOnly = this.extractFirstJsonObjectFromText(extractedBody);
    if (!jsonOnly) throw new Error('Model returned empty text.');

    const parsedDialogue = this.safeJsonParse<DialoguePayload>(jsonOnly);
    if (!parsedDialogue) return this.wrapText(jsonOnly);

    this.mapRealIds(parsedDialogue, digimons);
    return parsedDialogue;
  }

  private mapRealIds(dialogue: DialoguePayload, digimons: Digimon[]): void {
    if (!dialogue?.dialogue?.length) return;
    if (!digimons?.length) return;
    const idToNameMap = this.buildIdToNameMap(digimons);
    for (const line of dialogue.dialogue) {
      const resolved = idToNameMap.get((line.id || '').toLowerCase());
      if (resolved) line.digimon = resolved;
    }
  }

  private wrapError(message: string): DialoguePayload {
    return { dialogue: [{ id: 'system', digimon: 'System', text: message }] };
  }

  private wrapText(text: string): DialoguePayload {
    return { dialogue: [{ id: 'system', digimon: 'System', text }] };
  }

  private safeJsonParse<T>(raw: string): T | null {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private buildIdToNameMap(digimons: Digimon[]): Map<string, string> {
    return new Map(digimons.map(d => [d.id.toLowerCase(), d.name]));
  }

  private extractFirstJsonObjectFromText(text: string): string {
    const sanitizedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIndex = sanitizedText.indexOf('{');
    const endIndex = sanitizedText.lastIndexOf('}');
    if (startIndex === -1) return '';
    if (endIndex === -1) return '';
    return sanitizedText.slice(startIndex, endIndex + 1).trim();
  }

  private extractBalancedJsonObjects(buffer: string): { objects: string[]; remaining: string } {
    const objects: string[] = [];
    let remainingStart = 0;
    let depth = 0;
    let inString = false;
    let escaping = false;
    let currentStart = -1;

    for (let i = 0; i < buffer.length; i++) {
      const character = buffer[i];

      if (escaping) {
        escaping = false;
        continue;
      }

      if (inString) {
        if (character === '\\') {
          escaping = true;
          continue;
        }
        if (character === '"') inString = false;
        continue;
      }

      if (character === '"') {
        inString = true;
        continue;
      }

      if (character === '{') {
        if (depth === 0) currentStart = i;
        depth += 1;
        continue;
      }

      if (character === '}') {
        if (depth > 0) depth -= 1;
        if (depth === 0 && currentStart >= 0) {
          objects.push(buffer.slice(currentStart, i + 1));
          remainingStart = i + 1;
          currentStart = -1;
        }
        continue;
      }
    }

    const remaining = buffer.slice(remainingStart);
    return { objects, remaining };
  }

  async checkOllamaInstalled(): Promise<boolean> {
    try {
      return await invoke<boolean>('ollama_is_installed');
    } catch {
      return false;
    }
  }

  getConfiguredLocalModelName(): string {
    return this.MODEL;
  }

  async isModelInstalled(name?: string): Promise<boolean> {
    const model = name || this.getConfiguredLocalModelName();
    try {
      return await invoke<boolean>('ollama_has_model', { name: model });
    } catch {
      return false;
    }
  }

}
