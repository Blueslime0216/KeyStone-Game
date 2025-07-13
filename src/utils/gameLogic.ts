/**
 * 에테르가르드 게임의 핵심 로직 함수들
 * 게임 규칙에 따른 모든 계산과 판단을 담당
 */

import { 
  BoardCell, 
  Position, 
  Player, 
  StoneType, 
  LShape, 
  Core, 
  Direction 
} from '../types/gameTypes';

/** 게임 보드의 크기 (17x17) */
export const BOARD_SIZE = 17;

/**
 * 빈 게임 보드를 생성하는 함수
 * 17x17 크기의 보드를 생성하고 모든 셀을 빈 상태로 초기화
 * @returns 초기화된 빈 보드 (모든 셀이 'empty' 상태)
 */
export function createEmptyBoard(): BoardCell[][] {
  const board: BoardCell[][] = [];
  
  // 17x17 보드 생성 (행과 열 모두 0-16 범위)
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      // 각 셀을 빈 상태로 초기화
      board[row][col] = {
        position: { row, col },  // 셀의 위치 정보
        stoneType: 'empty',      // 돌이 없는 상태
        isHighlighted: false,    // 하이라이트 해제
        isConvertible: false,    // 변환 불가능
        isResonating: false      // 공명 상태 아님
      };
    }
  }
  
  return board;
}

/**
 * 위치가 보드 범위 내에 있는지 확인하는 함수
 * @param position - 확인할 위치
 * @returns 유효한 위치인지 여부 (0-16 범위 내)
 */
export function isValidPosition(position: Position): boolean {
  return position.row >= 0 && position.row < BOARD_SIZE && 
         position.col >= 0 && position.col < BOARD_SIZE;
}

/**
 * 두 위치가 같은지 확인하는 함수
 * @param pos1 - 첫 번째 위치
 * @param pos2 - 두 번째 위치
 * @returns 두 위치가 동일한지 여부
 */
export function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

/**
 * 위치가 배열에 포함되어 있는지 확인하는 함수
 * @param position - 찾을 위치
 * @param positions - 검색할 위치 배열
 * @returns 배열에 포함되어 있는지 여부
 */
export function isPositionInArray(position: Position, positions: Position[]): boolean {
  return positions.some(pos => isSamePosition(pos, position));
}

/**
 * 보드에서 빈 위치들을 모두 찾는 함수
 * @param board - 검색할 보드
 * @returns 빈 위치들의 배열
 */
export function getEmptyPositions(board: BoardCell[][]): Position[] {
  const emptyPositions: Position[] = [];
  
  // 모든 셀을 순회하며 빈 칸 찾기
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].stoneType === 'empty') {
        emptyPositions.push({ row, col });
      }
    }
  }
  
  return emptyPositions;
}

/**
 * 특정 플레이어의 전도석들만 찾는 함수
 * @param board - 검색할 보드
 * @param player - 플레이어 (black/white)
 * @returns 해당 플레이어의 전도석 위치들
 */
export function getConduitStones(board: BoardCell[][], player: Player): Position[] {
  const conduitStones: Position[] = [];
  const conduitType = `${player}Conduit` as StoneType; // 'blackConduit' 또는 'whiteConduit'
  
  // 모든 셀을 순회하며 해당 플레이어의 전도석 찾기
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].stoneType === conduitType) {
        conduitStones.push({ row, col });
      }
    }
  }
  
  return conduitStones;
}

/**
 * 특정 플레이어의 요석들만 찾는 함수
 * @param board - 검색할 보드
 * @param player - 플레이어 (black/white)
 * @returns 해당 플레이어의 요석 위치들
 */
export function getKeystoneStones(board: BoardCell[][], player: Player): Position[] {
  const keystoneStones: Position[] = [];
  const keystoneType = `${player}Keystone` as StoneType; // 'blackKeystone' 또는 'whiteKeystone'
  
  // 모든 셀을 순회하며 해당 플레이어의 요석 찾기
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].stoneType === keystoneType) {
        keystoneStones.push({ row, col });
      }
    }
  }
  
  return keystoneStones;
}

/**
 * 두 위치가 인접한지 확인하는 함수
 * 인접 = 상하좌우 중 하나로 연결된 상태 (대각선 제외)
 * @param pos1 - 첫 번째 위치
 * @param pos2 - 두 번째 위치
 * @returns 인접한지 여부
 */
