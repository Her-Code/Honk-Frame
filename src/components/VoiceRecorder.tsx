import { useState, useRef, useEffect } from 'react';
import RecordRTC from 'recordrtc';
import QRCode from 'react-qr-code';

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('honks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showQR, setShowQR] = useState(false);
  const [currentHonk, setCurrentHonk] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const recorderRef = useRef<RecordRTC | null>(null);

  // Frame mode detection
  const params = new URLSearchParams(window.location.search);
  const isFrameMode = params.has('frame');

  useEffect(() => {
    if (isFrameMode) {
      // Clean the URL without reload
      window.history.replaceState({}, '', '/');
      // Start recording automatically
      startRecording();
    }
  }, [isFrameMode]);

  const playSound = () => {
    if (isMuted) return;
    const audio = new Audio('/honk.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const startRecording = async () => {
    if (isFrameMode) {
      document.documentElement.classList.add('frame-mode');
    }
    playSound();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder
      });
      
      recorderRef.current = recorder;
      recorder.startRecording();
      setIsRecording(true);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone - please check permissions');
    }
  };

  const stopRecording = () => {
    playSound();
    if (isFrameMode) {
      document.documentElement.classList.remove('frame-mode');
    }
    
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current!.getBlob();
        const url = URL.createObjectURL(blob);
        const newURLs = [url, ...audioURLs];
        setAudioURLs(newURLs);
        localStorage.setItem('honks', JSON.stringify(newURLs));
        setIsRecording(false);
        recorderRef.current?.getDataURL((dataURL: string) => {
          setCurrentHonk(dataURL);
        });
      });
    }
  };

  const clearHonks = () => {
    setAudioURLs([]);
    localStorage.removeItem('honks');
  };

  return (
    <div className={`flex justify-center items-start min-h-screen w-full ${isFrameMode ? 'p-0' : 'p-4'}`}>
      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <QRCode 
              value={currentHonk}
              title="Share this honk" 
              size={256}
              className="mb-4 mx-auto"
            />
            <button
              onClick={() => setShowQR(false)}
              className="block mx-auto px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className={`${isFrameMode ? 'w-full h-full' : 'w-full max-w-[400px] mx-auto rounded-lg overflow-hidden shadow-lg'} bg-white`}>
        {/* Frame header - hidden in frame mode */}
        {!isFrameMode && (
          <div className="bg-purple-600 p-3 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold text-center flex-1">HONK FRAME</h1>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-sm bg-purple-700 px-2 py-1 rounded"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        )}
        
        {/* Frame content */}
        <div className={isFrameMode ? 'h-full flex items-center justify-center' : 'p-4'}>
          {audioURLs.length === 0 ? (
            <div className={`text-center ${isFrameMode ? 'w-full' : 'py-8'}`}>
              {!isFrameMode && <p className="mb-4">Record your duck honk!</p>}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                onMouseEnter={!isMuted ? playSound : undefined}
                className={`px-6 py-3 rounded-full text-white font-bold text-lg ${
                  isRecording ? 'bg-red-500' : 'bg-purple-500'
                } ${isFrameMode ? 'w-full h-full rounded-none' : ''}`}
              >
                {isRecording ? '🛑 STOP' : '🦆 HONK'}
              </button>
            </div>
          ) : (
            <div className={`space-y-3 ${isFrameMode ? 'w-full p-2' : ''}`}>
              <div className="bg-gray-50 p-3 rounded">
                <audio controls src={audioURLs[0]} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  onMouseEnter={!isMuted ? playSound : undefined}
                  className={`py-2 rounded text-white font-bold ${
                    isRecording ? 'bg-red-500' : 'bg-purple-500'
                  }`}
                >
                  {isRecording ? '🛑 STOP' : '🦆 NEW HONK'}
                </button>
                {!isFrameMode && (
                  <button 
                    onClick={() => {
                      setCurrentHonk(audioURLs[0]);
                      setShowQR(true);
                    }}
                    className="py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    SHARE
                  </button>
                )}
              </div>
              {!isFrameMode && audioURLs.length > 0 && (
                <button 
                  onClick={clearHonks}
                  className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  CLEAR ALL HONKS
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Frame footer - hidden in frame mode */}
        {!isFrameMode && (
          <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
            Made with 🦆 for Farcaster
          </div>
        )}
      </div>
    </div>
  );
}

// import { useState, useRef, useEffect } from 'react';
// import RecordRTC from 'recordrtc';
// import QRCode from 'react-qr-code';

// export default function VoiceRecorder() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioURLs, setAudioURLs] = useState<string[]>(() => {
//     if (typeof window !== 'undefined') {
//       const saved = localStorage.getItem('honks');
//       return saved ? JSON.parse(saved) : [];
//     }
//     return [];
//   });
//   const [showQR, setShowQR] = useState(false);
//   const [currentHonk, setCurrentHonk] = useState('');
//   const [isMuted, setIsMuted] = useState(false);
//   const recorderRef = useRef<RecordRTC | null>(null);

//   // Frame mode detection
//   const params = new URLSearchParams(window.location.search);
//   const isFrameMode = params.has('frame');
//   const shouldHonk = params.has('honk');

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Handle frame mode initialization
//       if (isFrameMode) {
//         document.documentElement.classList.add('frame-mode');
//         if (shouldHonk) {
//           startRecording();
//           // Clean the URL after starting recording
//           window.history.replaceState({}, '', '/?frame=true');
//         }
//       }
//     }
//   }, []);

//   const playSound = () => {
//     if (isMuted) return;
//     const audio = new Audio('/honk.mp3');
//     audio.volume = 0.3;
//     audio.play().catch(e => console.log('Audio play failed:', e));
//   };

//   const startRecording = async () => {
//     playSound();
//     if (isFrameMode) {
//       document.documentElement.style.backgroundColor = '#8b5cf6'; // Purple bg
//     }
    
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new RecordRTC(stream, {
//         type: 'audio',
//         mimeType: 'audio/wav',
//         recorderType: RecordRTC.StereoAudioRecorder
//       });
      
//       recorderRef.current = recorder;
//       recorder.startRecording();
//       setIsRecording(true);
      
//     } catch (err) {
//       console.error('Error accessing microphone:', err);
//       alert('Could not access microphone - please check permissions');
//     }
//   };

//   const stopRecording = () => {
//     playSound();
//     if (isFrameMode) {
//       document.documentElement.style.backgroundColor = '';
//     }
    
//     if (recorderRef.current) {
//       recorderRef.current.stopRecording(() => {
//         const blob = recorderRef.current!.getBlob();
//         const url = URL.createObjectURL(blob);
//         const newURLs = [url, ...audioURLs];
//         setAudioURLs(newURLs);
//         localStorage.setItem('honks', JSON.stringify(newURLs));
//         setIsRecording(false);
//         recorderRef.current?.getDataURL((dataURL: string) => {
//           setCurrentHonk(dataURL);
//         });
//       });
//     }
//   };

//   const clearHonks = () => {
//     setAudioURLs([]);
//     localStorage.removeItem('honks');
//   };

//   return (
//     <div className={`flex justify-center items-start min-h-screen w-full ${isFrameMode ? 'p-0' : 'p-4'}`}>
//       {/* QR Code Modal */}
//       {showQR && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg">
//             <QRCode 
//               value={currentHonk}
//               title="Share this honk" 
//               size={256}
//               className="mb-4 mx-auto"
//             />
//             <button
//               onClick={() => setShowQR(false)}
//               className="block mx-auto px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       <div className={`${isFrameMode ? 'w-full h-full' : 'w-full max-w-[400px] mx-auto rounded-lg overflow-hidden shadow-lg'} bg-white`}>
//         {/* Frame header - hidden in frame mode */}
//         {!isFrameMode && (
//           <div className="bg-purple-600 p-3 text-white flex justify-between items-center">
//             <h1 className="text-xl font-bold text-center flex-1">HONK FRAME</h1>
//             <button 
//               onClick={() => setIsMuted(!isMuted)}
//               className="text-sm bg-purple-700 px-2 py-1 rounded"
//             >
//               {isMuted ? '🔇' : '🔊'}
//             </button>
//           </div>
//         )}
        
//         {/* Frame content */}
//         <div className={isFrameMode ? 'h-full flex items-center justify-center' : 'p-4'}>
//           {audioURLs.length === 0 ? (
//             <div className={`text-center ${isFrameMode ? 'w-full' : 'py-8'}`}>
//               {!isFrameMode && <p className="mb-4">Record your duck honk!</p>}
//               <button
//                 onClick={isRecording ? stopRecording : startRecording}
//                 onMouseEnter={!isMuted ? playSound : undefined}
//                 className={`px-6 py-3 rounded-full text-white font-bold text-lg ${
//                   isRecording ? 'bg-red-500' : 'bg-purple-500'
//                 } ${isFrameMode ? 'w-full h-full rounded-none' : ''}`}
//               >
//                 {isRecording ? '🛑 STOP' : '🦆 HONK'}
//               </button>
//             </div>
//           ) : (
//             <div className={`space-y-3 ${isFrameMode ? 'w-full p-2' : ''}`}>
//               <div className="bg-gray-50 p-3 rounded">
//                 <audio controls src={audioURLs[0]} className="w-full" />
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 <button
//                   onClick={isRecording ? stopRecording : startRecording}
//                   onMouseEnter={!isMuted ? playSound : undefined}
//                   className={`py-2 rounded text-white font-bold ${
//                     isRecording ? 'bg-red-500' : 'bg-purple-500'
//                   }`}
//                 >
//                   {isRecording ? '🛑 STOP' : '🦆 NEW HONK'}
//                 </button>
//                 {!isFrameMode && (
//                   <button 
//                     onClick={() => {
//                       setCurrentHonk(audioURLs[0]);
//                       setShowQR(true);
//                     }}
//                     className="py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//                   >
//                     SHARE
//                   </button>
//                 )}
//               </div>
//               {!isFrameMode && audioURLs.length > 0 && (
//                 <button 
//                   onClick={clearHonks}
//                   className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//                 >
//                   CLEAR ALL HONKS
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
        
//         {/* Frame footer - hidden in frame mode */}
//         {!isFrameMode && (
//           <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
//             Made with 🦆 for Farcaster
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useState, useRef, useEffect } from 'react';
// import RecordRTC from 'recordrtc';
// import QRCode from 'react-qr-code';

// export default function VoiceRecorder() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioURLs, setAudioURLs] = useState<string[]>(() => {
//     if (typeof window !== 'undefined') {
//       const saved = localStorage.getItem('honks');
//       return saved ? JSON.parse(saved) : [];
//     }
//     return [];
//   });
//   const [showQR, setShowQR] = useState(false);
//   const [currentHonk, setCurrentHonk] = useState('');
//   const [isMuted, setIsMuted] = useState(false);
//   const recorderRef = useRef<RecordRTC | null>(null);

//   // Enhanced frame detection
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const params = new URLSearchParams(window.location.search);
//       const isFrame = params.has('frame') || 
//                      params.has('frame-interaction') || 
//                      window.location.pathname.includes('frame.html');
      
//       if (isFrame) {
//         // Clean URL without reload
//         window.history.replaceState({}, '', window.location.pathname);
//         // Start recording and add visual indicator
//         document.documentElement.classList.add('frame-mode');
//         startRecording();
//       }
//     }
//   }, []);

//   const playSound = () => {
//     if (isMuted) return;
//     const audio = new Audio('/honk.mp3');
//     audio.volume = 0.3;
//     audio.play().catch(e => console.log('Audio play failed:', e));
//   };

//   const startRecording = async () => {
//     playSound();
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new RecordRTC(stream, {
//         type: 'audio',
//         mimeType: 'audio/wav',
//         recorderType: RecordRTC.StereoAudioRecorder
//       });
      
//       recorderRef.current = recorder;
//       recorder.startRecording();
//       setIsRecording(true);
      
//     } catch (err) {
//       console.error('Error accessing microphone:', err);
//       alert('Could not access microphone - please check permissions');
//     }
//   };

//   const stopRecording = () => {
//     playSound();
//     if (recorderRef.current) {
//       recorderRef.current.stopRecording(() => {
//         const blob = recorderRef.current!.getBlob();
//         const url = URL.createObjectURL(blob);
//         const newURLs = [url, ...audioURLs];
//         setAudioURLs(newURLs);
//         localStorage.setItem('honks', JSON.stringify(newURLs));
//         setIsRecording(false);
//         recorderRef.current?.getDataURL((dataURL: string) => {
//           setCurrentHonk(dataURL);
//         });
//       });
//     }
//   };

//   const clearHonks = () => {
//     setAudioURLs([]);
//     localStorage.removeItem('honks');
//   };

//   return (
//     <div className="flex justify-center items-start min-h-screen w-full p-4">
//       {/* QR Code Modal */}
//       {showQR && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg">
//             <QRCode 
//               value={currentHonk}
//               title="Share this honk" 
//               size={256}
//               className="mb-4 mx-auto"
//             />
//             <button
//               onClick={() => setShowQR(false)}
//               className="block mx-auto px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="w-full max-w-[400px] mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
//         {/* Frame header */}
//         <div className="bg-purple-600 p-3 text-white flex justify-between items-center">
//           <h1 className="text-xl font-bold text-center flex-1">HONK FRAME</h1>
//           <button 
//             onClick={() => setIsMuted(!isMuted)}
//             className="text-sm bg-purple-700 px-2 py-1 rounded"
//           >
//             {isMuted ? '🔇' : '🔊'}
//           </button>
//         </div>
        
//         {/* Frame content */}
//         <div className="p-4">
//           {audioURLs.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="mb-4">Record your duck honk!</p>
//               <button
//                 onClick={isRecording ? stopRecording : startRecording}
//                 onMouseEnter={!isMuted ? playSound : undefined}
//                 className={`px-6 py-3 rounded-full text-white font-bold text-lg ${
//                   isRecording ? 'bg-red-500' : 'bg-purple-500'
//                 }`}
//               >
//                 {isRecording ? '🛑 STOP' : '🦆 HONK'}
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               <div className="bg-gray-50 p-3 rounded">
//                 <audio controls src={audioURLs[0]} className="w-full" />
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 <button
//                   onClick={isRecording ? stopRecording : startRecording}
//                   onMouseEnter={!isMuted ? playSound : undefined}
//                   className={`py-2 rounded text-white font-bold ${
//                     isRecording ? 'bg-red-500' : 'bg-purple-500'
//                   }`}
//                 >
//                   {isRecording ? '🛑 STOP' : '🦆 NEW HONK'}
//                 </button>
//                 <button 
//                   onClick={() => {
//                     setCurrentHonk(audioURLs[0]);
//                     setShowQR(true);
//                   }}
//                   className="py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//                 >
//                   SHARE
//                 </button>
//               </div>
//               {audioURLs.length > 0 && (
//                 <button 
//                   onClick={clearHonks}
//                   className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//                 >
//                   CLEAR ALL HONKS
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
        
//         {/* Frame footer */}
//         <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
//           Made with 🦆 for Farcaster
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useRef } from 'react';
// import RecordRTC from 'recordrtc';
// import QRCode  from 'react-qr-code';

// export default function VoiceRecorder() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioURLs, setAudioURLs] = useState<string[]>(() => {
//     if (typeof window !== 'undefined') {
//       const saved = localStorage.getItem('honks');
//       return saved ? JSON.parse(saved) : [];
//     }
//     return [];
//   });
//   const [showQR, setShowQR] = useState(false);
//   const [currentHonk, setCurrentHonk] = useState('');
//   const [isMuted, setIsMuted] = useState(false);
//   const recorderRef = useRef<RecordRTC | null>(null);

//   const playSound = () => {
//     if (isMuted) return;
//     const audio = new Audio('/honk.mp3');
//     audio.volume = 0.3;
//     audio.play().catch(e => console.log('Audio play failed:', e));
//   };

//   const startRecording = async () => {
//     playSound();
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new RecordRTC(stream, {
//         type: 'audio',
//         mimeType: 'audio/wav',
//         recorderType: RecordRTC.StereoAudioRecorder
//       });
      
//       recorderRef.current = recorder;
//       recorder.startRecording();
//       setIsRecording(true);
      
//     } catch (err) {
//       console.error('Error accessing microphone:', err);
//       alert('Could not access microphone - please check permissions');
//     }
//   };

//   const stopRecording = () => {
//     playSound();
//     if (recorderRef.current) {
//       recorderRef.current.stopRecording(() => {
//         const blob = recorderRef.current!.getBlob();
//         const url = URL.createObjectURL(blob);
//         const newURLs = [url, ...audioURLs];
//         setAudioURLs(newURLs);
//         localStorage.setItem('honks', JSON.stringify(newURLs));
//         setIsRecording(false);
//         recorderRef.current?.getDataURL((dataURL: string) => {
//             console.log('Base64 audio:', dataURL);
//             setCurrentHonk(dataURL); // Set the current honk to the base64 data URL
//         });
//         // recorderRef.current?.getDataURL();
//       });
//     }
//   };

//   const clearHonks = () => {
//     setAudioURLs([]);
//     localStorage.removeItem('honks');
//   };

//   return (
//     <div className="flex justify-center items-start min-h-screen w-full p-4">
//       {/* QR Code Modal */}
//       {showQR && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg">
//             <QRCode 
//               value={currentHonk}
//               title="Share this honk" 
//               size={256}
//               className="mb-4 mx-auto"
//             />
//             <button
//               onClick={() => setShowQR(false)}
//               className="block mx-auto px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="w-full max-w-[400px] mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
//         {/* Frame header */}
//         <div className="bg-purple-600 p-3 text-white flex justify-between items-center">
//           <h1 className="text-xl font-bold text-center flex-1">HONK FRAME</h1>
//           <button 
//             onClick={() => setIsMuted(!isMuted)}
//             className="text-sm bg-purple-700 px-2 py-1 rounded"
//           >
//             {isMuted ? '🔇' : '🔊'}
//           </button>
//         </div>
        
//         {/* Frame content */}
//         <div className="p-4">
//           {audioURLs.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="mb-4">Record your duck honk!</p>
//               <button
//                 onClick={isRecording ? stopRecording : startRecording}
//                 onMouseEnter={!isMuted ? playSound : undefined}
//                 className={`px-6 py-3 rounded-full text-white font-bold text-lg ${
//                   isRecording ? 'bg-red-500' : 'bg-purple-500'
//                 }`}
//               >
//                 {isRecording ? '🛑 STOP' : '🦆 HONK'}
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               <div className="bg-gray-50 p-3 rounded">
//                 <audio controls src={audioURLs[0]} className="w-full" />
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 <button
//                   onClick={isRecording ? stopRecording : startRecording}
//                   onMouseEnter={!isMuted ? playSound : undefined}
//                   className={`py-2 rounded text-white font-bold ${
//                     isRecording ? 'bg-red-500' : 'bg-purple-500'
//                   }`}
//                 >
//                   {isRecording ? '🛑 STOP' : '🦆 NEW HONK'}
//                 </button>
//                 <button 
//                   onClick={() => {
//                     setCurrentHonk(audioURLs[0]);
//                     setShowQR(true);
//                   }}
//                   className="py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//                 >
//                   SHARE
//                 </button>
//               </div>
//               {audioURLs.length > 0 && (
//                 <button 
//                   onClick={clearHonks}
//                   className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//                 >
//                   CLEAR ALL HONKS
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
        
//         {/* Frame footer */}
//         <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
//           Made with 🦆 for Farcaster
//         </div>
//       </div>
//     </div>
//   );
// }



