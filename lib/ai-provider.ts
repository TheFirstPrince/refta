export type AiKind = 'passport_specs' | 'tz_requirements' | 'application_draft';

export interface AiProvider {
  name: string;
  model: string;
  extract(input: { text: string; kind: AiKind }): Promise<{ payload: any; confidence: any }>;
}

export class MockAiProvider implements AiProvider {
  name = 'mock';
  model = 'mock-v1';

  async extract(input: { text: string; kind: AiKind }) {
    return {
      payload: {
        kind: input.kind,
        fields: [
          { key: 'power', value: '220V', source: 'document:text', needsConfirmation: false },
          { key: 'model', value: 'X32', source: 'document:text', needsConfirmation: true }
        ]
      },
      confidence: { power: 0.93, model: 0.58 }
    };
  }
}

export const aiProvider = new MockAiProvider();
