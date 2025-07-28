import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { list, del } from "@vercel/blob";

// 매일 실행되는 정리 함수
export async function action({ request }: ActionFunctionArgs) {
  // Vercel Cron Job 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: 'cards/' });
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    for (const blob of blobs) {
      // 파일명에서 timestamp 추출 (cards/{timestamp}.json)
      const match = blob.pathname.match(/cards\/([^.]+)\.json/);
      if (match) {
        const timestampStr = match[1];
        const timestamp = parseInt(timestampStr, 36);
        
        if (timestamp < sevenDaysAgo) {
          await del(blob.url);
          deletedCount++;
          console.log(`삭제된 카드: ${blob.pathname}`);
        }
      }
    }

    return json({ 
      message: `정리 완료: ${deletedCount}개 파일 삭제됨`,
      deletedCount 
    });
  } catch (error) {
    console.error('정리 실패:', error);
    return json({ error: '정리 실패' }, { status: 500 });
  }
}