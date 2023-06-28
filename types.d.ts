// Тип для варианта ответа
type Choice = {
  id: string;
  text: string;
  votes: number;
};

// Тип для опроса
type Poll = {
  id: number,
  question: string,
  choices: Choice[];
  created_at: Date;
  expires_at?: string;
}

// Тип для голоса
type Response = {
  id: string;
  poll_id: string;
  choice_id: string;
  voter_id: string;
  created_at: string;
};