import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VideoLoggerProps {
  onCommitArtifact: (title: string, blob: Blob | null) => void;
  initialScript?: string;
  onClose: () => void;
}

const VideoLogger: React.FC<VideoLoggerProps> = ({ onCommitArtifact, initialScript = '', onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]); // Use Ref for chunks to avoid closure staleness
  
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [broadcastMode, setBroadcastMode] = useState(false); 
  
  // Timer State
  const [targetDuration, setTargetDuration] = useState(90); 
  const [timeLeft, setTimeLeft] = useState(90);
  
  // FMI Protocol Default Script
  const defaultScript = `FMI JOURNEY LOG // ${new Date().toISOString().split('T')[0]}

>> CONTEXT
[Why is this action being taken?]

>> EXECUTION
[What specific artifact was produced?]

>> CONSTRAINT CHECK
[Observable? External? Boring?]

>> NEXT ACTION
[Single executable step]`;

  const [script, setScript] = useState(initialScript || defaultScript);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const prompterRef = useRef<HTMLDivElement>(null);

  // Initialize Camera (Only if NOT in broadcast mode)
  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function enableStream() {
      if (broadcastMode) return;

      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(localStream);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error("Camera access denied or in use:", err);
      }
    }

    enableStream();

    return () => {
      // Cleanup tracks on unmount or mode switch
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
    };
  }, [broadcastMode]);

  // Re-attach stream to video element when stream state changes
  useEffect(() => {
    if (videoRef.current && stream && !broadcastMode) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, broadcastMode]);

  // Timer Logic
  useEffect(() => {
    let timerInterval: number;
    if (isRecording && timeLeft > 0) {
      timerInterval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } 
    
    return () => clearInterval(timerInterval);
  }, [isRecording, timeLeft]);

  // Handle Auto-Stop
  useEffect(() => {
    if (isRecording && timeLeft === 0) {
      // We need to call stopSession, but stopSession depends on refs which are stable
      stopSession(); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRecording]);

  // Teleprompter Scrolling Logic
  useEffect(() => {
    let scrollInterval: number;
    if (isScrolling && prompterRef.current) {
      scrollInterval = window.setInterval(() => {
        if (prompterRef.current) {
          prompterRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    }
    return () => clearInterval(scrollInterval);
  }, [isScrolling, scrollSpeed]);

  const startSession = useCallback(() => {
    setTimeLeft(targetDuration); 

    if (!broadcastMode && stream) {
      // Local Recording Mode
      chunksRef.current = []; // Reset chunks
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
    } else if (broadcastMode) {
      // Broadcast Mode: Open YouTube Live Dashboard
      window.open('https://studio.youtube.com/', '_blank');
    }

    setIsRecording(true);
    setIsScrolling(true);
  }, [broadcastMode, stream, targetDuration]);

  const stopSession = useCallback(() => {
    setIsRecording(false);
    setIsScrolling(false);

    if (!broadcastMode && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Auto-download for safety
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const filename = `FMI_LOG_${new Date().toISOString().slice(0,10)}.webm`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // Commit artifact
        onCommitArtifact(filename, blob);
      };
      
      recorder.stop();
    } else if (broadcastMode) {
      onCommitArtifact(`BROADCAST_SESSION_${new Date().toISOString().slice(0,10)}`, null);
    }
  }, [broadcastMode, onCommitArtifact]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="bg-fmi-panel border border-fmi-border rounded-lg w-full max-w-5xl h-[90vh] flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-fmi-border bg-black/50 z-30 relative">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              {broadcastMode ? 'LIVE TELEPROMPTER' : 'VIDEO LOGGER'}
            </h2>
            <div className={`font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-mode-think'}`}>
              T-{formatTime(timeLeft)}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-mono hover:bg-gray-800 px-3 py-1 rounded">[CLOSE]</button>
        </div>

        {/* Main Stage */}
        <div className="flex-1 relative bg-black flex justify-center items-center overflow-hidden group">
          
          {/* Background */}
          {!broadcastMode ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="text-center">
                <div className="text-6xl text-gray-500 font-mono mb-4">BROADCAST MODE</div>
                <p className="text-gray-400 font-mono">CAMERA RELEASED FOR YOUTUBE</p>
              </div>
            </div>
          )}
          
          {/* Teleprompter Overlay */}
          <div 
            ref={prompterRef}
            className="absolute inset-0 overflow-y-auto z-10 no-scrollbar"
            style={{ scrollBehavior: 'auto' }}
          >
             <div className="h-[50vh]"></div>
             <div className="px-8 md:px-24 max-w-5xl mx-auto">
                <p 
                  className="text-4xl md:text-6xl font-sans font-bold text-white leading-snug whitespace-pre-wrap text-center tracking-tight"
                  style={{ 
                    textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' 
                  }}
                >
                  {script}
                </p>
             </div>
             <div className="h-[100vh]"></div>
          </div>
          
          {/* Visual Reading Guides */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/60 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-between px-6 z-20 pointer-events-none opacity-60">
             <div className="h-1 w-16 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
             <div className="h-[1px] flex-1 bg-red-500/30 mx-6"></div>
             <div className="h-1 w-16 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent z-20 pointer-events-none"></div>
        </div>

        {/* Controls Panel */}
        <div className="bg-fmi-panel border-t border-fmi-border p-4 grid grid-cols-1 md:grid-cols-4 gap-6 z-30 relative">
          
          <div className="flex flex-col gap-2 md:col-span-1">
            <label className="text-[10px] font-mono text-gray-400">SCRIPT SOURCE</label>
            <textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="bg-fmi-bg border border-fmi-border text-gray-300 text-xs p-2 h-20 font-mono resize-none focus:border-white outline-none"
              placeholder="Paste script here..."
            />
          </div>

          <div className="flex flex-col gap-3 md:col-span-1 border-r border-fmi-border pr-4">
             <div>
               <label className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>DURATION</span>
                  <span className="text-white">{targetDuration}s</span>
               </label>
               <input 
                  type="range" min="30" max="300" step="10"
                  value={targetDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTargetDuration(val);
                    setTimeLeft(val);
                  }}
                  className="w-full accent-mode-think h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
               />
             </div>
             <div>
               <label className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>SCROLL SPEED</span>
                  <span className="text-white">{scrollSpeed}x</span>
               </label>
               <input 
                type="range" min="0" max="5" step="0.5" 
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                className="w-full accent-mode-think h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
             </div>
          </div>

          <div className="flex flex-col justify-center gap-2 md:col-span-1 pl-2">
            <label className="text-[10px] font-mono text-gray-400 text-center">SESSION TYPE</label>
            <button 
               onClick={() => setBroadcastMode(!broadcastMode)}
               className={`text-xs font-mono py-2 px-3 rounded border transition-colors ${
                 broadcastMode 
                 ? 'bg-red-900/30 border-red-500 text-red-400' 
                 : 'bg-gray-800 border-gray-600 text-gray-400'
               }`}
            >
              {broadcastMode ? '● BROADCAST (LIVE)' : '○ LOCAL RECORD'}
            </button>
            <p className="text-[9px] text-gray-500 text-center">
              {broadcastMode ? 'Releases camera for YouTube' : 'Records to disk'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center md:col-span-1">
            {!isRecording ? (
              <button 
                onClick={startSession}
                className="w-full bg-white hover:bg-gray-200 text-black font-mono font-bold py-4 px-6 rounded shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all"
              >
                {broadcastMode ? 'LAUNCH LIVE' : 'START REC'}
              </button>
            ) : (
              <button 
                onClick={stopSession}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-mono font-bold py-4 px-6 rounded animate-pulse"
              >
                STOP SESSION
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VideoLogger;