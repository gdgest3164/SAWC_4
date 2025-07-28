import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { put, head } from "@vercel/blob";

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const cardId = params.id;
    const blobUrl = `cards/${cardId}.json`;
    
    const response = await fetch(`https://blob.vercel-storage.com/${blobUrl}?token=${process.env.BLOB_READ_WRITE_TOKEN}`);
    
    if (!response.ok) {
      return json({ error: "카드를 찾을 수 없습니다." }, { status: 404 });
    }
    
    const data = await response.json();
    return json(data);
  } catch (error) {
    return json({ error: "카드를 찾을 수 없습니다." }, { status: 404 });
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const cardId = params.id;
    const data = await request.json();
    
    const blob = await put(`cards/${cardId}.json`, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
    });
    
    return json({ success: true, url: blob.url });
  } catch (error) {
    return json({ error: "카드 저장에 실패했습니다." }, { status: 500 });
  }
}