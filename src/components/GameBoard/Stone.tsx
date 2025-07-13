/**
 * 돌 컴포넌트
 * 게임 보드의 개별 돌을 렌더링하고 다양한 시각적 효과를 제공
 * 
 * 기능:
 * - 전도석/요석, 흑돌/백돌의 시각적 표현
 * - 상태에 따른 다양한 시각적 효과 (하이라이트, 링, 애니메이션)
 * - 기보 표시 (기보 모드가 활성화된 경우)
 * 
 * 돌의 종류:
 * - blackConduit: 흑돌 전도석 (○)
 * - whiteConduit: 백돌 전도석 (●)
 * - blackKeystone: 흑돌 요석 (□)
 * - whiteKeystone: 백돌 요석 (■)
 */

import React from 'react';
import { StoneType, Position, NotationInfo } from '../../types/gameTypes';
import { getNotationText, getNotationColor } from '../../utils/notationUtils';

/**
 * 돌 컴포넌트의 Props 인터페이스
 * 
 * @param type - 돌의 종류 (전도석/요석, 흑돌/백돌)
 * @param position - 돌의 위치 (행, 열 좌표)
 * @param isHighlighted - 하이라이트 상태 여부
 * @param isConvertible - 변환 가능한 상태 여부 (ㄱ자 형태)
 * @param isResonating - 공명 중인 상태 여부
 * @param isFocusCandidate - 초점 요석 후보 상태 여부
 * @param notation - 기보 정보 (기보 모드에서 표시)
 */
interface StoneProps {
  type: StoneType;
  position: Position;
  isHighlighted?: boolean;
  isConvertible?: boolean;
  isResonating?: boolean;
  isFocusCandidate?: boolean;
  notation?: NotationInfo;
}

/**
 * 게임 보드의 개별 돌을 렌더링하는 컴포넌트
 * 
 * 렌더링 과정:
 * 1. 돌의 종류에 따라 기본 스타일 결정
 * 2. 상태에 따른 추가 시각적 효과 적용
 * 3. 기보 정보가 있으면 돌 위에 표시
 * 
 * 시각적 효과:
 * - 하이라이트: 밝은 테두리
 * - 변환 가능: 녹색 링
 * - 공명 중: 파란색 링 + 애니메이션
 * - 초점 후보: 주황색 링
 * 
 * @param type - 돌의 종류
 * @param position - 돌의 위치
 * @param isHighlighted - 하이라이트 상태
 * @param isConvertible - 변환 가능한 상태
 * @param isResonating - 공명 중인 상태
 * @param isFocusCandidate - 초점 요석 후보 상태
 * @param notation - 기보 정보
 * @returns JSX.Element - 돌 UI
 */
const Stone: React.FC<StoneProps> = ({
  type,
  position,
  isHighlighted = false,
  isConvertible = false,
  isResonating = false,
  isFocusCandidate = false,
  notation
}) => {
  // === 돌의 기본 스타일 결정 ===
  
  /**
   * 돌의 기본 스타일을 결정하는 함수
   * 돌의 종류(전도석/요석, 흑돌/백돌)에 따라 색상과 모양을 결정
   * 
   * @returns 기본 스타일 클래스 문자열
   */
  const getBaseStyle = (): string => {
    const isConduit = type.includes('Conduit');
    const isKeystone = type.includes('Keystone');
    
    let baseStyle = '';
    
    // 모양 결정: 전도석은 원형, 요석은 약간 둥근 사각형
    if (isConduit) {
      baseStyle += 'rounded-full '; // 전도석: 완전한 원형
    } else if (isKeystone) {
      baseStyle += 'rounded-sm '; // 요석: 약간 둥근 모서리
    }
    
    // 색상 결정
    switch (type) {
      case 'blackConduit':
        return baseStyle + 'bg-black border-2 border-gray-300'; // 흑돌 전도석: 검은색 배경 + 회색 테두리
      case 'whiteConduit':
        return baseStyle + 'bg-white border-2 border-gray-700'; // 백돌 전도석: 흰색 배경 + 어두운 회색 테두리
      case 'blackKeystone':
        return baseStyle + 'bg-gray-800 border-2 border-yellow-400'; // 흑돌 요석: 어두운 회색 배경 + 노란색 테두리
      case 'whiteKeystone':
        return baseStyle + 'bg-gray-200 border-2 border-yellow-600'; // 백돌 요석: 밝은 회색 배경 + 어두운 노란색 테두리
      default:
        return baseStyle + 'bg-gray-500'; // 기본값: 회색
    }
  };

  // === 상태별 추가 스타일 결정 ===
  
  /**
   * 상태에 따른 추가 스타일을 결정하는 함수
   * 하이라이트, 공명 중, 초점 후보 상태에 따라 추가 효과 적용
   * 
   * @returns 추가 스타일 클래스 문자열
   */
  const getStateStyle = (): string => {
    let styles = '';
    
    if (isHighlighted) {
      styles += ' ring-2 ring-blue-400 ring-opacity-75'; // 하이라이트: 파란색 링
    }
    
    if (isResonating) {
      styles += ' ring-2 ring-blue-500 ring-opacity-100 animate-pulse'; // 공명 중: 파란색 링 + 펄스 애니메이션
    }
    
    if (isFocusCandidate) {
      styles += ' ring-2 ring-orange-400 ring-opacity-75'; // 초점 후보: 주황색 링
    }
    
    return styles;
  };

  // === 기보 표시 관련 ===
  
  /**
   * 기보 텍스트를 생성하는 함수
   * 기보 정보가 있으면 표시할 텍스트를 반환
   * 
   * @returns 기보 텍스트 또는 null
   */
  const getNotationDisplay = (): string | null => {
    if (!notation) return null; // 기보 정보가 없으면 null 반환
    return getNotationText(notation); // 기보 텍스트 생성 (예: "17", "17+", "17•", "17→")
  };
  
  /**
   * 기보 색상을 결정하는 함수
   * 돌의 색상과 기보 타입에 따라 적절한 색상을 반환
   * 
   * @returns Tailwind CSS 색상 클래스
   */
  const getNotationStyle = (): string => {
    if (!notation) return '';
    return getNotationColor(notation, type); // 기보 색상 결정
  };

  return (
    // === 돌 컨테이너 ===
    // 돌의 기본 스타일과 상태별 추가 스타일을 조합
    <div
      className={`
        relative w-5/6 h-5/6 rounded-full flex items-center justify-center
        ${getBaseStyle()} // 기본 스타일 (색상, 테두리)
        ${getStateStyle()} // 상태별 추가 스타일 (링, 애니메이션)
      `}
    >
      {/* 
        === 기보 표시 ===
        기보 모드가 활성화되고 기보 정보가 있는 경우 돌 위에 표시
        - 위치: 돌의 중앙에 작은 텍스트로 표시
        - 색상: 돌의 색상과 대비되는 색상 사용
        - 크기: 매우 작은 텍스트 (text-xs)
        - z-index: 다른 요소들 위에 표시 (z-10)
      */}
      {notation && (
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            text-xs font-bold pointer-events-none z-10
            ${getNotationStyle()} // 기보 색상 적용
          `}
        >
          {getNotationDisplay()} {/* 기보 텍스트 표시 */}
        </div>
      )}
      

    </div>
  );
};

export default Stone; 