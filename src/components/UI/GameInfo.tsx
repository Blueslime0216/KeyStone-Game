/**
 * 게임 정보 표시 컴포넌트
 * 현재 플레이어와 게임 단계를 간략하게 표시
 * 
 * 표시 정보:
 * - 현재 플레이어 (흑돌/백돌)
 * - 게임 단계 (돌 배치, 변환, 공명 등)
 * - 게임 상태 (진행 중, 승리 등)
 */
import React from 'react';
import { useGameStore } from '../../stores/gameStore';

/**
 * 게임 정보 표시 컴포넌트
 * 현재 플레이어와 게임 단계를 간략하게 표시
 * 
 * 표시 정보:
 * - 현재 플레이어 (흑돌/백돌)
 * - 게임 단계 (돌 배치, 변환, 공명 등)
 * - 게임 상태 (진행 중, 승리 등)
 */
const GameInfo: React.FC = () => {
  const { currentPlayer, gamePhase, gameStatus, currentMoveIndex } = useGameStore();

  // 게임 단계 텍스트 변환
  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'placing': return '돌 배치';
      case 'converting': return 'ㄱ자 변환';
      case 'resonating': return '코어 선택';
      case 'selectingFocus': return '초점 선택';
      default: return phase;
    }
  };

  // 플레이어 텍스트 변환
  const getPlayerText = (player: string) => {
    return player === 'black' ? '흑돌' : '백돌';
  };

  // 게임 상태 텍스트 변환
  const getStatusText = (status: string) => {
    if (status === 'playing') return '진행 중';
    if (status.includes('Win')) {
      const winner = status.replace('Win', '');
      return `${getPlayerText(winner)} 승리`;
    }
    return status;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-center mb-4">게임 정보</h3>
      
      {/* 현재 플레이어 */}
      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
        <span className="text-sm text-gray-300">현재 플레이어</span>
        <span className={`font-semibold ${currentPlayer === 'black' ? 'text-gray-200' : 'text-gray-100'}`}>
          {getPlayerText(currentPlayer)}
        </span>
      </div>

      {/* 게임 단계 */}
      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
        <span className="text-sm text-gray-300">게임 단계</span>
        <span className="font-semibold text-blue-300">
          {getPhaseText(gamePhase)}
        </span>
      </div>

      {/* 게임 상태 */}
      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
        <span className="text-sm text-gray-300">게임 상태</span>
        <span className={`font-semibold ${
          gameStatus === 'playing' ? 'text-green-300' : 'text-yellow-300'
        }`}>
          {getStatusText(gameStatus)}
        </span>
      </div>

      {/* 턴 번호 */}
      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
        <span className="text-sm text-gray-300">턴</span>
        <span className="font-semibold text-purple-300">
          {currentMoveIndex + 1}
        </span>
      </div>
    </div>
  );
};

export default GameInfo; 