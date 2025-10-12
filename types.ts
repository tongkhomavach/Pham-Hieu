export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: WebSource;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  sources?: GroundingChunk[];
  imageUrl?: string;
}