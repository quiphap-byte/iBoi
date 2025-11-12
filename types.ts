export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  author: MessageAuthor;
  text: string;
  urls?: { uri: string; title: string }[];
}

export interface ReadingSection {
    title: string;
    icon: 'astrology' | 'numerology' | 'tarot' | 'physiognomy' | 'chinese_zodiac';
    content: string;
}

export interface FortuneReading {
    introduction: string;
    sections: ReadingSection[];
    synthesis: string;
}

export type Language = 'vi' | 'en';
