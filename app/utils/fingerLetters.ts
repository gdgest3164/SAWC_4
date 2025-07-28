export interface FingerLetter {
  char: string;
  type: 'consonant' | 'vowel';
  imagePath: string;
  displayOrder: number;
}

export const consonants: FingerLetter[] = [
  { char: 'ㄱ', type: 'consonant', imagePath: '/자음/ㄱ.png', displayOrder: 1 },
  { char: 'ㄴ', type: 'consonant', imagePath: '/자음/ㄴ.png', displayOrder: 2 },
  { char: 'ㄷ', type: 'consonant', imagePath: '/자음/ㄷ.png', displayOrder: 3 },
  { char: 'ㄹ', type: 'consonant', imagePath: '/자음/ㄹ.png', displayOrder: 4 },
  { char: 'ㅁ', type: 'consonant', imagePath: '/자음/ㅁ.png', displayOrder: 5 },
  { char: 'ㅂ', type: 'consonant', imagePath: '/자음/ㅂ.png', displayOrder: 6 },
  { char: 'ㅅ', type: 'consonant', imagePath: '/자음/ㅅ.png', displayOrder: 7 },
  { char: 'ㅇ', type: 'consonant', imagePath: '/자음/ㅇ.png', displayOrder: 8 },
  { char: 'ㅈ', type: 'consonant', imagePath: '/자음/ㅈ.png', displayOrder: 9 },
  { char: 'ㅊ', type: 'consonant', imagePath: '/자음/ㅊ.png', displayOrder: 10 },
  { char: 'ㅋ', type: 'consonant', imagePath: '/자음/ㅋ.png', displayOrder: 11 },
  { char: 'ㅌ', type: 'consonant', imagePath: '/자음/ㅌ.png', displayOrder: 12 },
  { char: 'ㅍ', type: 'consonant', imagePath: '/자음/ㅍ.png', displayOrder: 13 },
  { char: 'ㅎ', type: 'consonant', imagePath: '/자음/ㅎ.png', displayOrder: 14 },
  { char: 'ㄲ', type: 'consonant', imagePath: '/자음/ㄲ.png', displayOrder: 15 },
  { char: 'ㄸ', type: 'consonant', imagePath: '/자음/ㄸ.png', displayOrder: 16 },
  { char: 'ㅃ', type: 'consonant', imagePath: '/자음/ㅃ.png', displayOrder: 17 },
  { char: 'ㅆ', type: 'consonant', imagePath: '/자음/ㅆ.png', displayOrder: 18 },
  { char: 'ㅉ', type: 'consonant', imagePath: '/자음/ㅉ.png', displayOrder: 19 },
];

export const vowels: FingerLetter[] = [
  { char: 'ㅏ', type: 'vowel', imagePath: '/모음/ㅏ.png', displayOrder: 1 },
  { char: 'ㅑ', type: 'vowel', imagePath: '/모음/ㅑ.png', displayOrder: 2 },
  { char: 'ㅓ', type: 'vowel', imagePath: '/모음/ㅓ.png', displayOrder: 3 },
  { char: 'ㅕ', type: 'vowel', imagePath: '/모음/ㅕ.png', displayOrder: 4 },
  { char: 'ㅗ', type: 'vowel', imagePath: '/모음/ㅗ.png', displayOrder: 5 },
  { char: 'ㅛ', type: 'vowel', imagePath: '/모음/ㅛ.png', displayOrder: 6 },
  { char: 'ㅜ', type: 'vowel', imagePath: '/모음/ㅜ.png', displayOrder: 7 },
  { char: 'ㅠ', type: 'vowel', imagePath: '/모음/ㅠ.png', displayOrder: 8 },
  { char: 'ㅡ', type: 'vowel', imagePath: '/모음/ㅡ.png', displayOrder: 9 },
  { char: 'ㅣ', type: 'vowel', imagePath: '/모음/ㅣ.png', displayOrder: 10 },
  { char: 'ㅐ', type: 'vowel', imagePath: '/모음/ㅐ.png', displayOrder: 11 },
  { char: 'ㅒ', type: 'vowel', imagePath: '/모음/ㅒ.png', displayOrder: 12 },
  { char: 'ㅔ', type: 'vowel', imagePath: '/모음/ㅔ.png', displayOrder: 13 },
  { char: 'ㅖ', type: 'vowel', imagePath: '/모음/ㅖ.png', displayOrder: 14 },
  { char: 'ㅘ', type: 'vowel', imagePath: '/모음/ㅘ.png', displayOrder: 15 },
  { char: 'ㅙ', type: 'vowel', imagePath: '/모음/ㅙ.png', displayOrder: 16 },
  { char: 'ㅚ', type: 'vowel', imagePath: '/모음/ㅚ.png', displayOrder: 17 },
  { char: 'ㅝ', type: 'vowel', imagePath: '/모음/ㅝ.png', displayOrder: 18 },
  { char: 'ㅞ', type: 'vowel', imagePath: '/모음/ㅞ.png', displayOrder: 19 },
  { char: 'ㅟ', type: 'vowel', imagePath: '/모음/ㅟ.png', displayOrder: 20 },
  { char: 'ㅢ', type: 'vowel', imagePath: '/모음/ㅢ.png', displayOrder: 21 },
];

export const allFingerLetters = [...consonants, ...vowels];

// 한글 분해 함수
export function decomposeHangul(text: string): string[] {
  const result: string[] = [];
  
  for (const char of text) {
    const code = char.charCodeAt(0);
    
    // 한글 완성형 체크 (가 ~ 힣)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const baseCode = code - 0xAC00;
      
      // 초성, 중성, 종성 분리
      const finalConsonantIndex = baseCode % 28;
      const vowelIndex = ((baseCode - finalConsonantIndex) / 28) % 21;
      const initialConsonantIndex = (((baseCode - finalConsonantIndex) / 28) - vowelIndex) / 21;
      
      const initialConsonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
      const vowels = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
      const finalConsonants = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
      
      result.push(initialConsonants[initialConsonantIndex]);
      result.push(vowels[vowelIndex]);
      
      if (finalConsonantIndex > 0) {
        result.push(finalConsonants[finalConsonantIndex]);
      }
    } else {
      // 한글이 아닌 경우 그대로 추가
      result.push(char);
    }
  }
  
  return result;
}

// 자모음 배열을 지화 이미지 경로 배열로 변환
export function getFingerLetterPaths(jamos: string[]): (string | null)[] {
  return jamos.map(jamo => {
    const fingerLetter = allFingerLetters.find(fl => fl.char === jamo);
    return fingerLetter ? fingerLetter.imagePath : null;
  });
}

// 이름을 지화 데이터로 변환
export function nameToFingerLetters(name: string): FingerLetter[] {
  const jamos = decomposeHangul(name);
  return jamos
    .map(jamo => allFingerLetters.find(fl => fl.char === jamo))
    .filter((fl): fl is FingerLetter => fl !== undefined);
}