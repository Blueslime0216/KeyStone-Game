/**
 * 에테르가르드 게임의 중앙 상태 관리 스토어
 * Zustand를 사용하여 게임의 모든 상태와 액션을 중앙에서 관리
 * 
 * 주요 기능:
 * - 게임 상태 관리 (보드, 플레이어, 단계 등)
 * - 게임 액션 처리 (돌 배치, 변환, 공명 등)
 * - 기보 시스템 관리
 * - 되돌리기 시스템
 * - 이벤트 로그 관리
 */

import { create } from 'zustand';
import { 
  GameState, 
  BoardCell, 
  Position, 
  // Player, 
  // GamePhase, 
  GameStatus, 
  LShape, 
  Core, 
  GameMove,
  StoneType,
  GameEvent
} from '../types/gameTypes';
import { 
  createEmptyBoard, 
  detectLShapes, 
  detectCores, 
  detectCoresWithNewStone,
  activateResonance, 
  checkWinCondition,
  // isValidPosition 
} from '../utils/gameLogic';
import { createNotation } from '../utils/notationUtils';

/**
 * 게임 스토어 인터페이스
 * GameState를 확장하여 게임 액션들을 포함
 * 
 * 모든 게임 관련 상태와 액션을 하나의 인터페이스로 정의
 */
interface GameStore extends GameState {
  // === 게임 핵심 액션들 ===
  placeStone: (position: Position) => void;           // 돌 배치 (전도석 배치)
  convertLShape: (lShape: LShape, stoneIndex: number) => void; // ㄱ자 변환 (전도석 → 요석)
  selectCore: (core: Core) => void;                   // 코어 선택 (공명 모드에서)
  selectFocusPosition: (position: Position) => void;  // 초점 요석 선택 (공명 활성화)
  activateResonance: (core: Core, focusPosition: Position) => void; // 공명 활성화 (직접 호출용)
  
  // === UI 액션들 ===
  setHoveredPosition: (position: Position | null) => void; // 호버 위치 설정 (마우스 피드백)
  toggleNotationMode: () => void;                     // 기보 모드 토글 (ON/OFF)
  
  // === 되돌리기 시스템 액션들 ===
  undo: () => void;                                   // 되돌리기 (Ctrl+Z)
  redo: () => void;                                   // 다시 실행 (Ctrl+Shift+Z)
  confirmUndo: () => void;                            // 되돌리기 확인 (히스토리 모드에서)
  
  // === 게임 관리 액션들 ===
  resetGame: () => void;                              // 게임 리셋 (새 게임 시작)
  updateAvailableMoves: () => void;                   // 가능한 이동 업데이트 (UI 상태 동기화)
  updateConvertibleStones: () => void;                // 변환 가능한 돌 업데이트 (UI 상태 동기화)
  
  // === 이벤트 시스템 액션들 ===
  addEvent: (event: Omit<GameEvent, 'id' | 'timestamp'>) => void; // 이벤트 추가 (로그 기록)
  clearEventLog: () => void;                          // 이벤트 로그 초기화
}

/**
 * Zustand를 사용한 게임 상태 관리 스토어
 * 게임의 모든 상태와 액션을 중앙에서 관리
 * 
 * 스토어 구조:
 * 1. 기본 게임 상태 (보드, 플레이어, 단계 등)
 * 2. 선택 상태 (선택된 ㄱ자, 코어 등)
 * 3. 기보 시스템 (히스토리, 기보 표시 등)
 * 4. 이벤트 로그 (게임 진행 상황 기록)
 * 5. 되돌리기 시스템 (히스토리 탐색)
 * 6. UI 상태 (가능한 이동, 변환 가능한 돌 등)
 */
