declare module '@juspay/neurolink' {
  export interface NeurolinkConfig {
    enableAnalytics?: boolean;
    enableEvaluation?: boolean;
  }

  export interface GenerateInput {
    text: string;
  }

  export interface GenerateOptions {
    input: GenerateInput;
    provider: string;
    model: string;
  }

  export interface GenerateResult {
    text?: string;
    content?: string;
    response?: string;
  }

  export class NeuroLink {
    constructor(config?: NeurolinkConfig);
    generate(options: GenerateOptions): Promise<GenerateResult>;
  }
}
