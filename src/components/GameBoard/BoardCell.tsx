/**
 * 보드 셀 컴포넌트
 * 게임 보드의 개별 셀을 렌더링하고 사용자 상호작용을 처리
 * 
 * 기능:
 * - 돌 배치, 호버 효과, 변환 가능한 돌 표시
 * - 게임 단계에 따른 다양한 클릭 동작 처리
 * - 시각적 피드백 제공 (하이라이트, 링 효과 등)
 * 
 * 게임 단계별 동작:
 * - placing: 빈 셀 클릭 시 돌 배치
 * - resonating: 코어 내부 돌 클릭 시 코어 선택
 * - selectingFocus: 코어 내부 돌 클릭 시 초점 요석 선택
 */

import React from 'react';
import { BoardCell as BoardCellType, Position } from '../../types/gameTypes';
import Stone from './Stone';
import { useGameStore } from '../../stores/gameStore';

/**
 * 보드 셀 컴포넌트의 Props 인터페이스
 * 
 * @param cell - 셀의 데이터 (돌 정보, 기보 정보, 상태 플래그 등)
 * @param position - 셀의 위치 (행, 열 좌표)
 */
interface BoardCellProps {
  cell: BoardCellType;
  position: Position;
}

/**
 * 게임 보드의 개별 셀을 렌더링하는 컴포넌트
 * 
 * 주요 기능:
 * 1. 돌 배치: 빈 셀에 전도석 배치
 * 2. 코어 선택: 공명 모드에서 코어 내부 돌 클릭 시 코어 선택
 * 3. 초점 선택: 초점 선택 모드에서 돌 클릭 시 초점 요석 선택
 * 4. 시각적 피드백: 호버 효과, 하이라이트, 링 효과 등
 * 
 * @param cell - 셀 데이터 (돌 종류, 기보 정보, 상태 플래그)
 * @param position - 셀 위치 (행, 열)
 * @returns JSX.Element - 개별 셀 UI
 */
