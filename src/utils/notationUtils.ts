/**
 * 에테르가르드 게임의 기보 시스템 유틸리티 함수들
 * 게임의 각 수에 대한 기보 표기법을 생성하고 관리
 */

import { 
  GameMove, 
  Position, 
  NotationInfo, 
  NotationType, 
  Direction 
} from '../types/gameTypes';

/**
 * 기보 정보를 생성하는 함수
 * 게임의 한 수에 대해 특정 위치의 기보 표기를 생성
 * 
 * 기보 표기 규칙:
 * - 일반 배치: 숫자만 (예: 17)
 * - 초점 요석: 숫자 + + (예: 17+)
 * - 요석 변환: 숫자 + • (예: 17•)
 * - 공명 변환: 숫자 + 화살표 (예: 17→, 17←, 17↑, 17↓)
 * - 요석 변환된 돌: 배치 기보 + 변환 기보 (예: 17/19•)
 * 
 * @param move - 게임의 한 수 정보 (턴 번호, 액션 타입, 위치 등)
 * @param position - 기보를 생성할 위치 (돌이 있는 위치)
 * @param board - 현재 보드 상태 (참고용)
 * @returns 기보 정보 또는 null (해당 위치에 기보가 없는 경우)
 */
export function createNotation(
  move: GameMove, 
  position: Position, 
  board: any[][]
): NotationInfo | null {
  const { moveNumber, moveType, resonanceInfo, lShapeInfo } = move;
  
  switch (moveType) {
    case 'place':
      // 일반 돌 배치: 숫자만 표시
      // 해당 위치에 돌이 배치된 경우에만 기보 생성
      return {
        moveNumber,        // 턴 번호 (1부터 시작)
        notationType: 'normal' // 일반 배치 타입
      };
      
    case 'convert':
      // 요석 변환: 변환 기보만 생성 (기존 기보는 updateNotation에서 처리)
      return {
        moveNumber,        // 변환 턴 번호
        notationType: 'conversion' // 변환 타입
      };
      
    case 'resonance':
      // 공명 활성화: 초점 요석과 공명 변환 구분
      if (resonanceInfo) {
        const { focusPosition, resonancePaths } = resonanceInfo;
        
        // 1. 초점 요석인지 확인 (숫자 + + 표시)
        // 초점 요석은 공명의 시작점으로 선택된 돌
        if (position.row === focusPosition.row && position.col === focusPosition.col) {
          return {
            moveNumber,        // 턴 번호
            notationType: 'focus' // 초점 요석 타입
          };
        }
        
        // 2. 공명으로 변환된 위치인지 확인 (숫자 + 화살표 표시)
        // 공명 파동에 의해 전도석이 요석으로 변환된 위치
        const direction = getResonanceDirection(focusPosition, position, resonancePaths);
        if (direction) {
          // 공명 기보만 생성 (기존 기보는 updateNotation에서 처리)
          return {
            moveNumber,        // 턴 번호
            notationType: 'resonance', // 공명 변환 타입
            direction          // 공명 방향 (up/down/left/right)
          };
        }
      }
      break;
  }
  
  // 해당 위치에 기보가 없는 경우 null 반환
  return null;
}

/**
 * 공명 파동의 방향을 결정하는 함수
 * 초점 요석에서 특정 위치까지의 공명 파동 방향을 찾음
 * 
 * 공명은 4방향(상하좌우)으로 전파되며, 각 방향마다 별도의 경로가 있음
 * 
 * @param focusPosition - 초점 요석의 위치 (공명의 시작점)
 * @param targetPosition - 확인할 위치 (방향을 찾을 위치)
 * @param resonancePaths - 4방향 공명 파동 경로들 (배열의 인덱스가 방향과 매칭)
 * @returns 공명 방향 또는 null (해당 위치가 공명 경로에 없는 경우)
 */
export function getResonanceDirection(
  focusPosition: Position, 
  targetPosition: Position, 
  resonancePaths: Position[][]
): Direction | null {
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  
  // 4방향 중에서 해당 위치가 포함된 경로를 찾음
  // resonancePaths[0] = 위쪽 경로, [1] = 아래쪽 경로, [2] = 왼쪽 경로, [3] = 오른쪽 경로
  for (let i = 0; i < directions.length; i++) {
    const path = resonancePaths[i];
    if (path && path.some(pos => pos.row === targetPosition.row && pos.col === targetPosition.col)) {
      return directions[i]; // 해당 방향 반환
    }
  }
  
  // 해당 위치가 어떤 공명 경로에도 포함되지 않은 경우
  return null;
}

