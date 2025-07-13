/**
 * 에테르가르드 게임의 모든 타입 정의
 * 게임의 핵심 데이터 구조와 상태를 TypeScript로 정의
 */

/** 
 * 플레이어 타입 - 흑돌(선공) 또는 백돌(후공)
 * 흑돌이 항상 선공이며, 백돌이 후공
 */
export type Player = 'black' | 'white';

/** 
 * 돌의 종류 - 빈 칸, 전도석, 요석
 * empty: 빈 칸 (돌이 없는 상태)
 * blackConduit/whiteConduit: 전도석 (기본 돌, 배치 가능)
 * blackKeystone/whiteKeystone: 요석 (변환된 돌, 승리 조건에 사용)
 */
export type StoneType = 'empty' | 'blackConduit' | 'whiteConduit' | 'blackKeystone' | 'whiteKeystone';

/** 
 * 게임 진행 단계 - 돌 배치, 변환, 공명 활성화
 * placing: 돌 배치 단계 (기본 상태)
 * converting: ㄱ자 변환 단계 (ㄱ자 선택 후)
 * resonating: 공명 활성화 단계 (코어 완성 후)
 * selectingFocus: 초점 요석 선택 단계 (코어 선택 후)
 */
export type GamePhase = 'placing' | 'converting' | 'resonating' | 'selectingFocus';

/** 
 * 게임 상태 - 진행 중, 승리, 무승부
 * playing: 게임 진행 중
 * blackWin/whiteWin: 해당 플레이어 승리
 * draw: 무승부 (현재 구현에서는 사용되지 않음)
 */
export type GameStatus = 'playing' | 'blackWin' | 'whiteWin' | 'draw';

/** 
 * 방향 타입 - 공명 파동 전파 방향
 * 공명 활성화 시 초점 요석에서 4방향으로 파동이 전파됨
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** 
 * 기보 표기 타입 - 일반, 초점, 공명, 변환
 * normal: 일반 돌 배치 (숫자만 표시)
 * focus: 초점 요석 (숫자 + + 표시)
 * resonance: 공명 변환 (숫자 + 화살표 표시)
 * conversion: 요석 변환 (숫자 + • 표시)
 */
export type NotationType = 'normal' | 'focus' | 'resonance' | 'conversion';

/** 
 * 보드 상의 위치를 나타내는 인터페이스
 * 17x17 보드에서 각 셀의 위치를 0-16 범위의 행/열로 표현
 */
export interface Position {
  row: number; // 행 번호 (0-16, 위에서 아래로)
  col: number; // 열 번호 (0-16, 왼쪽에서 오른쪽으로)
}

/** 
 * 게임 보드의 각 셀을 나타내는 인터페이스
 * 보드의 각 칸에 대한 모든 정보를 담고 있음
 */
export interface BoardCell {
  position: Position;           // 셀의 위치 (행, 열)
  stoneType: StoneType;        // 돌의 종류 (빈 칸, 전도석, 요석)
  isHighlighted: boolean;      // 하이라이트 상태 (선택 가능한 위치 표시)
  isConvertible: boolean;      // 변환 가능한 상태 (ㄱ자 형태의 돌 표시)
  isResonating: boolean;       // 공명 중인 상태 (공명 파동 애니메이션용)
  notation?: NotationInfo;     // 기보 정보 (기보 모드에서 표시, 선택적)
}

/** 
 * 기보 정보를 나타내는 인터페이스
 * 각 돌에 표시되는 기보 표기법 정보
 * 요석으로 변환된 돌은 두 개의 기보를 가질 수 있음 (배치 기보 + 변환 기보)
 */
export interface NotationInfo {
  moveNumber: number;      // 몇 번째 턴인지 (1부터 시작)
  notationType: NotationType; // 기보 표기 타입 (일반/초점/공명/변환)
  direction?: Direction;   // 공명 방향 (공명 타입일 때만 사용)
  secondaryNotation?: {    // 두 번째 기보 (요석 변환 시 추가)
    moveNumber: number;    // 변환 턴 번호
    notationType: NotationType; // 변환 기보 타입
  };
}

/** 
 * ㄱ자 형태를 나타내는 인터페이스
 * 3개의 전도석이 ㄱ 또는 ㄴ 모양을 이루는 구조
 */
export interface LShape {
  stones: Position[];      // ㄱ자를 구성하는 3개 돌의 위치 배열
  type: 'L' | 'reverseL';  // ㄱ자 형태 타입 (L: ㄱ, reverseL: ㄴ)
}

/** 
 * 코어(2x2 정사각형)를 나타내는 인터페이스
 * 같은 플레이어의 돌 4개가 2x2 정사각형을 이루는 구조
 */
