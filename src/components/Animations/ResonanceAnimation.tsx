import React from 'react';
import { Position } from '../../types/gameTypes';

/**
 * 공명 애니메이션 컴포넌트의 Props 인터페이스
 * @param paths - 공명 파동이 전파되는 경로들의 배열 (4방향)
 * @param onComplete - 애니메이션 완료 시 호출될 콜백 함수
 */
interface ResonanceAnimationProps {
  paths: Position[][];
  onComplete?: () => void;
}

/**
 * 공명 활성화 시 파동이 전파되는 애니메이션 컴포넌트
 * 4방향(상하좌우)으로 파동이 순차적으로 전파되는 효과를 표현
 */
const ResonanceAnimation: React.FC<ResonanceAnimationProps> = ({ paths, onComplete }) => {
  return (
    <>
      {/* 각 방향별 공명 파동 애니메이션 */}
      {paths.map((path, pathIndex) => (
        <div
          key={pathIndex}
          className="absolute pointer-events-none"
        >
          {/* 각 경로의 위치별 파동 효과 */}
          {path.map((pos, index) => (
            <div
              key={`${pathIndex}-${index}`}
              className="absolute w-8 h-8 bg-resonance-blue rounded-full"
              style={{
                // 보드 셀 크기에 맞춰 위치 계산 (32px = 8 * 4)
                left: `${pos.col * 32}px`,
                top: `${pos.row * 32}px`
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default ResonanceAnimation; 