export function areAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  // 상하(행 차이 1, 열 차이 0) 또는 좌우(행 차이 0, 열 차이 1)인 경우만 인접
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * 보드에서 특정 플레이어의 ㄱ자 형태들을 모두 찾는 함수
 * 3개의 전도석이 ㄱ 또는 ㄴ 모양을 이루는 모든 조합을 찾음
 * @param board - 검색할 보드
 * @param player - 플레이어 (black/white)
 * @returns ㄱ자 형태들의 배열
 */
export function detectLShapes(board: BoardCell[][], player: Player): LShape[] {
  const lShapes: LShape[] = [];
  const conduitStones = getConduitStones(board, player); // 해당 플레이어의 전도석들
  
  // 3개씩 조합하여 ㄱ자/ㄴ자 형태 확인
  // 모든 가능한 3개 조합을 검사
  for (let i = 0; i < conduitStones.length - 2; i++) {
    for (let j = i + 1; j < conduitStones.length - 1; j++) {
      for (let k = j + 1; k < conduitStones.length; k++) {
        const threeStones = [conduitStones[i], conduitStones[j], conduitStones[k]];
        
        // 3개 돌이 ㄱ자 형태인지 확인
        if (isLShape(threeStones)) {
          lShapes.push({
            stones: threeStones,
            type: getLShapeType(threeStones) // L 또는 reverseL 타입 결정
          });
        }
      }
    }
  }
  
  return lShapes;
}

/**
 * 3개 돌이 ㄱ자 형태인지 확인하는 함수
 * ㄱ자 형태 = 3개 돌 중 2개씩 인접한 쌍이 2개 있는 구조
 * @param stones - 확인할 3개 돌의 위치 배열
 * @returns ㄱ자 형태인지 여부
 */
export function isLShape(stones: Position[]): boolean {
  if (stones.length !== 3) return false; // 3개가 아니면 ㄱ자 아님
  
  const [stone1, stone2, stone3] = stones;
  
  // 3개 돌 중 2개씩 인접한 쌍이 2개 있어야 함
  const adjacentPairs = [
    areAdjacent(stone1, stone2), // 1-2번 돌이 인접한지
    areAdjacent(stone2, stone3), // 2-3번 돌이 인접한지
    areAdjacent(stone1, stone3)  // 1-3번 돌이 인접한지
  ];
  
  const adjacentCount = adjacentPairs.filter(Boolean).length;
  
  // ㄱ자 형태: 2개가 인접하고, 나머지 1개가 그 중 하나와 인접
  return adjacentCount === 2;
}

/**
 * ㄱ자 형태의 타입을 결정하는 함수
 * @param stones - ㄱ자를 구성하는 3개 돌
 * @returns 'L' 또는 'reverseL' 타입
 */
export function getLShapeType(stones: Position[]): 'L' | 'reverseL' {
  // 간단한 구현: 첫 번째 돌을 기준으로 형태 판단
  // 실제로는 더 정확한 로직이 필요하지만, 일단 간단하게 구현
  const [stone1, stone2, stone3] = stones;
  
  // 실제로는 돌들의 상대적 위치를 분석하여 정확한 타입을 결정해야 함
  // 현재는 기본값으로 'L' 반환
  return 'L';
}

/**
 * 보드에서 특정 플레이어의 코어들을 모두 찾는 함수
 * 2x2 정사각형을 이루는 같은 플레이어의 돌 4개를 찾음
 * @param board - 검색할 보드
 * @param player - 플레이어 (black/white)
 * @returns 코어들의 배열
 */
export function detectCores(board: BoardCell[][], player: Player): Core[] {
  const cores: Core[] = [];
  
  // 모든 2x2 영역 검사 (16x16 영역에서 2x2씩 검사)
  for (let row = 0; row < BOARD_SIZE - 1; row++) {
    for (let col = 0; col < BOARD_SIZE - 1; col++) {
      // 2x2 영역의 4개 셀 가져오기
      const fourCells = [
        board[row][col],         // 좌상단
        board[row][col + 1],     // 우상단
        board[row + 1][col],     // 좌하단
        board[row + 1][col + 1]  // 우하단
      ];
      
      // 4개 셀이 유효한 코어인지 확인
      if (isValidCore(fourCells, player)) {
        cores.push({
          positions: [
            { row: row, col: col },           // 좌상단 위치
            { row: row, col: col + 1 },       // 우상단 위치
            { row: row + 1, col: col },       // 좌하단 위치
            { row: row + 1, col: col + 1 }    // 우하단 위치
          ],
          stones: fourCells // 4개 셀 객체
        });
      }
    }
  }
  
  return cores;
}