const BoardCellComponent: React.FC<BoardCellProps> = ({ cell, position }) => {
  // 게임 스토어에서 필요한 상태와 액션들을 가져옴
  const { 
    placeStone,           // 돌 배치 액션
    setHoveredPosition,   // 호버 위치 설정 액션
    hoveredPosition,      // 현재 호버된 위치
    availableMoves,       // 배치 가능한 위치들
    convertibleStones,    // 변환 가능한 돌들
    isNotationMode,       // 기보 표시 모드
    selectedCores,        // 선택 가능한 코어들
    selectedCore,         // 현재 선택된 코어
    gamePhase,            // 현재 게임 단계
    selectCore,           // 코어 선택 액션
    selectFocusPosition   // 초점 요석 선택 액션
  } = useGameStore();

  // === 상태 확인 함수들 ===
  
  /**
   * 현재 셀이 돌을 배치할 수 있는 위치인지 확인
   * availableMoves 배열에 현재 위치가 포함되어 있는지 검사
   */
  const isAvailable = availableMoves.some(
    pos => pos.row === position.row && pos.col === position.col
  );
  
  /**
   * 현재 셀의 돌이 변환 가능한지 확인 (ㄱ자 형태의 돌)
   * convertibleStones 배열에 현재 위치가 포함되어 있는지 검사
   */
  const isConvertible = convertibleStones.some(
    pos => pos.row === position.row && pos.col === position.col
  );
  
  /**
   * 현재 셀이 마우스 호버 상태인지 확인
   * hoveredPosition과 현재 위치가 일치하는지 검사
   */
  const isHovered = hoveredPosition && 
    hoveredPosition.row === position.row && 
    hoveredPosition.col === position.col;

  // === 코어 관련 상태 확인 ===
  
  /**
   * 현재 셀이 선택 가능한 코어 내부에 있는지 확인
   * selectedCores 배열의 모든 코어를 검사하여 현재 위치가 포함되어 있는지 확인
   */
  const isInCore = selectedCores.some(core => 
    core.positions.some(pos => pos.row === position.row && pos.col === position.col)
  );
  
  /**
   * 현재 셀이 선택된 코어 내부에 있는지 확인
   * selectedCore가 존재하고 그 코어에 현재 위치가 포함되어 있는지 확인
   */
  const isSelectedCore = selectedCore && 
    selectedCore.positions.some(pos => pos.row === position.row && pos.col === position.col);
  
  /**
   * 현재 셀이 초점 요석 후보인지 확인
   * 초점 선택 모드이고 선택된 코어 내부에 있는지 확인
   */
  const isFocusCandidate = gamePhase === 'selectingFocus' && isSelectedCore;

  // === 이벤트 핸들러들 ===
  
  /**
   * 셀 클릭 이벤트 핸들러
   * 게임 단계와 셀 상태에 따라 다양한 동작을 수행
   * 
   * 동작 조건:
   * 1. 돌 배치 단계에서 빈 셀이고 배치 가능한 위치인 경우: 돌 배치
   * 2. 공명 모드에서 코어 내부의 돌인 경우: 코어 선택
   * 3. 초점 선택 모드에서 코어 내부의 돌인 경우: 초점 요석 선택
   */
  const handleClick = () => {
    if (gamePhase === 'placing' && cell.stoneType === 'empty' && isAvailable) {
      // 돌 배치 단계에서만 빈 셀에 돌 배치 가능
      placeStone(position);
    } else if (gamePhase === 'resonating' && cell.stoneType !== 'empty') {
      // 공명 모드에서 코어 내부의 돌을 클릭하면 코어 선택
      const core = selectedCores.find(core => 
        core.positions.some(pos => pos.row === position.row && pos.col === position.col)
      );
      if (core) {
        selectCore(core);
      }
    } else if (gamePhase === 'selectingFocus' && cell.stoneType !== 'empty') {
      // 초점 요석 선택 모드에서 코어 내부의 돌을 클릭하면 초점 선택
      if (selectedCore && selectedCore.positions.some(pos => pos.row === position.row && pos.col === position.col)) {
        selectFocusPosition(position);
      }
    }
  };

  /**
   * 셀 호버 이벤트 핸들러
   * 돌 배치 단계에서 빈 셀이고 배치 가능한 위치인 경우에만 호버 상태 설정
   * 
   * 호버 효과는 돌 배치 단계에서 배치 가능한 빈 셀에서만 표시됨
   */
  const handleHover = () => {
    if (gamePhase === 'placing' && cell.stoneType === 'empty' && isAvailable) {
      setHoveredPosition(position);
    }
  };

  /**
   * 셀에서 마우스가 벗어날 때 호출되는 핸들러
   * 호버 상태를 해제하여 호버 효과를 제거
   */
  const handleLeave = () => {
    setHoveredPosition(null);
  };

  return (
    // === 셀 컨테이너 ===
    // 셀의 기본 스타일과 상태에 따른 조건부 스타일링
    <div
      className={`
        relative w-8 h-8 bg-cell-dark border border-gray-600
        ${gamePhase === 'placing' && isAvailable ? 'hover:bg-cell-hover cursor-pointer' : ''}  // 돌 배치 단계에서만 호버 효과 + 커서
        ${isHovered ? 'bg-cell-hover' : ''}                         // 호버 중인 셀: 배경색 변경
        ${isInCore ? 'ring-2 ring-yellow-400' : ''}                 // 코어 내부: 노란색 링
        ${isSelectedCore ? 'ring-2 ring-orange-400' : ''}           // 선택된 코어: 주황색 링
      `}
      onClick={handleClick}      // 클릭 이벤트 핸들러
      onMouseEnter={handleHover} // 마우스 진입 이벤트 핸들러
      onMouseLeave={handleLeave} // 마우스 이탈 이벤트 핸들러
    >
      {/* 
        === 호버 시 투명 돌 표시 ===
        빈 셀에 호버했을 때 배치될 돌의 미리보기를 표시
        - 조건: 빈 셀이고 호버 중이고 배치 가능한 위치
        - 스타일: 반투명한 회색 원형
      */}
      {cell.stoneType === 'empty' && isHovered && isAvailable && (
        <div
          className="absolute inset-1 rounded-full bg-gray-400 opacity-30"
        />
      )}
      
      {/* 
        === 돌 렌더링 ===
        셀에 돌이 있는 경우 Stone 컴포넌트로 렌더링
        - type: 돌의 종류 (전도석/요석, 흑돌/백돌)
        - position: 돌의 위치
        - isHighlighted: 하이라이트 상태
        - isConvertible: 변환 가능한 상태
        - isResonating: 공명 중인 상태
        - isFocusCandidate: 초점 요석 후보 상태
        - notation: 기보 정보 (기보 모드가 활성화된 경우에만)
      */}
      {cell.stoneType !== 'empty' && (
        <Stone
          type={cell.stoneType}
          position={position}
          isHighlighted={cell.isHighlighted}
          isConvertible={isConvertible}
          isResonating={cell.isResonating}
          isFocusCandidate={isFocusCandidate}
          notation={isNotationMode ? cell.notation : undefined}
        />
      )}
      

    </div>
  );
};

export default BoardCellComponent; 