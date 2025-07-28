export interface FingerLetter {
  char: string;
  type: 'consonant' | 'vowel';
  imagePath: string;
  displayOrder: number;
}

export const consonants: FingerLetter[] = [
  { char: 'ㄱ', type: 'consonant', imagePath: '/consonants/ㄱ.png', displayOrder: 1 },
  { char: 'ㄴ', type: 'consonant', imagePath: '/consonants/ㄴ.png', displayOrder: 2 },
  { char: 'ㄷ', type: 'consonant', imagePath: '/consonants/ㄷ.png', displayOrder: 3 },
  { char: 'ㄹ', type: 'consonant', imagePath: '/consonants/ㄹ.png', displayOrder: 4 },
  { char: 'ㅁ', type: 'consonant', imagePath: '/consonants/ㅁ.png', displayOrder: 5 },
  { char: 'ㅂ', type: 'consonant', imagePath: '/consonants/ㅂ.png', displayOrder: 6 },
  { char: 'ㅅ', type: 'consonant', imagePath: '/consonants/ㅅ.png', displayOrder: 7 },
  { char: 'ㅇ', type: 'consonant', imagePath: '/consonants/ㅇ.png', displayOrder: 8 },
  { char: 'ㅈ', type: 'consonant', imagePath: '/consonants/ㅈ.png', displayOrder: 9 },
  { char: 'ㅊ', type: 'consonant', imagePath: '/consonants/ㅊ.png', displayOrder: 10 },
  { char: 'ㅋ', type: 'consonant', imagePath: '/consonants/ㅋ.png', displayOrder: 11 },
  { char: 'ㅌ', type: 'consonant', imagePath: '/consonants/ㅌ.png', displayOrder: 12 },
  { char: 'ㅍ', type: 'consonant', imagePath: '/consonants/ㅍ.png', displayOrder: 13 },
  { char: 'ㅎ', type: 'consonant', imagePath: '/consonants/ㅎ.png', displayOrder: 14 },
  { char: 'ㄲ', type: 'consonant', imagePath: '/consonants/ㄲ.png', displayOrder: 15 },
  { char: 'ㄸ', type: 'consonant', imagePath: '/consonants/ㄸ.png', displayOrder: 16 },
  { char: 'ㅃ', type: 'consonant', imagePath: '/consonants/ㅃ.png', displayOrder: 17 },
  { char: 'ㅆ', type: 'consonant', imagePath: '/consonants/ㅆ.png', displayOrder: 18 },
  { char: 'ㅉ', type: 'consonant', imagePath: '/consonants/ㅉ.png', displayOrder: 19 },
];

