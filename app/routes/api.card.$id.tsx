import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { writeFile, readFile, mkdir, readdir, unlink, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const CARDS_DIR = path.join(process.cwd(), "tmp", "cards");

// 디렉토리 생성
async function ensureCardsDir() {
  if (!existsSync(CARDS_DIR)) {
    await mkdir(CARDS_DIR, { recursive: true });
  }
}

// 7일 이상 된 파일 삭제
async function cleanupOldFiles() {
  try {
    const files = await readdir(CARDS_DIR);
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000); // 7일
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(CARDS_DIR, file);
        const stats = await stat(filePath);
        
        if (stats.mtime.getTime() < sevenDaysAgo) {
          await unlink(filePath);
          console.log(`삭제된 파일: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('파일 정리 실패:', error);
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    await ensureCardsDir();
    cleanupOldFiles(); // 매번 정리
    
    const cardId = params.id;
    const filePath = path.join(CARDS_DIR, `${cardId}.json`);
    
    const data = await readFile(filePath, 'utf-8');
    return json(JSON.parse(data));
  } catch (error) {
    return json({ error: "카드를 찾을 수 없습니다." }, { status: 404 });
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    await ensureCardsDir();
    cleanupOldFiles(); // 매번 정리
    
    const cardId = params.id;
    const data = await request.json();
    const filePath = path.join(CARDS_DIR, `${cardId}.json`);
    
    await writeFile(filePath, JSON.stringify(data));
    return json({ success: true });
  } catch (error) {
    return json({ error: "카드 저장에 실패했습니다." }, { status: 500 });
  }
}