/**
 * 게임 보드 컴포넌트
 * 17x17 게임 보드를 렌더링하고 게임의 핵심 인터페이스 제공
 * 
 * 주요 기능:
 * 1. 17x17 보드 렌더링
 * 2. 정사각형 비율 유지
 * 3. 반응형 크기 조정
 * 4. 게임 상태에 따른 시각적 피드백
 * 5. 좌표 라벨 표시 (가로: a~q, 세로: 1~17)
 * 
 * 레이아웃:
 * - 정사각형 비율 유지 (aspect-square)
 * - 화면 크기에 따른 적응형 크기 조정
 * - 중앙 정렬
 * - 좌표 라벨이 보드 주변에 표시
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
 * 5. 좌표 라벨 표시 (가로: a~q, 세로: 1~17)
 * 
 * 레이아웃:
 * - 정사각형 비율 유지 (aspect-square)
 * - 화면 크기에 따른 적응형 크기 조정
 * - 중앙 정렬
 * - 좌표 라벨이 보드 주변에 표시
 */
const GameBoard: React.FC = () => {
  const { board, gameStatus } = useGameStore();

  // 가로 좌표 라벨 (a~q)
  const horizontalLabels = Array.from({ length: 17 }, (_, i) => 
    String.fromCharCode(97 + i) // 'a' = 97, 'b' = 98, ..., 'q' = 113
  );

  // 세로 좌표 라벨 (1~17, 상단이 1, 하단이 17)
  const verticalLabels = Array.from({ length: 17 }, (_, i) => i + 1);

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      {/* 게임 보드 컨테이너 */}
      <div className="game-board-container relative bg-gray-800 rounded-lg shadow-2xl border-4 border-gray-700">
        {/* 좌표 라벨 컨테이너 */}
        <div className="absolute inset-8 flex items-center justify-center">
          {/* 세로 좌표 라벨 (왼쪽) */}
          <div className="absolute -left-6 top-0 bottom-0 w-6 flex flex-col justify-center items-center z-10">
            {verticalLabels.map((label, index) => (
              <div
                key={`v-${label}`}
                className="text-xs font-bold text-gray-300 w-full flex items-center justify-center absolute"
                style={{
                  height: `${100 / 17}%`,
                  fontSize: 'clamp(8px, 1.5vw, 12px)',
                  top: `${(index * 100) / 17}%`
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* 세로 좌표 라벨 (오른쪽) */}
          <div className="absolute -right-6 top-0 bottom-0 w-6 flex flex-col justify-center items-center z-10">
            {verticalLabels.map((label, index) => (
              <div
                key={`v-${label}-right`}
                className="text-xs font-bold text-gray-300 w-full flex items-center justify-center absolute"
                style={{
                  height: `${100 / 17}%`,
                  fontSize: 'clamp(8px, 1.5vw, 12px)',
                  top: `${(index * 100) / 17}%`
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* 가로 좌표 라벨 (위쪽) */}
          <div className="absolute -top-6 left-0 right-0 h-6 flex justify-center items-center z-10">
            {horizontalLabels.map((label, index) => (
              <div
                key={`h-${label}`}
                className="text-xs font-bold text-gray-300 h-full flex items-center justify-center absolute"
                style={{
                  width: `${100 / 17}%`,
                  fontSize: 'clamp(8px, 1.5vw, 12px)',
                  left: `${(index * 100) / 17}%`
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* 가로 좌표 라벨 (아래쪽) */}
          <div className="absolute -bottom-6 left-0 right-0 h-6 flex justify-center items-center z-10">
            {horizontalLabels.map((label, index) => (
              <div
                key={`h-${label}-bottom`}
                className="text-xs font-bold text-gray-300 h-full flex items-center justify-center absolute"
                style={{
                  width: `${100 / 17}%`,
                  fontSize: 'clamp(8px, 1.5vw, 12px)',
                  left: `${(index * 100) / 17}%`
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* 보드 그리드 */}
        <div className="absolute inset-8 grid grid-cols-17 grid-rows-17 bg-gray-600 rounded">
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