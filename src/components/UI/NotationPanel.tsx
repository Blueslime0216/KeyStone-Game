/**
 * 기보 설정 패널 컴포넌트
 * 기보 표시 모드를 제어하고 전체 기보 텍스트를 표시하며 복사 기능 제공
 * 
 * 기능:
 * - 기보 표시 ON/OFF 토글
 * - 현재 상태 표시
 * - 전체 기보 텍스트 표시
 * - 기보 텍스트 복사 기능
 */

import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { generateNotationText, copyNotationToClipboard } from '../../utils/notationUtils';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

/**
 * 기보 설정 패널 컴포넌트
 * 기보 표시 모드를 제어하고 전체 기보 텍스트를 표시하며 복사 기능 제공
 * 
 * 기능:
 * - 기보 표시 ON/OFF 토글
 * - 현재 상태 표시
 * - 전체 기보 텍스트 표시
 * - 기보 텍스트 복사 기능
 */
const NotationPanel: React.FC = () => {
  const { isNotationMode, toggleNotationMode, moveHistory, gameStatus } = useGameStore();
  const [copied, setCopied] = useState(false);

  // 기보 텍스트 생성
  const notationText = generateNotationText(moveHistory, gameStatus);

  // 복사 기능
  const handleCopy = async () => {
    if (notationText) {
      const success = await copyNotationToClipboard(notationText);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

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

      {/* 전체 기보 텍스트 */}
      <div className="bg-gray-600 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300 font-semibold">전체 기보</span>
          {notationText && (
            <button
              onClick={handleCopy}
              className={`p-1 rounded transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-400 text-gray-200'
              }`}
              title="기보 복사"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
        
        <div className="bg-gray-700 rounded p-2 min-h-[60px] max-h-[120px] overflow-y-auto">
          {notationText ? (
            <p className="text-xs text-gray-200 font-mono leading-relaxed break-words">
              {notationText}
            </p>
          ) : (
            <p className="text-xs text-gray-500 italic">
              아직 기보가 없습니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotationPanel; 