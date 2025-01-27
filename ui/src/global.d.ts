/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
      SpeechRecognition: typeof SpeechRecognition;
      webkitSpeechRecognition: typeof SpeechRecognition;
    }
  
    const SpeechRecognition: {
      prototype: SpeechRecognition;
      new (): SpeechRecognition;
    };
  
    const webkitSpeechRecognition: {
      prototype: SpeechRecognition;
      new (): SpeechRecognition;
    };
  
    interface SpeechRecognitionEvent extends Event {
      readonly results: SpeechRecognitionResultList;
      readonly resultIndex: number;
    }
  
    interface SpeechRecognition extends EventTarget {
      abort(): void;
      start(): void;
      stop(): void;
      onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
      onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
      onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
      onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
      onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
      onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
      onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
      onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      maxAlternatives: number;
    }
  
    interface SpeechRecognitionErrorEvent extends Event {
      readonly error: string;
      readonly message: string;
    }
  }
  
  export {};
  