export const useGameStore = create<GameStore>((set, get) => ({
  // === 초기 게임 상태 ===
  board: createEmptyBoard(),        // 빈 17x17 보드 (모든 셀이 'empty' 상태)
  currentPlayer: 'black',           // 흑돌이 선공 (게임 규칙)
  gamePhase: 'placing',             // 돌 배치 단계로 시작 (기본 상태)
  gameStatus: 'playing',            // 게임 진행 중 (승리/무승부가 아닌 상태)
  
  // === 선택 상태 ===
  selectedLShape: null,             // 선택된 ㄱ자 형태 (변환 모드에서 사용)
  selectedCores: [],                // 선택 가능한 코어들 (공명 모드에서 표시)
  selectedCore: null,               // 현재 선택된 코어 (초점 선택 모드에서 사용)
  corePlayer: null,                 // 코어를 만든 플레이어 (공명 활성화 시 필요)
  hoveredPosition: null,            // 마우스 호버 위치 (UI 피드백용)
  
  // === 기보 시스템 ===
  moveHistory: [],                  // 게임 히스토리 (모든 턴의 완전한 정보)
  currentMoveIndex: 0,              // 현재 턴 번호 (0부터 시작)
  isNotationMode: false,            // 기보 표시 모드 (기본값: OFF, ON/OFF 토글 가능)
  
  // === 이벤트 로그 시스템 ===
  eventLog: [],                     // 게임 이벤트 로그 (실시간 진행 상황 기록)
  
  // === 되돌리기 시스템 ===
  isHistoryMode: false,             // 히스토리 탐색 모드 (되돌리기 중인지 여부)
  historyIndex: 0,                  // 히스토리 인덱스 (현재 보고 있는 턴 번호)
  
  // === UI 상태 ===
  availableMoves: [],               // 배치 가능한 위치들 (빈 칸들, UI 하이라이트용)
  convertibleStones: [],            // 변환 가능한 돌들 (ㄱ자 형태의 돌들, UI 하이라이트용)
  isAnimating: false,               // 애니메이션 진행 중 여부 (애니메이션 제어용)

  // === 게임 핵심 액션들 ===
  
  /**
   * 돌을 배치하는 액션
   * 현재 플레이어가 선택한 위치에 전도석을 배치
   * 
   * 처리 과정:
   * 1. 게임 상태 검증 (진행 중인지, 히스토리 모드가 아닌지)
   * 2. 보드에 전도석 배치
   * 3. 이벤트 로그 기록
   * 4. 기보 기록 생성
   * 5. 코어 감지 및 공명 모드 전환 또는 일반 턴 종료
   * 
   * @param position - 돌을 배치할 위치 (행, 열)
   */
  placeStone: (position: Position) => {
    const { board, currentPlayer, gameStatus, isHistoryMode } = get();
    
    // 게임이 진행 중이 아니거나 히스토리 모드면 무시
    // (게임이 끝났거나 되돌리기 중에는 새로운 액션 불가)
    if (gameStatus !== 'playing' || isHistoryMode) return;
    
    // 보드 복사 및 돌 배치
    // 깊은 복사로 원본 보드 보존 (되돌리기 시스템에서 필요)
    const newBoard = JSON.parse(JSON.stringify(board)) as BoardCell[][];
    const stoneType = `${currentPlayer}Conduit` as StoneType; // 'blackConduit' 또는 'whiteConduit'
    newBoard[position.row][position.col].stoneType = stoneType;
    
    // 돌 배치 이벤트 추가 (이벤트 로그에 기록)
    get().addEvent({
      eventType: 'stone_placed',
      player: currentPlayer,
      message: `${currentPlayer === 'black' ? '흑돌' : '백돌'}이 (${position.row}, ${position.col})에 전도석을 배치했습니다.`,
      details: { position }
    });
    
    // 기보 기록 생성 (되돌리기 시스템에서 사용)
    const move: GameMove = {
      moveNumber: get().currentMoveIndex + 1, // 다음 턴 번호
      player: currentPlayer,
      moveType: 'place', // 돌 배치 타입
      position,
      previousBoard: board,  // 이전 보드 상태 (되돌리기용)
      currentBoard: newBoard // 현재 보드 상태 (다시 실행용)
    };
    
    // 코어 감지 및 공명 활성화 확인
    // 새로 배치된 돌이 포함된 2x2 코어가 완성되었는지 확인
    const cores = detectCoresWithNewStone(newBoard, currentPlayer, position);
    if (cores.length > 0) {
      // 코어 완성 이벤트 추가
      get().addEvent({
        eventType: 'core_formed',
        player: currentPlayer,
        message: `${cores.length}개의 코어가 완성되었습니다!`,
        details: { core: cores[0] }
      });
      
      // 기보 정보 업데이트 (코어를 만드는 돌에도 기보 표시)
      const updatedBoard = updateNotation(move);
      
      // 코어가 완성되면 공명 모드로 전환
      // 플레이어가 코어를 선택하고 초점 요석을 선택해야 함
      set({
        board: updatedBoard, // 기보 정보가 포함된 보드로 업데이트
        gamePhase: 'resonating', // 공명 활성화 단계로 전환
        selectedCores: cores,    // 선택 가능한 코어들 표시
        selectedCore: null,      // 아직 코어를 선택하지 않음
        corePlayer: currentPlayer,  // 코어를 만든 플레이어 저장 (공명 활성화 시 필요)
        moveHistory: [...get().moveHistory, move], // 히스토리에 추가
        currentMoveIndex: get().currentMoveIndex + 1 // 턴 번호 증가
      });
    } else {
      // 일반 턴 종료 (코어가 완성되지 않은 경우)
      // 플레이어 전환 및 UI 상태 업데이트
      completeTurn(move);
    }
  },

  /**
   * ㄱ자 형태의 돌을 요석으로 변환하는 액션
   * 선택된 ㄱ자 형태의 특정 돌을 요석으로 변환
   * 
   * 처리 과정:
   * 1. 게임 상태 검증
   * 2. 선택된 돌을 요석으로 변환
   * 3. 기보 기록 생성
   * 4. 턴 완료 (플레이어 전환)
   * 
   * @param lShape - 변환할 ㄱ자 형태 (3개 돌의 위치 정보)
   * @param stoneIndex - 변환할 돌의 인덱스 (0-2, ㄱ자를 구성하는 3개 돌 중 하나)
   */
  convertLShape: (lShape: LShape, stoneIndex: number) => {
    const { board, currentPlayer, gameStatus, isHistoryMode } = get();
    
    // 게임이 진행 중이 아니거나 히스토리 모드면 무시
    if (gameStatus !== 'playing' || isHistoryMode) return;
    
    // 보드 복사 및 돌 변환
    const newBoard = JSON.parse(JSON.stringify(board)) as BoardCell[][];
    const stonePosition = lShape.stones[stoneIndex]; // 변환할 돌의 위치
    const stoneType = `${currentPlayer}Keystone` as StoneType; // 'blackKeystone' 또는 'whiteKeystone'
    newBoard[stonePosition.row][stonePosition.col].stoneType = stoneType;
    
    // 기보 기록 생성
    const move: GameMove = {
      moveNumber: get().currentMoveIndex + 1,
      player: currentPlayer,
      moveType: 'convert', // 변환 타입
      position: stonePosition,
      previousBoard: board,
      currentBoard: newBoard,
      lShapeInfo: { lShape, convertedStoneIndex: stoneIndex } // ㄱ자 변환 정보
    };
    
    // 턴 완료 (플레이어 전환 및 UI 상태 업데이트)
    completeTurn(move);
  },

  /**
   * 코어를 선택하는 액션
   * 공명 모드에서 완성된 코어 중 하나를 선택
   * 
   * @param core - 선택할 코어 (2x2 정사각형 정보)
   */
  selectCore: (core: Core) => {
    set({ 
      selectedCore: core,           // 선택된 코어 저장
      gamePhase: 'selectingFocus'   // 초점 요석 선택 단계로 전환
    });
  },

  /**
   * 초점 요석을 선택하는 액션
   * 선택된 코어에서 초점 요석을 선택하여 공명을 활성화
   * 
   * 처리 과정:
   * 1. 선택된 코어와 코어 플레이어 확인
   * 2. 초점 요석을 요석으로 변환 (전도석인 경우)
   * 3. 공명 활성화 및 파동 전파
   * 4. 이벤트 로그 기록
   * 5. 턴 완료
   * 
   * @param position - 선택할 초점 요석의 위치 (코어 내부의 돌 중 하나)
   */
  selectFocusPosition: (position: Position) => {
    const { selectedCore, board, corePlayer } = get();
    
    // 선택된 코어와 코어 플레이어가 없으면 무시
    if (!selectedCore || !corePlayer) return;
    
    // 보드 복사
    let newBoard = JSON.parse(JSON.stringify(board)) as BoardCell[][];
    
    // 초점 요석을 요석으로 변환 (전도석인 경우)
    // 초점 요석이 이미 요석이면 변환하지 않음
    const cell = newBoard[position.row][position.col];
    const playerConduit = `${corePlayer}Conduit` as StoneType;
    if (cell.stoneType === playerConduit) {
      cell.stoneType = `${corePlayer}Keystone` as StoneType;
    }
    
    // 공명 활성화 및 파동 전파
    // gameLogic.ts의 activateResonance 함수 호출
    const { newBoard: resonanceBoard, resonancePaths } = activateResonance(newBoard, selectedCore, position);
    newBoard = resonanceBoard;
    
    // 공명 활성화 이벤트 추가 (이벤트 로그에 기록)
    get().addEvent({
      eventType: 'resonance_activated',
      player: corePlayer,
      message: `${corePlayer === 'black' ? '흑돌' : '백돌'}이 공명을 활성화했습니다!`,
      details: { 
        position,        // 초점 요석 위치
        core: selectedCore, // 선택된 코어
        resonancePaths   // 공명 파동 경로들
      }
    });
    
    // 변환된 돌들 찾기 (초점 요석 포함)
    // 공명으로 인해 전도석에서 요석으로 변환된 모든 돌들을 찾음
    const convertedStones: Position[] = [];
    
    // 1. 초점 요석이 전도석에서 변환된 경우 추가
    if (board[position.row][position.col].stoneType === playerConduit) {
      convertedStones.push(position);
    }
    
    // 2. 공명 경로상의 변환된 돌들 추가
    // 각 방향의 공명 경로를 순회하며 변환된 돌들 찾기
    resonancePaths.forEach(path => {
      path.forEach(pos => {
        // 현재 상태가 요석이고 이전 상태가 전도석이면 변환된 돌
        if (newBoard[pos.row][pos.col].stoneType.includes('Keystone') && 
            board[pos.row][pos.col].stoneType.includes('Conduit')) {
          convertedStones.push(pos);
        }
      });
    });
    
    // 변환된 돌이 있으면 이벤트 로그에 기록
    if (convertedStones.length > 0) {
      get().addEvent({
        eventType: 'stone_converted',
        player: corePlayer,
        message: `${convertedStones.length}개의 돌이 요석으로 변환되었습니다.`,
        details: { convertedStones }
      });
    }
    
    // 기보 기록 생성 (되돌리기 시스템에서 사용)
    const move: GameMove = {
      moveNumber: get().currentMoveIndex + 1,
      player: corePlayer, // 코어를 만든 플레이어
      moveType: 'resonance', // 공명 타입
      position: position, // 초점 요석 위치
      previousBoard: board, // 이전 보드 상태
      currentBoard: newBoard, // 현재 보드 상태
      resonanceInfo: { 
        core: selectedCore, 
        focusPosition: position, 
        resonancePaths 
      } // 공명 정보
    };
    
    // 턴 완료 (플레이어 전환 및 UI 상태 업데이트)
    completeTurn(move);
  },

  /**
   * 공명을 활성화하는 액션 (직접 호출용)
   * 코어와 초점 요석을 선택하여 공명 파동을 전파
   * 
   * 주의: 이 함수는 selectFocusPosition에서 내부적으로 호출되므로
   * 직접 사용할 일은 거의 없음
   * 
   * @param core - 공명을 활성화할 코어 (2x2 정사각형)
   * @param focusPosition - 초점 요석의 위치 (코어 내부의 돌)
   */
  activateResonance: (core: Core, focusPosition: Position) => {
    const { board, currentPlayer } = get();
    
    // 공명 활성화 및 파동 전파 (gameLogic.ts 함수 호출)
    const { newBoard, resonancePaths } = activateResonance(board, core, focusPosition);
    
    // 기보 기록 생성
    const move: GameMove = {
      moveNumber: get().currentMoveIndex + 1,
      player: currentPlayer,
      moveType: 'resonance',
      position: focusPosition,
      previousBoard: board,
      currentBoard: newBoard,
      resonanceInfo: { core, focusPosition, resonancePaths }
    };
    
    // 턴 완료
    completeTurn(move);
  },

  // === UI 액션들 ===
  
  /**
   * 마우스 호버 위치를 설정하는 액션
   * UI에서 마우스가 셀 위에 있을 때 호버 효과를 표시하기 위해 사용
   * 
   * @param position - 호버된 위치 (null이면 호버 해제)
   */
  setHoveredPosition: (position: Position | null) => {
    set({ hoveredPosition: position });
  },

  /**
   * 기보 표시 모드를 토글하는 액션
   * ON/OFF 상태를 전환하여 돌 위에 기보 표시 여부를 제어
   */
  toggleNotationMode: () => {
    const { isNotationMode } = get();
    set({ isNotationMode: !isNotationMode }); // 현재 상태의 반대로 변경
  },

  // === 되돌리기 시스템 액션들 ===
  
  /**
   * 되돌리기 액션 (Ctrl+Z)
   * 게임 상태를 이전 턴으로 되돌림
   * 
   * 동작 방식:
   * 1. 이미 히스토리 모드인 경우: 이전 턴으로 이동
   * 2. 일반 모드인 경우: 히스토리 모드로 전환하고 마지막 턴으로 이동
   */
  undo: () => {
    const { isHistoryMode, historyIndex, moveHistory } = get();
    
    if (isHistoryMode) {
      // 이미 히스토리 모드인 경우 이전 상태로
      if (historyIndex > 0) {
        const targetMove = moveHistory[historyIndex - 1];
        set({
          historyIndex: historyIndex - 1, // 이전 턴으로 이동
          board: targetMove.previousBoard, // 이전 보드 상태로 복원
          currentPlayer: targetMove.player === 'black' ? 'white' : 'black', // 해당 턴의 다음 플레이어
          gamePhase: 'placing', // 돌 배치 단계로 복원
          selectedLShape: null, // 선택 상태 초기화
          selectedCores: [],
          selectedCore: null,
          corePlayer: null
        });
      }
    } else {
      // 일반 모드에서 히스토리 모드로 전환
      if (moveHistory.length > 0) {
        const targetMove = moveHistory[moveHistory.length - 1];
        set({
          isHistoryMode: true, // 히스토리 모드 활성화
          historyIndex: moveHistory.length - 1, // 마지막 턴으로 이동
          board: targetMove.previousBoard, // 마지막 턴 이전 상태로 복원
          currentPlayer: targetMove.player === 'black' ? 'white' : 'black', // 해당 턴의 다음 플레이어
          gamePhase: 'placing', // 돌 배치 단계로 복원
          selectedLShape: null, // 선택 상태 초기화
          selectedCores: [],
          selectedCore: null,
          corePlayer: null
        });
      }
    }
  },

  /**
   * 다시 실행 액션 (Ctrl+Shift+Z)
   * 히스토리 모드에서 다음 상태로 진행
   * 
   * 히스토리 모드에서만 동작하며, 다음 턴의 상태로 보드를 복원
   */
  redo: () => {
    const { isHistoryMode, historyIndex, moveHistory } = get();
    
    if (isHistoryMode && historyIndex < moveHistory.length - 1) {
      const targetMove = moveHistory[historyIndex + 1];
      set({
        historyIndex: historyIndex + 1, // 다음 턴으로 이동
        board: targetMove.currentBoard, // 다음 턴의 보드 상태로 복원
        currentPlayer: targetMove.player === 'black' ? 'white' : 'black', // 해당 턴의 다음 플레이어
        gamePhase: 'placing', // 돌 배치 단계로 복원
        selectedLShape: null, // 선택 상태 초기화
        selectedCores: [],
        selectedCore: null,
        corePlayer: null
      });
    }
  },

  /**
   * 되돌리기 확인 액션
   * 히스토리 모드에서 현재 상태로 게임을 되돌림
   * 
   * 동작 과정:
   * 1. 현재 히스토리 인덱스까지의 턴들만 유지
   * 2. 히스토리 모드 해제
   * 3. 게임 상태를 현재 턴 상태로 복원
   * 4. UI 상태 업데이트
   */
  confirmUndo: () => {
    const { isHistoryMode, historyIndex, moveHistory } = get();
    
    if (isHistoryMode) {
      // 현재 히스토리 상태로 게임 되돌리기
      const targetMove = moveHistory[historyIndex]; // 현재 보고 있는 턴
      const newHistory = moveHistory.slice(0, historyIndex + 1); // 현재 턴까지의 히스토리만 유지
      
      // 현재 턴의 다음 플레이어가 다음 턴을 진행할 플레이어
      const nextPlayer = targetMove.player === 'black' ? 'white' : 'black';
      
      set({
        moveHistory: newHistory, // 히스토리 축소
        currentMoveIndex: historyIndex, // 현재 턴 번호 설정
        currentPlayer: nextPlayer, // 다음 턴을 진행할 플레이어 설정
        isHistoryMode: false, // 히스토리 모드 해제
        historyIndex: 0, // 히스토리 인덱스 초기화
        gamePhase: 'placing', // 돌 배치 단계로 복귀
        selectedLShape: null, // 선택 상태 초기화
        selectedCores: [],
        selectedCore: null,
        corePlayer: null,
        gameStatus: 'playing' // 게임 진행 중 상태로 복원
      });
      
      // 게임 상태 재설정 (UI 상태 동기화)
      get().updateAvailableMoves();
      get().updateConvertibleStones();
      
      // 턴 복원 이벤트 추가
      get().addEvent({
        eventType: 'turn_started',
        player: nextPlayer,
        message: `게임이 ${historyIndex + 1}턴으로 되돌려졌습니다. ${nextPlayer === 'black' ? '흑돌' : '백돌'}의 턴입니다.`
      });
    }
  },

  // === 게임 관리 액션들 ===
  
  /**
   * 게임을 초기 상태로 리셋하는 액션
   * 모든 상태를 초기값으로 되돌림
   * 
   * 새 게임을 시작할 때 사용되며, 모든 상태를 완전히 초기화
   */
  resetGame: () => {
    set({
      // === 기본 게임 상태 초기화 ===
      board: createEmptyBoard(), // 빈 보드 생성
      currentPlayer: 'black', // 흑돌 선공
      gamePhase: 'placing', // 돌 배치 단계
      gameStatus: 'playing', // 게임 진행 중
      
      // === 선택 상태 초기화 ===
      selectedLShape: null,
      selectedCores: [],
      selectedCore: null,
      corePlayer: null,
      hoveredPosition: null,
      
      // === 기보 시스템 초기화 ===
      moveHistory: [], // 히스토리 비우기
      currentMoveIndex: 0, // 턴 번호 초기화
      isNotationMode: false, // 기보 모드 OFF
      
      // === 이벤트 로그 초기화 ===
      eventLog: [], // 이벤트 로그 비우기
      
      // === 되돌리기 시스템 초기화 ===
      isHistoryMode: false, // 히스토리 모드 해제
      historyIndex: 0, // 히스토리 인덱스 초기화
      
      // === UI 상태 초기화 ===
      availableMoves: [],
      convertibleStones: [],
      isAnimating: false
    });
    
    // 초기화 후 상태 업데이트 (비동기로 실행)
    setTimeout(() => {
      get().updateAvailableMoves(); // 배치 가능한 위치들 업데이트
      get().updateConvertibleStones(); // 변환 가능한 돌들 업데이트
      
      // 게임 시작 이벤트 추가
      get().addEvent({
        eventType: 'turn_started',
        player: 'black',
        message: '새로운 게임이 시작되었습니다. 흑돌이 선공입니다.'
      });
    }, 0);
  },

  /**
   * 배치 가능한 위치들을 업데이트하는 액션
   * 빈 칸들을 찾아서 availableMoves 상태를 업데이트
   * 
   * UI에서 배치 가능한 위치를 하이라이트 표시하기 위해 사용
   */
  updateAvailableMoves: () => {
    const { board } = get();
    const emptyPositions: Position[] = [];
    
    // 모든 빈 칸을 찾아서 배열에 추가
    for (let row = 0; row < 17; row++) {
      for (let col = 0; col < 17; col++) {
        if (board[row][col].stoneType === 'empty') {
          emptyPositions.push({ row, col });
        }
      }
    }
    
    set({ availableMoves: emptyPositions });
  },

  /**
   * 변환 가능한 돌들을 업데이트하는 액션
   * 현재 플레이어의 ㄱ자 형태들을 찾아서 convertibleStones 상태를 업데이트
   * 
   * UI에서 변환 가능한 돌을 하이라이트 표시하기 위해 사용
   */
  updateConvertibleStones: () => {
    const { board, currentPlayer } = get();
    const lShapes = detectLShapes(board, currentPlayer); // 현재 플레이어의 ㄱ자들 찾기
    const convertibleStones: Position[] = [];
    
    // 모든 ㄱ자 형태의 돌들을 중복 없이 수집
    lShapes.forEach(lShape => {
      lShape.stones.forEach(stone => {
        // 이미 추가된 위치가 아닌 경우에만 추가 (중복 방지)
        if (!convertibleStones.some(pos => pos.row === stone.row && pos.col === stone.col)) {
          convertibleStones.push(stone);
        }
      });
    });
    
    set({ convertibleStones });
  },

  // === 이벤트 시스템 액션들 ===
  
  /**
   * 게임 이벤트를 로그에 추가하는 액션
   * 게임 진행 상황을 실시간으로 기록
   * 
   * @param event - 추가할 이벤트 정보 (id와 timestamp는 자동 생성)
   */
  addEvent: (event: Omit<GameEvent, 'id' | 'timestamp'>) => {
    const newEvent: GameEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9), // 랜덤 ID 생성
      timestamp: Date.now() // 현재 시간 (밀리초)
    };
    
    // 이벤트 로그에 새 이벤트 추가
    set(state => ({
      eventLog: [...state.eventLog, newEvent]
    }));
  },

  /**
   * 이벤트 로그를 초기화하는 액션
   * 모든 이벤트 기록을 삭제
   */
  clearEventLog: () => {
    set({ eventLog: [] });
  }
}));

