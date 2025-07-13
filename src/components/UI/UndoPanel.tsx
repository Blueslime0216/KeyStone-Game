/**
 * 되돌리기 패널 컴포넌트
 * 게임 되돌리기 관련 기능들을 아이콘 버튼으로 제공
 * 
 * 기능:
 * - 되돌리기 (Ctrl+Z)
 * - 다시 실행 (Ctrl+Shift+Z)
 * - 되돌리기 확인
 * - 게임 리셋
 */

import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { RotateCcw, RotateCw, RefreshCw, Play } from 'lucide-react';

/**
 * 되돌리기 패널 컴포넌트
 * 게임 되돌리기 관련 기능들을 아이콘 버튼으로 제공
 * 
 * 기능:
 * - 되돌리기 (Ctrl+Z)
 * - 다시 실행 (Ctrl+Shift+Z)
 * - 되돌리기 확인
 * - 게임 리셋
 */
const UndoPanel: React.FC = () => {
  const { 
    undo, 
    redo, 
    confirmUndo, 
    resetGame,
    isHistoryMode,
    moveHistory,
    currentMoveIndex
  } = useGameStore();

  // 되돌리기 가능 여부
  const canUndo = moveHistory.length > 0 && currentMoveIndex > 0;
  
  // 다시 실행 가능 여부
  const canRedo = moveHistory.length > 0 && currentMoveIndex < moveHistory.length;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-center mb-4">되돌리기</h3>
      
      {/* 버튼 그룹 */}
      <div className="flex justify-center gap-2">
        {/* 되돌리기 버튼 */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
            canUndo 
              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
          title="되돌리기 (Ctrl+Z)"
        >
          <RotateCcw size={20} />
        </button>

        {/* 다시 실행 버튼 */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
            canRedo 
              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
          title="다시 실행 (Ctrl+Shift+Z)"
        >
          <RotateCw size={20} />
        </button>

        {/* 되돌리기 확인 버튼 (히스토리 모드에서만 표시) */}
        {isHistoryMode && (
          <button
            onClick={confirmUndo}
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            title="되돌리기 확인"
          >
            <Play size={20} />
          </button>
        )}
      </div>

      {/* 게임 리셋 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={resetGame}
          className="p-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center gap-2"
          title="새 게임 시작"
        >
          <RefreshCw size={16} />
          <span className="text-sm">새 게임</span>
        </button>
      </div>

      {/* 히스토리 모드 표시 */}
      {isHistoryMode && (
        <div className="text-center text-sm text-yellow-300 bg-yellow-900 bg-opacity-30 p-2 rounded-lg">
          히스토리 탐색 모드
        </div>
      )}
    </div>
  );
};

export default UndoPanel; 