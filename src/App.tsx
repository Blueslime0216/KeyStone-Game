/**
 * 에테르가르드 메인 애플리케이션 컴포넌트
 * 
 * PC와 모바일 모두 대응하는 반응형 레이아웃:
 * - PC: 좌측 패널 + 중앙 게임보드 + 우측 이벤트로그
 * - 모바일: 하단 버튼으로 패널 토글 가능
 * 
 * 주요 기능:
 * 1. 반응형 레이아웃 (PC/모바일 자동 감지)
 * 2. 모바일에서 패널 토글 시스템
 * 3. 게임 상태에 따른 UI 업데이트
 * 4. 승리 모달 표시
 * 5. 키보드 단축키 지원
 */
import React, { useState, useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import GameBoard from './components/GameBoard/GameBoard';
import GameInfo from './components/UI/GameInfo';
import EventLog from './components/UI/EventLog';
import NotationPanel from './components/UI/NotationPanel';
import UndoPanel from './components/UI/UndoPanel';
import WinModal from './components/UI/WinModal';
import { useKeyboard } from './hooks/useKeyboard';
import { 
  Info, 
  History, 
  RotateCcw, 
  RotateCw, 
  Settings, 
  X,
  Menu
} from 'lucide-react';

/**
 * 에테르가르드 메인 애플리케이션 컴포넌트
 * 
 * PC와 모바일 모두 대응하는 반응형 레이아웃:
 * - PC: 좌측 패널 + 중앙 게임보드 + 우측 이벤트로그
 * - 모바일: 하단 버튼으로 패널 토글 가능
 * 
 * 주요 기능:
 * 1. 반응형 레이아웃 (PC/모바일 자동 감지)
 * 2. 모바일에서 패널 토글 시스템
 * 3. 게임 상태에 따른 UI 업데이트
 * 4. 승리 모달 표시
 */
const App: React.FC = () => {
  // 키보드 단축키 처리 훅 초기화
  useKeyboard();

  // 게임 스토어에서 필요한 상태들 가져오기
  const { 
    gameStatus, 
    currentPlayer, 
    gamePhase, 
    isNotationMode,
    resetGame,
    toggleNotationMode,
    updateAvailableMoves,
    updateConvertibleStones
  } = useGameStore();

  // 모바일 패널 상태 관리
  const [mobilePanel, setMobilePanel] = useState<'none' | 'info' | 'log' | 'notation' | 'undo'>('none');
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지 및 모바일 여부 설정
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 게임 상태 업데이트
  useEffect(() => {
    updateAvailableMoves();
    updateConvertibleStones();
  }, [updateAvailableMoves, updateConvertibleStones]);

  // 모바일 패널 닫기
  const closeMobilePanel = () => {
    setMobilePanel('none');
  };

  // 모바일 패널 토글
  const toggleMobilePanel = (panel: typeof mobilePanel) => {
    setMobilePanel(mobilePanel === panel ? 'none' : panel);
  };

  // PC 레이아웃
  if (!isMobile) {
    return (
      <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
        {/* 좌측 패널 */}
        <div className="w-80 bg-gray-800 p-4 flex flex-col gap-4 overflow-hidden">
          {/* 게임 정보 */}
          <div className="bg-gray-700 rounded-lg p-4 flex-shrink-0">
            <GameInfo />
          </div>

          {/* 기보 설정 */}
          <div className="bg-gray-700 rounded-lg p-4 flex-shrink-0">
            <NotationPanel />
          </div>

          {/* 되돌리기 */}
          <div className="bg-gray-700 rounded-lg p-4 flex-shrink-0">
            <UndoPanel />
          </div>
        </div>

        {/* 중앙 게임보드 */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              <GameBoard />
            </div>
          </div>
        </div>

        {/* 우측 이벤트 로그 */}
        <div className="w-80 bg-gray-800 p-4 flex flex-col overflow-hidden">
          <div className="bg-gray-700 rounded-lg p-4 h-full min-h-0 overflow-hidden">
            <EventLog />
          </div>
        </div>

        {/* 승리 모달 */}
        {gameStatus !== 'playing' && <WinModal />}
      </div>
    );
  }

  // 모바일 레이아웃
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* 메인 게임 영역 */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <GameBoard />
          </div>
        </div>

        {/* 모바일 패널 오버레이 */}
        {mobilePanel !== 'none' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end overflow-hidden">
            <div className="w-full bg-gray-800 rounded-t-lg max-h-96 overflow-hidden flex flex-col">
              {/* 패널 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-600 flex-shrink-0">
                <h3 className="font-semibold">
                  {mobilePanel === 'info' && '게임 정보'}
                  {mobilePanel === 'log' && '게임 로그'}
                  {mobilePanel === 'notation' && '기보 설정'}
                  {mobilePanel === 'undo' && '되돌리기'}
                </h3>
                <button
                  onClick={closeMobilePanel}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 패널 내용 */}
              <div className="p-4 overflow-y-auto flex-1 min-h-0">
                {mobilePanel === 'info' && <GameInfo />}
                {mobilePanel === 'log' && <EventLog />}
                {mobilePanel === 'notation' && <NotationPanel />}
                {mobilePanel === 'undo' && <UndoPanel />}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 바 */}
      <div className="bg-gray-800 p-4 flex-shrink-0">
        <div className="flex justify-around items-center">
          <button
            onClick={() => toggleMobilePanel('info')}
            className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
              mobilePanel === 'info' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Info size={20} />
            <span className="text-xs">정보</span>
          </button>

          <button
            onClick={() => toggleMobilePanel('log')}
            className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
              mobilePanel === 'log' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <History size={20} />
            <span className="text-xs">로그</span>
          </button>

          <button
            onClick={() => toggleMobilePanel('notation')}
            className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
              mobilePanel === 'notation' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Settings size={20} />
            <span className="text-xs">설정</span>
          </button>

          <button
            onClick={() => toggleMobilePanel('undo')}
            className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
              mobilePanel === 'undo' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <RotateCcw size={20} />
            <span className="text-xs">되돌리기</span>
          </button>
        </div>
      </div>

      {/* 승리 모달 */}
      {gameStatus !== 'playing' && <WinModal />}
    </div>
  );
};

export default App; 