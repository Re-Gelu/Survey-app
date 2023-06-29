// Тип для варианта ответа
type Choice = {
  id?: string;
  text: string;
  votes: number;
};

// Тип для опроса
type Poll = {
  id?: string;
  question: string;
  choices: Choice[];
  is_multiple_answer_options: boolean;
  created_at: Date;
  expires_at?: string;
};

// Тип для голоса
type Response = {
  id?: string;
  poll_id: string;
  choice_id: string;
  voter_ip: string;
  created_at: string;
};

// Type of Fauna DB response
type FaunaResponse = {
  ref: { id: string };
  data: Poll[] | Poll;
  ts: number;
};

// Type of Fauna DB query response
type FaunaQueryResponse = {
  data: FaunaResponse[]
};