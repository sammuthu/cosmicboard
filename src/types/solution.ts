export type ThinkingSection = {
  title: string;
  bullets?: string[];
  body?: string;
};

export type ThinkingContent = {
  restatement: string;
  firstPrincipalThinking: string;
  inputsConstraints: string[];
  naiveBaseline: string;
  signalsPatterns: string[];
  dsChoice: string;
  planSteps: string[];
  edgeCases: string[];
  intuition: string[];
  complexity: { time: string; space: string; };
  pitfalls: string[];
};