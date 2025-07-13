import React from 'react';
import { useGameStore } from '../../stores/gameStore';

/**
 * 승리 모달 컴포넌트
 * 게임이 끝났을 때 승리자를 표시하고 새 게임 시작 옵션을 제공
 */
const WinModal: React.FC = () => {
  // 게임 스토어에서 게임 상태와 리셋 액션을 가져옴
  const { gameStatus, resetGame } = useGameStore();

  // 승리 상태일 때만 모달을 표시
  const isVisible = gameStatus === 'blackWin' || gameStatus === 'whiteWin';

  /**
   * 승리자 텍스트를 반환하는 함수
   * @returns 승리자 텍스트
   */
  const getWinnerText = () => {
    switch (gameStatus) {
      case 'blackWin':
        return '흑돌 승리!';
      case 'whiteWin':
        return '백돌 승리!';
      default:
        return '';
    }
  };

  /**
   * 승리자 색상을 반환하는 함수
   * @returns Tailwind CSS 색상 클래스
   */
  const getWinnerColor = () => {
    return gameStatus === 'blackWin' ? 'text-black' : 'text-white';
  };

  return (
    <>
      {isVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center"
          >
            <h2 className={`text-4xl font-bold mb-4 ${getWinnerColor()}`}>
              {getWinnerText()}
            </h2>
            <p className="text-gray-300 mb-6">
              요석 5개를 일렬로 연결하여 승리했습니다!
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              새 게임 시작
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WinModal; 