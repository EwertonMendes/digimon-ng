import { Injectable, inject } from '@angular/core';
import { fetch } from '@tauri-apps/plugin-http';
import { invoke } from '@tauri-apps/api/core';
import { TranslocoService } from '@jsverse/transloco';
import { languageOptions } from '@core/consts/languages';

export interface DigimonInfo {
  id: string;
  name: string;
}

export interface DialogueLine {
  id: string;
  digimon: string;
  text: string;
}

export interface DialoguePayload {
  dialogue: DialogueLine[];
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly transloco = inject(TranslocoService);
  private readonly MODEL = 'gemma3n:e4b';
  private readonly KEEP_ALIVE = '30m';
  private readonly API_URL = 'http://127.0.0.1:11434/api/generate';

  async generateDialogue(sceneContext: string, digimons: DigimonInfo[]): Promise<DialoguePayload> {
    console.log('[AI] 🚀 Iniciando geração de diálogo...', { sceneContext, digimons });

    if (!this.isValidParticipants(digimons)) {
      return this.wrapError('Nenhum Digimon válido informado.');
    }

    if (!(await this.ensureOllamaRunning())) {
      return this.wrapError('Ollama não está disponível.');
    }

    const language = this.resolveCurrentLanguage();
    const prompt = this.buildPrompt(sceneContext, digimons, language);

    try {
      const response = await this.callOllama(prompt);
      const dialogue = this.parseOllamaResponse(response, digimons);
      console.log('[AI] ✅ Diálogo final estruturado:', dialogue);
      return dialogue;
    } catch (error) {
      console.error('[AI] ❌ Erro ao gerar diálogo:', error);
      return this.wrapError('Falha ao gerar diálogo via Ollama.');
    }
  }

  private isValidParticipants(digimons: DigimonInfo[]): boolean {
    return Array.isArray(digimons) && digimons.length > 0;
  }

  private async ensureOllamaRunning(): Promise<boolean> {
    try {
      const result = await invoke<boolean>('ensure_ollama');
      console.log('[AI] 🧠 Ollama ativo:', result);
      return result;
    } catch (error) {
      console.error('[AI] ⚠️ Falha ao verificar Ollama:', error);
      return false;
    }
  }

  private resolveCurrentLanguage(): string {
    const activeLang = this.transloco.getActiveLang()?.toLowerCase() || 'en';
    const langOption = languageOptions.find(o => o.value === activeLang);
    return langOption?.label ?? 'English';
  }

  private buildPrompt(context: string, digimons: DigimonInfo[], language: string): string {
    const participants = digimons
      .map(d => `- ${d.name} (ID: ${d.id})`)
      .join('\n');

    const hasSingleParticipant = digimons.length === 1;
    const dialogueStyle = hasSingleParticipant
      ? 'There is only one Digimon. Write a short monologue (1–3 lines) reflecting its own thoughts or emotions.'
      : 'There are multiple Digimons. Write a natural and emotional dialogue between them (3–7 lines), alternating speakers with personality and emotion.';

    const prompt = `
You are a professional dialogue writer for a Digimon video game.
Your task is to create a natural, emotional, and immersive conversation between digital creatures.

Output must be ONLY a valid JSON object following this structure:

{
  "dialogue": [
    { "id": "<digimon_id>", "digimon": "<digimon_name>", "text": "<dialogue_line>" }
  ]
}

Participants (use IDs to differentiate Digimons with the same name):
${participants}

Language: ${language}

Rules:
- Begin directly with '{'
- Use "id", "digimon", and "text" keys
- ${dialogueStyle}
- Keep lines concise and expressive (anime-style tone)
- Do NOT include narration, markdown, or explanations
- Ensure each line matches the correct Digimon ID
- If unable to format as JSON, return short plain text lines only

Scene context:
${context}
    `.trim();

    console.log('[AI] 🧩 Prompt gerado:', prompt);
    return prompt;
  }

  private async callOllama(prompt: string): Promise<string> {
    console.log('[AI] 🌐 Enviando prompt ao Ollama...');
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.MODEL,
        prompt,
        stream: false,
        keep_alive: this.KEEP_ALIVE,
      }),
    });

    console.log('[AI] 🌍 HTTP status:', response.status, response.ok ? '✅ OK' : '❌ FAIL');

    const rawText = (await (response as any).text?.()) ?? '';
    console.log('[AI] 🧾 Resposta bruta recebida:', rawText);

    if (!rawText.trim()) throw new Error('Resposta vazia do modelo.');

    return rawText;
  }

  private parseOllamaResponse(rawResponse: string, digimons: DigimonInfo[]): DialoguePayload {
    let extractedText = '';

    try {
      const parsed = JSON.parse(rawResponse);
      extractedText = parsed.response ?? JSON.stringify(parsed);
    } catch {
      extractedText = rawResponse;
    }

    const cleanedText = this.cleanJsonText(extractedText);
    if (!cleanedText) throw new Error('Modelo retornou texto vazio.');

    try {
      const parsedDialogue = JSON.parse(cleanedText) as DialoguePayload;
      this.mapRealIds(parsedDialogue, digimons);
      return parsedDialogue;
    } catch {
      console.warn('[AI] ⚠️ Falha ao parsear JSON. Retornando texto puro.');
      return this.wrapText(cleanedText);
    }
  }

  private cleanJsonText(text: string): string {
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    return start !== -1 && end !== -1 ? cleaned.slice(start, end + 1).trim() : cleaned;
  }

  private mapRealIds(dialogue: DialoguePayload, digimons: DigimonInfo[]): void {
    const digimonMap = new Map(digimons.map(d => [d.id.toLowerCase(), d]));
    for (const line of dialogue.dialogue) {
      const match = digimonMap.get(line.id.toLowerCase());
      if (match) {
        line.digimon = match.name;
        line.id = match.id;
      }
    }
  }

  private wrapError(message: string): DialoguePayload {
    return { dialogue: [{ id: 'system', digimon: 'System', text: message }] };
  }

  private wrapText(text: string): DialoguePayload {
    return { dialogue: [{ id: 'system', digimon: 'System', text }] };
  }
}
