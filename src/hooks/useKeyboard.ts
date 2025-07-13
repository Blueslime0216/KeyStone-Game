/**
 * 키보드 단축키를 처리하는 커스텀 훅
 * Ctrl+Z (되돌리기)와 Ctrl+Shift+Z (다시 실행) 키를 감지
 * 
 * 기능:
 * - Ctrl+Z: 게임 되돌리기 (이전 턴으로 되돌리기)
 * - Ctrl+Shift+Z: 다시 실행 (다음 턴으로 진행)
 * 
 * 사용법:
 * 컴포넌트에서 useKeyboard()를 호출하면 자동으로 키보드 이벤트 리스너가 등록됨
 */

import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';

/**
 * 키보드 단축키를 처리하는 커스텀 훅
 * 
 * 동작 방식:
 * 1. 컴포넌트 마운트 시 키보드 이벤트 리스너 등록
 * 2. Ctrl+Z 또는 Ctrl+Shift+Z 키 감지 시 해당 액션 실행
 * 3. 컴포넌트 언마운트 시 이벤트 리스너 제거
 * 
 * @returns void (반환값 없음, 부수 효과만 있음)
 */
export const useKeyboard = () => {
  // 게임 스토어에서 되돌리기 관련 액션들을 가져옴
  const { undo, redo } = useGameStore();

  useEffect(() => {
    /**
     * 키보드 이벤트 핸들러
     * 키보드 입력을 감지하여 해당하는 게임 액션을 실행
     * 
     * @param e - 키보드 이벤트 객체 (키 정보 포함)
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z: 되돌리기 (일반적인 되돌리기 단축키)
      // ctrlKey: Ctrl 키가 눌린 상태
      // key: 눌린 키 ('z' 또는 'Z')
      // shiftKey: Shift 키가 눌린 상태 (false여야 함)
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); // 브라우저 기본 동작 방지 (예: 브라우저 뒤로가기)
        undo(); // 게임 되돌리기 액션 실행
      }
      
      // Ctrl+Shift+Z: 다시 실행 (일반적인 다시 실행 단축키)
      // ctrlKey: Ctrl 키가 눌린 상태
      // shiftKey: Shift 키가 눌린 상태 (true여야 함)
      // key: 눌린 키 ('Z' - 대문자)
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault(); // 브라우저 기본 동작 방지
        redo(); // 게임 다시 실행 액션 실행
      }
    };

    // 키보드 이벤트 리스너 등록
    // keydown: 키가 눌릴 때 발생하는 이벤트
    // window: 전체 창에서 키보드 입력 감지
    window.addEventListener('keydown', handleKeyDown);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거 (메모리 누수 방지)
    // useEffect의 cleanup 함수로 등록
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]); // 의존성 배열: undo, redo 함수가 변경되면 useEffect 재실행
}; 