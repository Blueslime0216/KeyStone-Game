/**
 * 기보 설정 패널 컴포넌트
 * 기보 표시 모드를 간단하게 제어
 * 
 * 기능:
 * - 기보 표시 ON/OFF 토글
 * - 현재 상태 표시
 */

import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Eye, EyeOff } from 'lucide-react';

/**
 * 기보 설정 패널 컴포넌트
 * 기보 표시 모드를 간단하게 제어
 * 
 * 기능:
 * - 기보 표시 ON/OFF 토글
 * - 현재 상태 표시
 */
const NotationPanel: React.FC = () => {
  const { isNotationMode, toggleNotationMode } = useGameStore();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-center mb-4">기보 설정</h3>
      
      {/* 기보 표시 토글 */}
      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
        <span className="text-sm text-gray-300">기보 표시</span>
        <button
          onClick={toggleNotationMode}
          className={`p-2 rounded-lg transition-colors ${
            isNotationMode 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'bg-gray-500 hover:bg-gray-400 text-gray-200'
          }`}
          title={isNotationMode ? '기보 표시 끄기' : '기보 표시 켜기'}
        >
          {isNotationMode ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>

      {/* 현재 상태 표시 */}
      <div className="text-center text-sm text-gray-400">
        {isNotationMode ? '기보가 표시됩니다' : '기보가 숨겨집니다'}
      </div>
    </div>
  );
};

export default NotationPanel; 