/**
 * 새로 추가된 돌이 포함된 코어들을 찾는 함수
 * 이번 턴에 새로 배치된 돌이 포함된 2x2 정사각형만 코어로 인정
 * @param board - 검색할 보드
 * @param player - 플레이어 (black/white)
 * @param newPosition - 새로 추가된 돌의 위치
 * @returns 새로 추가된 돌이 포함된 코어들의 배열
 */
export function detectCoresWithNewStone(board: BoardCell[][], player: Player, newPosition: Position): Core[] {
  const cores: Core[] = [];
  
  // 새로 추가된 돌이 포함될 수 있는 모든 2x2 영역 검사
  // 새 돌의 위치를 기준으로 가능한 2x2 영역들을 확인
  const possibleCores = [
    // 새 돌이 좌상단인 경우
    { startRow: newPosition.row, startCol: newPosition.col },
    // 새 돌이 우상단인 경우
    { startRow: newPosition.row, startCol: newPosition.col - 1 },
    // 새 돌이 좌하단인 경우
    { startRow: newPosition.row - 1, startCol: newPosition.col },
    // 새 돌이 우하단인 경우
    { startRow: newPosition.row - 1, startCol: newPosition.col - 1 }
  ];
  
  possibleCores.forEach(({ startRow, startCol }) => {
    // 2x2 영역이 보드 범위 내에 있는지 확인
    if (startRow >= 0 && startRow < BOARD_SIZE - 1 && 
        startCol >= 0 && startCol < BOARD_SIZE - 1) {
      
      // 2x2 영역의 4개 셀 가져오기
      const fourCells = [
        board[startRow][startCol],         // 좌상단
        board[startRow][startCol + 1],     // 우상단
        board[startRow + 1][startCol],     // 좌하단
        board[startRow + 1][startCol + 1]  // 우하단
      ];
      
      // 4개 셀이 유효한 코어인지 확인
      if (isValidCore(fourCells, player)) {
        cores.push({
          positions: [
            { row: startRow, col: startCol },           // 좌상단 위치
            { row: startRow, col: startCol + 1 },       // 우상단 위치
            { row: startRow + 1, col: startCol },       // 좌하단 위치
            { row: startRow + 1, col: startCol + 1 }    // 우하단 위치
          ],
          stones: fourCells // 4개 셀 객체
        });
      }
    }
  });
  
  return cores;
}

/**
 * 4개 셀이 유효한 코어인지 확인하는 함수
 * 모든 셀이 같은 플레이어의 돌(전도석 또는 요석)이어야 함
 * @param cells - 확인할 4개 셀
 * @param player - 플레이어 (black/white)
 * @returns 유효한 코어인지 여부
 */
export function isValidCore(cells: BoardCell[], player: Player): boolean {
  const playerConduit = `${player}Conduit` as StoneType; // 해당 플레이어의 전도석
  const playerKeystone = `${player}Keystone` as StoneType; // 해당 플레이어의 요석
  
  // 모든 셀이 해당 플레이어의 전도석 또는 요석이어야 함
  return cells.every(cell => 
    cell.stoneType === playerConduit || cell.stoneType === playerKeystone
  );
}

/**
 * 공명을 활성화하는 함수
 * 코어와 초점 요석을 선택하여 4방향으로 공명 파동을 전파
 * @param board - 현재 보드 상태
 * @param core - 공명을 활성화할 코어
 * @param focusPosition - 초점 요석의 위치
 * @returns 공명이 적용된 새 보드와 공명 경로들
 */