// === 헬퍼 함수들 ===

/**
 * 턴을 완료하는 헬퍼 함수
 * 게임 상태를 다음 턴으로 업데이트하고 승리 조건을 확인
 * 
 * 처리 과정:
 * 1. 기보 정보 업데이트
 * 2. 승리 조건 확인
 * 3. 플레이어 전환
 * 4. 게임 상태 업데이트
 * 5. UI 상태 업데이트
 * 6. 턴 전환 이벤트 추가
 * 
 * @param move - 완료된 게임의 한 수 (턴 정보)
 */
function completeTurn(move: GameMove) {
  const { currentPlayer } = useGameStore.getState();
  
  // 기보 정보 업데이트 (돌 위에 표시될 기보 정보 생성)
  const updatedBoard = updateNotation(move);
  
  // 승리 조건 확인 (현재 플레이어가 승리했는지 확인)
  const hasWon = checkWinCondition(updatedBoard, currentPlayer);
  
  // 다음 플레이어 결정 (흑돌 ↔ 백돌 전환)
  const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';
  
  // 게임 상태 업데이트
  useGameStore.setState({
    board: updatedBoard, // 기보 정보가 포함된 보드로 업데이트
    currentPlayer: nextPlayer, // 플레이어 전환
    gamePhase: 'placing', // 돌 배치 단계로 복귀 (기본 상태)
    selectedLShape: null, // 선택 상태 초기화
    selectedCores: [],
    selectedCore: null,
    corePlayer: null,
    moveHistory: [...useGameStore.getState().moveHistory, move], // 히스토리에 추가
    currentMoveIndex: useGameStore.getState().currentMoveIndex + 1, // 턴 번호 증가
    gameStatus: hasWon ? `${currentPlayer}Win` as GameStatus : 'playing' // 승리 여부에 따라 상태 설정
  });
  
  // UI 상태 업데이트 (배치 가능한 위치, 변환 가능한 돌 등)
  useGameStore.getState().updateAvailableMoves();
  useGameStore.getState().updateConvertibleStones();
  
  // 턴 전환 이벤트 추가 (승리하지 않은 경우에만)
  if (!hasWon) {
    useGameStore.getState().addEvent({
      eventType: 'turn_started',
      player: nextPlayer,
      message: `${nextPlayer === 'black' ? '흑돌' : '백돌'}의 턴이 시작되었습니다.`
    });
  }
}