/**
 * 기보 텍스트를 생성하는 함수
 * 기보 정보를 바탕으로 화면에 표시할 텍스트를 생성
 * 
 * @param notation - 기보 정보 (턴 번호, 타입, 방향 등)
 * @returns 표시할 텍스트 (예: "17", "17+", "17•", "17→", "17/19•")
 */
export function getNotationText(notation: NotationInfo): string {
  const { moveNumber, notationType, direction, secondaryNotation } = notation;
  
  // 기본 기보 텍스트 생성
  let baseText = '';
  switch (notationType) {
    case 'normal':
      baseText = moveNumber.toString(); // 일반 배치: 숫자만 (예: 17)
      break;
    case 'focus':
      baseText = `${moveNumber}+`; // 초점 요석: 숫자 + + (예: 17+)
      break;
    case 'conversion':
      baseText = `${moveNumber}•`; // 요석 변환: 숫자 + • (예: 17•)
      break;
    case 'resonance':
      // 공명 변환: 숫자 + 화살표 (예: 17→, 17←, 17↑, 17↓)
      const arrows = { 
        up: '↑',    // 위쪽 화살표
        down: '↓',  // 아래쪽 화살표
        left: '←',  // 왼쪽 화살표
        right: '→'  // 오른쪽 화살표
      };
      baseText = `${moveNumber}${arrows[direction!]}`; // direction이 undefined일 수 없음 (! 사용)
      break;
    default:
      baseText = moveNumber.toString(); // 기본값: 숫자만
  }
  
  // 두 번째 기보가 있으면 추가
  if (secondaryNotation) {
    let secondaryText = '';
    switch (secondaryNotation.notationType) {
      case 'conversion':
        secondaryText = `${secondaryNotation.moveNumber}•`; // 변환 기보 (예: 19•)
        break;
      case 'resonance':
        secondaryText = `${secondaryNotation.moveNumber}→`; // 공명 기보 (예: 19→)
        break;
      default:
        secondaryText = secondaryNotation.moveNumber.toString();
    }
    return `${baseText}/${secondaryText}`; // 두 기보를 /로 구분 (예: 17/19•)
  }
  
  return baseText;
}

/**
 * 기보 색상을 결정하는 함수
 * 돌의 색상과 기보 타입에 따라 적절한 색상을 반환
 * 
 * 기보는 돌 위에 작은 텍스트로 표시되므로, 돌 색상과 대비되는 색상을 사용
 * 두 개의 기보가 있는 경우 변환 기보 색상을 우선 사용
 * 
 * @param notation - 기보 정보 (타입에 따라 색상 결정)
 * @param stoneType - 돌의 종류 (흑돌/백돌에 따라 기본 색상 결정)
 * @returns Tailwind CSS 색상 클래스 (예: "text-white", "text-yellow-300")
 */
export function getNotationColor(notation: NotationInfo, stoneType?: string): string {
  const { notationType, secondaryNotation } = notation;
  
  // 돌 색상에 따른 기본 색상 결정
  // 흑돌: 어두운 배경이므로 밝은 색상 사용
  // 백돌: 밝은 배경이므로 어두운 색상 사용
  const isBlackStone = stoneType?.includes('black');
  const isWhiteStone = stoneType?.includes('white');
  
  const baseColor = isBlackStone ? 'text-white' : 
                   isWhiteStone ? 'text-black' : 'text-white';
  
  // 두 번째 기보가 있으면 변환 기보 색상을 우선 사용
  if (secondaryNotation) {
    switch (secondaryNotation.notationType) {
      case 'conversion':
        return 'text-green-300'; // 변환: 밝은 초록색 (변환된 돌임을 강조)
      case 'resonance':
        return 'text-blue-300'; // 공명: 밝은 파란색 (공명으로 변환됨을 강조)
    }
  }
  
  switch (notationType) {
    case 'normal':
      return baseColor; // 기본 색상 사용 (돌 색상에 따라 결정)
    case 'focus':
      return 'text-yellow-300'; // 초점: 밝은 노란색 (모든 돌에서 잘 보임)
    case 'conversion':
      return 'text-green-300'; // 변환: 밝은 초록색 (변환된 돌임을 강조)
    case 'resonance':
      return 'text-blue-300'; // 공명: 밝은 파란색 (공명으로 변환됨을 강조)
    default:
      return baseColor; // 기본 색상
  }
} 