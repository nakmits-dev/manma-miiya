export interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  description: string;
  createdAt: Date;
  realCount: number;
  fakeCount: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
}