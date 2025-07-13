/**
 * 이벤트 로그 컴포넌트
 * 게임 진행 상황을 실시간으로 표시하는 로그
 * 
 * 기능:
 * - 실시간 이벤트 표시
 * - 자동 스크롤
 * - 로그 초기화
 * - 최근 이벤트만 표시
 * - 오버플로우 방지
 */

import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MessageSquare, X } from 'lucide-react';

/**
 * 이벤트 로그 컴포넌트
 * 게임 진행 상황을 실시간으로 표시하는 로그
 * 
 * 기능:
 * - 실시간 이벤트 표시
 * - 자동 스크롤
 * - 로그 초기화
 * - 최근 이벤트만 표시
 * - 오버플로우 방지
 */
const EventLog: React.FC = () => {
  const { eventLog, clearEventLog } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 이벤트가 추가되면 자동으로 하단으로 스크롤
  useEffect(() => {
    if (scrollRef.current && eventLog.length > 0) {
      // 부드러운 스크롤로 최하단으로 이동
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [eventLog]);

  // 이벤트 타입에 따른 아이콘과 색상
  const getEventStyle = (eventType: string) => {
    switch (eventType) {
      case 'stone_placed':
        return { icon: '●', color: 'text-blue-300' };
      case 'stone_converted':
        return { icon: '◆', color: 'text-purple-300' };
      case 'core_formed':
        return { icon: '■', color: 'text-yellow-300' };
      case 'resonance_activated':
        return { icon: '⚡', color: 'text-orange-300' };
      case 'turn_started':
        return { icon: '▶', color: 'text-green-300' };
      default:
        return { icon: '•', color: 'text-gray-300' };
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare size={20} />
          게임 로그
        </h3>
        <button
          onClick={clearEventLog}
          className="p-1 hover:bg-gray-600 rounded transition-colors"
          title="로그 초기화"
        >
          <X size={16} />
        </button>
      </div>

      {/* 로그 내용 */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-2 min-h-0"
      >
        {eventLog.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            게임을 시작하면 로그가 표시됩니다
          </div>
        ) : (
          eventLog.map((event) => {
            const style = getEventStyle(event.eventType);
            return (
              <div 
                key={event.id} 
                className="p-2 bg-gray-600 rounded text-sm break-words"
              >
                <div className="flex items-start gap-2">
                  <span className={`text-lg flex-shrink-0 ${style.color}`}>
                    {style.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-200 break-words">
                      {event.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventLog; 