export const vowels: FingerLetter[] = [
  { char: 'ㅏ', type: 'vowel', imagePath: '/vowels/ㅏ.png', displayOrder: 1 },
  { char: 'ㅑ', type: 'vowel', imagePath: '/vowels/ㅑ.png', displayOrder: 2 },
  { char: 'ㅓ', type: 'vowel', imagePath: '/vowels/ㅓ.png', displayOrder: 3 },
  { char: 'ㅕ', type: 'vowel', imagePath: '/vowels/ㅕ.png', displayOrder: 4 },
  { char: 'ㅗ', type: 'vowel', imagePath: '/vowels/ㅗ.png', displayOrder: 5 },
  { char: 'ㅛ', type: 'vowel', imagePath: '/vowels/ㅛ.png', displayOrder: 6 },
  { char: 'ㅜ', type: 'vowel', imagePath: '/vowels/ㅜ.png', displayOrder: 7 },
  { char: 'ㅠ', type: 'vowel', imagePath: '/vowels/ㅠ.png', displayOrder: 8 },
  { char: 'ㅡ', type: 'vowel', imagePath: '/vowels/ㅡ.png', displayOrder: 9 },
  { char: 'ㅣ', type: 'vowel', imagePath: '/vowels/ㅣ.png', displayOrder: 10 },
  { char: 'ㅐ', type: 'vowel', imagePath: '/vowels/ㅐ.png', displayOrder: 11 },
  { char: 'ㅒ', type: 'vowel', imagePath: '/vowels/ㅒ.png', displayOrder: 12 },
  { char: 'ㅔ', type: 'vowel', imagePath: '/vowels/ㅔ.png', displayOrder: 13 },
  { char: 'ㅖ', type: 'vowel', imagePath: '/vowels/ㅖ.png', displayOrder: 14 },
  { char: 'ㅘ', type: 'vowel', imagePath: '/vowels/ㅘ.png', displayOrder: 15 },
  { char: 'ㅙ', type: 'vowel', imagePath: '/vowels/ㅙ.png', displayOrder: 16 },
  { char: 'ㅚ', type: 'vowel', imagePath: '/vowels/ㅚ.png', displayOrder: 17 },
  { char: 'ㅝ', type: 'vowel', imagePath: '/vowels/ㅝ.png', displayOrder: 18 },
  { char: 'ㅞ', type: 'vowel', imagePath: '/vowels/ㅞ.png', displayOrder: 19 },
  { char: 'ㅟ', type: 'vowel', imagePath: '/vowels/ㅟ.png', displayOrder: 20 },
  { char: 'ㅢ', type: 'vowel', imagePath: '/vowels/ㅢ.png', displayOrder: 21 },
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

// 자모음 배열을 한글로 조합
export function combineJamos(letters: FingerLetter[]): string {
  let result = '';
  let i = 0;
  
  const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const medials = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const finals = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  
  while (i < letters.length) {
    const current = letters[i];
    
    // 초성인지 확인
    const initialIndex = initials.indexOf(current.char);
    
    if (initialIndex !== -1 && i + 1 < letters.length) {
      const next = letters[i + 1];
      const vowelIndex = medials.indexOf(next.char);
      
      if (vowelIndex !== -1) {
        let finalIndex = 0;
        let consumed = 2; // 초성 + 중성
        
        // 종성 확인
        if (i + 2 < letters.length) {
          const third = letters[i + 2];
          const thirdAsFinal = finals.indexOf(third.char);
          
          // 세번째 글자가 종성이 될 수 있는지 확인
          if (thirdAsFinal > 0) { // 0은 종성 없음이므로 > 0으로 체크
            // 네번째 글자 확인
            if (i + 3 < letters.length) {
              const fourth = letters[i + 3];
              const fourthAsVowel = medials.indexOf(fourth.char);
              
              // 네번째가 모음이면, 세번째는 다음 글자의 초성
              if (fourthAsVowel !== -1) {
                // 세번째는 다음 글자의 초성으로 사용
                finalIndex = 0;
                consumed = 2;
              } else {
                // 세번째는 현재 글자의 종성
                finalIndex = thirdAsFinal;
                consumed = 3;
              }
            } else {
              // 마지막이면 종성으로 사용
              finalIndex = thirdAsFinal;
              consumed = 3;
            }
          }
        }
        
        // 한글 조합
        const unicode = 0xAC00 + (initialIndex * 21 * 28) + (vowelIndex * 28) + finalIndex;
        result += String.fromCharCode(unicode);
        i += consumed;
      } else {
        // 모음이 없으면 그대로 추가
        result += current.char;
        i++;
      }
    } else {
      // 초성이 아니거나 마지막 글자면 그대로 추가
      result += current.char;
      i++;
    }
  }
  
  return result;
}

// 자모음 배열을 글자별로 그룹핑
export function groupJamosByCharacter(letters: FingerLetter[]): FingerLetter[][] {
  const groups: FingerLetter[][] = [];
  let i = 0;
  
  const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const medials = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const finals = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  
  while (i < letters.length) {
    const current = letters[i];
    const group: FingerLetter[] = [];
    
    // 초성인지 확인
    const initialIndex = initials.indexOf(current.char);
    
    if (initialIndex !== -1 && i + 1 < letters.length) {
      const next = letters[i + 1];
      const vowelIndex = medials.indexOf(next.char);
      
      if (vowelIndex !== -1) {
        // 초성 + 중성
        group.push(current, next);
        let consumed = 2;
        
        // 종성 확인
        if (i + 2 < letters.length) {
          const third = letters[i + 2];
          const thirdAsFinal = finals.indexOf(third.char);
          
          if (thirdAsFinal > 0) {
            if (i + 3 < letters.length) {
              const fourth = letters[i + 3];
              const fourthAsVowel = medials.indexOf(fourth.char);
              
              if (fourthAsVowel === -1) {
                // 세번째는 현재 글자의 종성
                group.push(third);
                consumed = 3;
              }
            } else {
              // 마지막이면 종성으로 사용
              group.push(third);
              consumed = 3;
            }
          }
        }
        
        groups.push(group);
        i += consumed;
      } else {
        // 모음이 없으면 단독으로
        groups.push([current]);
        i++;
      }
    } else {
      // 초성이 아니거나 마지막 글자면 단독으로
      groups.push([current]);
      i++;
    }
  }
  
  return groups;
}