export interface Core {
  positions: Position[];   // 코어를 구성하는 4개 위치 배열
  stones: BoardCell[];     // 코어를 구성하는 4개 셀 객체 배열
}

/** 
 * 게임 이벤트 타입
 * 게임 진행 중 발생하는 모든 이벤트의 종류
 */
export type GameEventType = 
  'stone_placed' |      // 돌 배치
  'core_formed' |       // 코어 완성
  'resonance_activated' | // 공명 활성화
  'stone_converted' |   // 돌 변환
  'lshape_detected' |   // ㄱ자 감지
  'turn_started';       // 턴 시작

/** 
 * 게임 이벤트를 나타내는 인터페이스
 * 이벤트 로그에 기록되는 각 이벤트의 정보
 */
export interface GameEvent {
  id: string;                  // 고유 ID (자동 생성)
  timestamp: number;           // 발생 시간 (밀리초)
  eventType: GameEventType;    // 이벤트 타입
  player: Player;              // 관련 플레이어
  message: string;             // 표시할 메시지 (사용자에게 보여줄 텍스트)
  details?: {                  // 추가 정보 (선택적)
    position?: Position;       // 위치 정보 (돌 배치, 변환 등)
    core?: Core;               // 코어 정보 (코어 완성, 공명 등)
    resonancePaths?: Position[][]; // 공명 경로 (공명 활성화 시)
    convertedStones?: Position[]; // 변환된 돌들 (변환 이벤트 시)
    lShape?: LShape;           // ㄱ자 정보 (ㄱ자 감지 시)
  };
}

/** 
 * 게임의 한 수를 나타내는 인터페이스 (히스토리용)
 * 되돌리기 시스템에서 사용되는 각 턴의 완전한 정보
 */
export interface GameMove {
  moveNumber: number;           // 턴 번호 (1부터 시작)
  player: Player;              // 해당 턴의 플레이어
  moveType: 'place' | 'convert' | 'resonance'; // 액션 타입
  position: Position;          // 액션이 발생한 위치 (주요 액션 위치)
  previousBoard: BoardCell[][]; // 이전 보드 상태 (되돌리기용)
  currentBoard: BoardCell[][];  // 현재 보드 상태 (다시 실행용)
  resonanceInfo?: {            // 공명 정보 (공명 타입일 때만)
    core: Core;                // 완성된 코어
    focusPosition: Position;   // 초점 요석 위치
    resonancePaths: Position[][]; // 공명 파동 경로들 (4방향)
  };
  lShapeInfo?: {               // ㄱ자 변환 정보 (변환 타입일 때만)
    lShape: LShape;            // 변환된 ㄱ자
    convertedStoneIndex: number; // 변환된 돌의 인덱스 (0-2)
  };
}

/** 
 * 전체 게임 상태를 나타내는 인터페이스
 * Zustand 스토어에서 관리하는 모든 게임 상태
 */
export interface GameState {
  // === 기본 게임 상태 ===
  board: BoardCell[][];        // 17x17 게임 보드 (모든 셀 정보)
  currentPlayer: Player;       // 현재 플레이어 (흑돌/백돌)
  gamePhase: GamePhase;        // 게임 진행 단계
  gameStatus: GameStatus;      // 게임 상태 (진행/승리/무승부)
  
  // === 선택 상태 ===
  selectedLShape: LShape | null;  // 선택된 ㄱ자 형태 (변환 모드에서)
  selectedCores: Core[];          // 선택 가능한 코어들 (공명 모드에서)
  selectedCore: Core | null;      // 현재 선택된 코어 (초점 선택 모드에서)
  corePlayer: Player | null;      // 코어를 만든 플레이어 (공명 활성화용)
  hoveredPosition: Position | null; // 마우스 호버 위치 (UI 피드백용)
  
  // === 기보 시스템 ===
  moveHistory: GameMove[];     // 게임 히스토리 (모든 턴의 정보)
  currentMoveIndex: number;    // 현재 턴 번호 (0부터 시작)
  isNotationMode: boolean;     // 기보 표시 모드 (ON/OFF)
  
  // === 이벤트 로그 시스템 ===
  eventLog: GameEvent[];       // 게임 이벤트 로그 (실시간 진행 상황)
  
  // === 되돌리기 시스템 ===
  isHistoryMode: boolean;      // 히스토리 탐색 모드 (되돌리기 중인지)
  historyIndex: number;        // 히스토리 인덱스 (현재 보고 있는 턴)
  
  // === UI 상태 ===
  availableMoves: Position[];  // 배치 가능한 위치들 (빈 칸들)
  convertibleStones: Position[]; // 변환 가능한 돌들 (ㄱ자 형태의 돌들)
  isAnimating: boolean;        // 애니메이션 진행 중 여부 (애니메이션 제어용)
} 