import { HttpDownloadProgressEvent } from "@angular/common/http";

export interface DialogueLine {
  id: string;
  digimon: string;
  text: string;
}

export interface DialoguePayload {
  dialogue: DialogueLine[];
}
export interface OllamaStreamChunk {
  response?: string;
  done?: boolean;
}

export interface TextDownloadProgressEvent extends HttpDownloadProgressEvent {
  partialText?: string;
}