/**
 * 기보 정보를 업데이트하는 헬퍼 함수
 * 게임의 한 수에 대해 해당 턴에 영향을 받은 돌들의 기보 정보만 업데이트
 * 
 * 성능 최적화를 위해 모든 셀을 업데이트하지 않고
 * 해당 턴에 영향을 받은 셀들만 선택적으로 업데이트
 * 
 * @param move - 업데이트할 게임의 한 수 (턴 정보)
 * @returns 기보 정보가 업데이트된 보드
 */
function updateNotation(move: GameMove): BoardCell[][] {
  const { currentBoard } = move;
  const newBoard = JSON.parse(JSON.stringify(currentBoard)) as BoardCell[][]; // 보드 깊은 복사
  
  // 해당 턴에 영향을 받은 위치들만 기보 정보 업데이트
  const affectedPositions: Position[] = [];
  
  // 1. 직접 배치된 돌 (주요 액션 위치)
  affectedPositions.push(move.position);
  
  // 2. ㄱ자 변환으로 영향받은 돌들 (변환 타입인 경우)
  if (move.lShapeInfo) {
    affectedPositions.push(...move.lShapeInfo.lShape.stones); // ㄱ자를 구성하는 모든 돌들
  }
  
  // 3. 공명으로 영향받은 돌들 (공명 타입인 경우)
  if (move.resonanceInfo) {
    const { focusPosition, resonancePaths } = move.resonanceInfo;
    affectedPositions.push(focusPosition); // 초점 요석 위치
    
    // 공명 경로상의 모든 돌들
    resonancePaths.forEach(path => {
      path.forEach(pos => {
        // 중복 제거 (이미 추가된 위치가 아닌 경우에만 추가)
        if (!affectedPositions.some(p => p.row === pos.row && p.col === pos.col)) {
          affectedPositions.push(pos);
        }
      });
    });
  }
  
  // 영향받은 위치들의 기보 정보만 업데이트
  affectedPositions.forEach(pos => {
    const cell = newBoard[pos.row][pos.col];
    if (cell.stoneType !== 'empty') { // 빈 칸이 아닌 경우에만 기보 정보 생성
      const notation = createNotation(move, pos, newBoard); // 기보 정보 생성
      if (notation) {
        // 기존 기보가 있으면 보존하고 새로운 기보를 추가
        if (cell.notation && (move.moveType === 'convert' || move.moveType === 'resonance')) {
          // 변환이나 공명의 경우 기존 기보를 보존
          cell.notation = {
            ...cell.notation,
            secondaryNotation: {
              moveNumber: notation.moveNumber,
              notationType: notation.notationType
            }
          };
          // 공명의 경우 방향 정보도 추가
          if (notation.direction) {
            cell.notation.direction = notation.direction;
          }
        } else {
          // 일반 배치의 경우 새로운 기보로 교체
          cell.notation = notation;
        }
      }
    }
  });
  
  return newBoard;
} 