export function activateResonance(
  board: BoardCell[][], 
  core: Core, 
  focusPosition: Position
): { newBoard: BoardCell[][]; resonancePaths: Position[][] } {
  let newBoard = JSON.parse(JSON.stringify(board)) as BoardCell[][]; // 보드 깊은 복사
  const resonancePaths: Position[][] = [];
  
  // 코어를 만든 플레이어 확인 (코어의 첫 번째 돌을 기준으로)
  const corePlayer = core.stones[0].stoneType.includes('black') ? 'black' : 'white';
  
  // 4방향으로 공명 파동 전파
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  
  directions.forEach((direction, index) => {
    // 각 방향으로 공명 파동 전파
    const path = propagateResonance(newBoard, focusPosition, direction, core, corePlayer);
    resonancePaths[index] = path;
    
    // 경로상의 자신의 전도석만 요석으로 변환
    path.forEach(pos => {
      const cell = newBoard[pos.row][pos.col];
      const playerConduit = `${corePlayer}Conduit` as StoneType;
      if (cell.stoneType === playerConduit) {
        cell.stoneType = `${corePlayer}Keystone` as StoneType;
      }
    });
  });
  
  return { newBoard, resonancePaths };
}

/**
 * 공명 파동을 특정 방향으로 전파하는 함수
 * 초점 요석에서 한 방향으로 최대 5칸까지 전파
 * 코어 내부는 통과하지만 변환되지 않음
 * @param board - 현재 보드 상태
 * @param start - 시작 위치 (초점 요석)
 * @param direction - 전파 방향
 * @param core - 코어 정보 (코어 내부는 통과하지만 변환되지 않음)
 * @param corePlayer - 코어를 만든 플레이어
 * @returns 공명 경로상의 위치들 (코어 내부 제외)
 */
export function propagateResonance(
  board: BoardCell[][], 
  start: Position, 
  direction: Direction, 
  core: Core,
  corePlayer: Player
): Position[] {
  const path: Position[] = [];
  let current = { ...start }; // 시작 위치에서 시작
  
  // 방향별 이동 벡터 정의
  const directionVectors = {
    up: { row: -1, col: 0 },    // 위로: 행 -1
    down: { row: 1, col: 0 },   // 아래로: 행 +1
    left: { row: 0, col: -1 },  // 왼쪽으로: 열 -1
    right: { row: 0, col: 1 }   // 오른쪽으로: 열 +1
  };
  
  const vector = directionVectors[direction];
  
  // 최대 5칸까지 전파
  for (let i = 0; i < 5; i++) {
    // 다음 위치로 이동
    current = {
      row: current.row + vector.row,
      col: current.col + vector.col
    };
    
    // 경계 체크: 보드 밖으로 나가면 중단
    if (!isValidPosition(current)) break;
    
    const cell = board[current.row][current.col];
    
    // 코어 내부는 공명에 영향을 받지 않으므로 통과 (중단하지 않음)
    // 코어 내부의 돌들은 변환되지 않지만, 공명 파동은 계속 진행됨
    
    // 코어 내부가 아닌 경우에만 처리
    if (!isPositionInArray(current, core.positions)) {
      // 자신의 전도석을 만나면 경로에 추가하고 중단
      const playerConduit = `${corePlayer}Conduit` as StoneType;
      if (cell.stoneType === playerConduit) {
        path.push(current);
        break; // 전도석을 만나면 그 방향 전파 중단
      }
      
      // 상대 돌이나 자신의 요석을 만나면 중단 (빈 칸이 아니면 중단)
      if (cell.stoneType !== 'empty') break;
      
      // 빈 칸이면 경로에 추가하고 계속 진행
      path.push(current);
    }
    // 코어 내부인 경우: 돌의 종류에 관계없이 통과 (경로에 추가하지 않음)
  }
  
  return path;
}

/**
 * 승리 조건을 확인하는 함수
 * 특정 플레이어의 요석 5개가 일렬로 연결되어 있는지 확인
 * @param board - 확인할 보드
 * @param player - 확인할 플레이어
 * @returns 승리 조건을 만족하는지 여부
 */
export function checkWinCondition(board: BoardCell[][], player: Player): boolean {
  const keystonePositions = getKeystoneStones(board, player); // 해당 플레이어의 요석들
  
  // 5개 이상의 요석이 있는지 확인 (5개 미만이면 승리 불가)
  if (keystonePositions.length < 5) return false;
  
  // 모든 가능한 5개 조합 확인
  const combinations = getCombinations(keystonePositions, 5);
  
  // 하나라도 일렬로 연결된 5개가 있으면 승리
  return combinations.some(combination => isInLine(combination));
}

/**
 * 조합 생성 함수 (n개 중 r개 선택)
 * @param array - 선택할 배열
 * @param r - 선택할 개수
 * @returns 모든 가능한 조합들의 배열
 */
