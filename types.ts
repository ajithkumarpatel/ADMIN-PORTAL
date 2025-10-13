import { Timestamp } from 'firebase/firestore';

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: Timestamp;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Timestamp;
}