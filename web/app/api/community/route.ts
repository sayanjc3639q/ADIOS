import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';

export async function GET() {
  const data = readData();
  return NextResponse.json({ discussions: data.discussions });
}

export async function POST(req: NextRequest) {
  try {
    const { author, authorEmail, topic, message } = await req.json();
    if (!author || !message || !topic) {
      return NextResponse.json({ error: 'Author, topic and message required.' }, { status: 400 });
    }

    const data = readData();
    const newPost = {
      id: data.discussions.length + 1,
      author,
      authorEmail: authorEmail || '',
      topic,
      message,
      likes: 0,
      createdAt: new Date().toLocaleString()
    };

    data.discussions.unshift(newPost);
    writeData(data);

    return NextResponse.json({ success: true, post: newPost });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
