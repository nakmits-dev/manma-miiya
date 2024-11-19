import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  serverTimestamp, 
  where, 
  Timestamp, 
  increment,
  limit,
  startAfter,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Post, Comment } from '../types/post';

const POSTS_PER_PAGE = 20;
const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;

export async function createPost(userId: string, image: File, description: string) {
  const storageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
  await uploadBytes(storageRef, image);
  const imageUrl = await getDownloadURL(storageRef);

  const postRef = await addDoc(collection(db, 'posts'), {
    userId,
    imageUrl,
    description,
    createdAt: serverTimestamp(),
    realCount: 0,
    fakeCount: 0,
    comments: []
  });

  return postRef.id;
}

export async function getPost(postId: string): Promise<Post | null> {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) return null;
  
  const data = postSnap.data();
  const createdAt = data.createdAt?.toDate() || new Date();

  // 1年以上経過した投稿は削除
  if (Date.now() - createdAt.getTime() > ONE_YEAR_IN_MS) {
    await deleteDoc(postRef);
    return null;
  }

  return {
    id: postSnap.id,
    ...data,
    createdAt,
    comments: (data.comments || []).map((comment: any) => ({
      ...comment,
      createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate() : new Date(comment.createdAt)
    }))
  } as Post;
}

export async function getPosts(lastPost?: Post | null): Promise<{ posts: Post[], hasMore: boolean }> {
  let q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(POSTS_PER_PAGE + 1)
  );

  if (lastPost) {
    q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      startAfter(lastPost.createdAt),
      limit(POSTS_PER_PAGE + 1)
    );
  }

  const snapshot = await getDocs(q);
  const posts: Post[] = [];
  const now = Date.now();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate() || new Date();

    // 1年以上経過した投稿は削除
    if (now - createdAt.getTime() > ONE_YEAR_IN_MS) {
      await deleteDoc(doc.ref);
      continue;
    }

    posts.push({
      id: doc.id,
      ...data,
      createdAt,
      comments: (data.comments || []).map((comment: any) => ({
        ...comment,
        createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate() : new Date(comment.createdAt)
      }))
    } as Post);
  }

  // 追加の1件を取得して次のページがあるかを確認
  const hasMore = posts.length > POSTS_PER_PAGE;
  return {
    posts: posts.slice(0, POSTS_PER_PAGE),
    hasMore
  };
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const q = query(
    collection(db, 'posts'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const posts: Post[] = [];
  const now = Date.now();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate() || new Date();

    // 1年以上経過した投稿は削除
    if (now - createdAt.getTime() > ONE_YEAR_IN_MS) {
      await deleteDoc(doc.ref);
      continue;
    }

    posts.push({
      id: doc.id,
      ...data,
      createdAt,
      comments: (data.comments || []).map((comment: any) => ({
        ...comment,
        createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate() : new Date(comment.createdAt)
      }))
    } as Post);
  }

  return posts;
}

export async function updatePostReaction(postId: string, type: 'real' | 'fake') {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) return;
  
  const data = postSnap.data();
  const field = type === 'real' ? 'realCount' : 'fakeCount';
  const currentCount = data[field] || 0;
  
  // 999を超える場合は更新しない
  if (currentCount >= 999) return;
  
  await updateDoc(postRef, {
    [field]: increment(1)
  });
}

export async function addComment(postId: string, userId: string, text: string) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) return;
  
  const newComment: Comment = {
    id: Date.now().toString(),
    userId,
    text,
    createdAt: new Date()
  };
  
  const currentComments = postSnap.data().comments || [];
  await updateDoc(postRef, {
    comments: [...currentComments, newComment]
  });
  
  return newComment;
}