export function getCombinations<T>(array: T[], r: number): T[][] {
  if (r === 1) return array.map(item => [item]); // 1개 선택: 각 요소를 배열로
  if (r === array.length) return [array]; // 전체 선택: 원본 배열 하나
  
  const combinations: T[][] = [];
  
  // 재귀적으로 조합 생성
  for (let i = 0; i <= array.length - r; i++) {
    const head = array[i]; // 첫 번째 요소
    const tailCombinations = getCombinations(array.slice(i + 1), r - 1); // 나머지에서 r-1개 선택
    
    // 첫 번째 요소와 나머지 조합들을 결합
    tailCombinations.forEach(combination => {
      combinations.push([head, ...combination]);
    });
  }
  
  return combinations;
}

/**
 * 5개 돌이 일렬로 있는지 확인하는 함수
 * 가로, 세로, 대각선 중 하나라도 만족하면 true
 * @param positions - 확인할 5개 위치
 * @returns 일렬로 있는지 여부
 */
export function isInLine(positions: Position[]): boolean {
  return isHorizontal(positions) || 
         isVertical(positions) || 
         isDiagonal(positions);
}

/**
 * 가로로 일렬인지 확인하는 함수
 * 모든 돌이 같은 행에 있고, 열이 연속되어야 함
 * @param positions - 확인할 위치들
 * @returns 가로로 일렬인지 여부
 */
export function isHorizontal(positions: Position[]): boolean {
  const row = positions[0].row; // 첫 번째 돌의 행
  return positions.every(pos => pos.row === row) && // 모든 돌이 같은 행
         isConsecutive(positions.map(p => p.col)); // 열이 연속
}

/**
 * 세로로 일렬인지 확인하는 함수
 * 모든 돌이 같은 열에 있고, 행이 연속되어야 함
 * @param positions - 확인할 위치들
 * @returns 세로로 일렬인지 여부
 */
export function isVertical(positions: Position[]): boolean {
  const col = positions[0].col; // 첫 번째 돌의 열
  return positions.every(pos => pos.col === col) && // 모든 돌이 같은 열
         isConsecutive(positions.map(p => p.row)); // 행이 연속
}

/**
 * 대각선으로 일렬인지 확인하는 함수
 * 주대각선 또는 반대각선 중 하나라도 만족하면 true
 * @param positions - 확인할 위치들
 * @returns 대각선으로 일렬인지 여부
 */
export function isDiagonal(positions: Position[]): boolean {
  return isMainDiagonal(positions) || isAntiDiagonal(positions);
}

/**
 * 주대각선(왼쪽 위에서 오른쪽 아래)으로 일렬인지 확인
 * @param positions - 확인할 위치들
 * @returns 주대각선으로 일렬인지 여부
 */
export function isMainDiagonal(positions: Position[]): boolean {
  const sorted = positions.sort((a, b) => a.row - b.row); // 행 기준으로 정렬
  const first = sorted[0]; // 가장 위쪽 돌
  
  // 모든 돌이 (행+인덱스, 열+인덱스) 패턴을 만족하는지 확인
  return sorted.every((pos, index) => 
    pos.row === first.row + index && pos.col === first.col + index
  );
}

/**
 * 반대각선(오른쪽 위에서 왼쪽 아래)으로 일렬인지 확인
 * @param positions - 확인할 위치들
 * @returns 반대각선으로 일렬인지 여부
 */
export function isAntiDiagonal(positions: Position[]): boolean {
  const sorted = positions.sort((a, b) => a.row - b.row); // 행 기준으로 정렬
  const first = sorted[0]; // 가장 위쪽 돌
  
  // 모든 돌이 (행+인덱스, 열-인덱스) 패턴을 만족하는지 확인
  return sorted.every((pos, index) => 
    pos.row === first.row + index && pos.col === first.col - index
  );
}

/**
 * 숫자 배열이 연속된 숫자인지 확인하는 함수
 * @param numbers - 확인할 숫자 배열
 * @returns 연속된 숫자인지 여부
 */
export function isConsecutive(numbers: number[]): boolean {
  const sorted = numbers.sort((a, b) => a - b); // 오름차순 정렬
  
  // 인접한 두 숫자의 차이가 1인지 확인
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      return false; // 연속되지 않음
    }
  }
  
  return true; // 모든 숫자가 연속됨
} 