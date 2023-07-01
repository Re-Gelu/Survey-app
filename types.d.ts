// Тип для варианта ответа
type Choice = {
  id?: string;
  text: string;
  votes: Vote[];
};

// Тип для опроса
type Poll = {
  id?: string;
  question: string;
  choices: Choice[];
  is_multiple_answer_options: boolean;
  creator_ip?: string | CookieValueTypes;
  created_at?: string | Date;
  expires_at?: string | Date;
};

// Тип для голоса
type Vote = {
  id?: string;
  voter_ip: string | CookieValueTypes;
  created_at: string | Date;
};

// Type of Fauna DB response
type FaunaPollResponse = {
  ref: { id: string };
  data: Poll | Poll[];
  ts: number;
};

// Type of Fauna DB query response
type FaunaPollsQueryResponse = {
  data: FaunaPollResponse[]
};

type PageDataWithIp = {
  ip: CookieValueTypes;
};