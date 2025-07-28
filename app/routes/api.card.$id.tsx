import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { put, list, del } from "@vercel/blob";

// 7일 이상 된 파일 삭제
async function cleanupOldCards() {
  try {
    const { blobs } = await list({ prefix: 'cards/' });
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7일 전
    
    for (const blob of blobs) {
      // 파일 생성일자 기준으로 삭제 (uploadedAt 사용)
      const fileCreatedAt = new Date(blob.uploadedAt).getTime();
      
      if (fileCreatedAt < sevenDaysAgo) {
        await del(blob.url);
        console.log(`삭제된 카드: ${blob.pathname} (생성일: ${blob.uploadedAt})`);
      }
    }
  } catch (error) {
    console.error('카드 정리 실패:', error);
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const cardId = params.id;
    const fileName = `cards/${cardId}.json`;

    // Vercel Blob에서 파일 목록 조회
    const { blobs } = await list({ prefix: fileName });
    
    if (blobs.length === 0) {
      return json({ error: "카드를 찾을 수 없습니다." }, { status: 404 });
    }

    // 첫 번째 매칭 파일의 URL로 데이터 가져오기
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    
    return json(data);
  } catch (error) {
    console.error("카드 로드 실패:", error);
    return json({ error: "카드를 찾을 수 없습니다." }, { status: 404 });
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const cardId = params.id;
    const data = await request.json();

    console.log("저장 시도:", cardId);
    console.log("BLOB_TOKEN 존재:", !!process.env.BLOB_READ_WRITE_TOKEN);

    // 정리는 이제 Cron Job이 담당

    const blob = await put(`cards/${cardId}.json`, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    console.log("저장 성공:", blob.url);
    return json({ success: true, url: blob.url });
  } catch (error) {
    console.error("저장 실패:", error);
    return json({ error: `카드 저장에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}` }, { status: 500 });
  }
}
