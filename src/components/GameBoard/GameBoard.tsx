/**
 * 게임 보드 컴포넌트
 * 17x17 게임 보드를 렌더링하고 게임의 핵심 인터페이스 제공
 * 
 * 주요 기능:
 * 1. 17x17 보드 렌더링
 * 2. 정사각형 비율 유지
 * 3. 반응형 크기 조정
 * 4. 게임 상태에 따른 시각적 피드백
 * 
 * 레이아웃:
 * - 정사각형 비율 유지 (aspect-square)
 * - 최대 크기 제한 (max-w-4xl)
 * - 중앙 정렬
 */

import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import BoardCell from './BoardCell';
import { BOARD_SIZE } from '../../utils/gameLogic';

/**
 * 게임 보드 컴포넌트
 * 17x17 게임 보드를 렌더링하고 게임의 핵심 인터페이스 제공
 * 
 * 주요 기능:
 * 1. 17x17 보드 렌더링
 * 2. 정사각형 비율 유지
 * 3. 반응형 크기 조정
 * 4. 게임 상태에 따른 시각적 피드백
 * 
 * 레이아웃:
 * - 정사각형 비율 유지 (aspect-square)
 * - 최대 크기 제한 (max-w-4xl)
 * - 중앙 정렬
 */
const GameBoard: React.FC = () => {
  const { board, gameStatus } = useGameStore();

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* 게임 보드 컨테이너 */}
      <div className="relative w-full aspect-square max-w-4xl bg-gray-800 rounded-lg shadow-2xl border-4 border-gray-700">
        {/* 보드 그리드 */}
        <div className="absolute inset-4 grid grid-cols-17 grid-rows-17 gap-0.5 bg-gray-600 rounded">
          {/* 각 셀 렌더링 */}
          {board.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              <BoardCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                position={{ row: rowIndex, col: colIndex }}
              />
            ))
          )}
        </div>

        {/* 게임 오버 오버레이 */}
        {gameStatus !== 'playing' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white text-center">
              <div className="text-2xl font-bold mb-2">
                {gameStatus === 'blackWin' ? '흑돌 승리!' : '백돌 승리!'}
              </div>
              <div className="text-lg">
                게임이 종료되었습니다
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard; 