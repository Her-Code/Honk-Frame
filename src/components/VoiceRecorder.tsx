import { useState, useRef, useEffect, useMemo } from 'react';
import RecordRTC from 'recordrtc';
import QRCode from 'react-qr-code';

import { SelfQRcodeWrapper, SelfAppBuilder } from '@selfxyz/qrcode';
import logoBase64 from '../assets/logo64.png';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('honks');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentHonk, setCurrentHonk] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const recorderRef = useRef<RecordRTC | null>(null);

  const params = new URLSearchParams(window.location.search);
  const isFrameMode = params.has('frame');

  useEffect(() => {
    if (isFrameMode) {
      window.history.replaceState({}, '', '/');
      startRecording();
    }
  }, [isFrameMode]);

  const playSound = () => {
    if (!isMuted) {
      const audio = new Audio('/honk.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  const startRecording = async () => {
    if (!isVerified && !isFrameMode) {
      alert('🔐 Please verify with Self before honking.');
      return;
    }

    if (isFrameMode) document.documentElement.classList.add('frame-mode');

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
      console.error('Mic error:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    playSound();
    if (isFrameMode) document.documentElement.classList.remove('frame-mode');

    recorderRef.current?.stopRecording(() => {
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
  };

  const clearHonks = () => {
    setAudioURLs([]);
    localStorage.removeItem('honks');
  };

  // ✅ SelfApp config using useMemo (optional improvement)
  const selfApp = useMemo(() => {
    return new SelfAppBuilder({
      appName: 'Honk Frame',
      scope: 'honk-frame',
      endpoint: 'https://self-honk-frame.vercel.app',
      endpointType: 'staging_celo',
      logoBase64,
      userId: '0x0000000000000000000000000000000000000000',
      userIdType: 'hex',
      version: 2,
      devMode: true,
      disclosures: {
        date_of_birth: true,
        nationality: true,
        ofac: true,
        minimumAge: 18
      }
    }).build();
  }, []);

  return (
    <div className={`flex justify-center items-start min-h-screen ${isFrameMode ? 'p-0' : 'p-4'}`}>
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <QRCode
              value={currentHonk}
              title="Honk QR Code"
              size={256}
              className="mb-4 mx-auto"
            />
            <button onClick={() => setShowQR(false)} className="px-4 py-2 bg-purple-500 text-white rounded">
              Close
            </button>
          </div>
        </div>
      )}

      <div className={`${isFrameMode ? 'w-full h-full' : 'max-w-md mx-auto rounded-lg shadow-lg'} bg-white`}>
        {!isFrameMode && (
          <div className="bg-purple-600 p-3 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold">HONK FRAME</h1>
            <button onClick={() => setIsMuted(!isMuted)} className="bg-purple-700 px-2 py-1 rounded">
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        )}

        <div className={isFrameMode ? 'h-full flex items-center justify-center' : 'p-4'}>
          {!isVerified && !isFrameMode ? (
            <div className="text-center space-y-4">
              <p className="text-red-600 font-medium">🔐 Verify to honk</p>
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => {
                  setIsVerified(true);
                  alert('✅ Verification complete!');
                }}
                onError={(err) => {
                  console.error('Verification failed or cancelled:', err);
                  alert('❌ Verification failed or cancelled.');
                }}
                size={300}
              />
              <p className="text-xs text-gray-500">Scan QR with Self app to verify you're human 🧬</p>
            </div>
          ) : audioURLs.length === 0 ? (
            <div className={`text-center ${isFrameMode ? 'w-full' : 'py-8'}`}>
              {!isFrameMode && <p className="mb-4">Ready to record your duck honk?</p>}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                onMouseEnter={!isMuted ? playSound : undefined}
                className={`px-6 py-3 text-white font-bold text-lg ${isRecording ? 'bg-red-500' : 'bg-purple-500'} ${isFrameMode ? 'w-full h-full' : 'rounded-full'}`}
              >
                {isRecording ? '🛑 STOP' : '🦆 HONK'}
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              <audio controls src={audioURLs[0]} className="w-full" />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={isRecording ? stopRecording : startRecording} className="bg-purple-500 py-2 rounded text-white">
                  {isRecording ? '🛑 STOP' : '🦆 NEW HONK'}
                </button>
                {!isFrameMode && (
                  <button onClick={() => setShowQR(true)} className="bg-blue-500 py-2 rounded text-white">
                    SHARE
                  </button>
                )}
              </div>
              {!isFrameMode && (
                <button onClick={clearHonks} className="bg-red-500 py-2 w-full rounded text-white">
                  CLEAR ALL HONKS
                </button>
              )}
            </div>
          )}
        </div>

        {!isFrameMode && (
          <div className="bg-gray-100 p-2 text-center text-sm text-gray-600">
            Made with 🦆 + ZK Identity via Self.xyz
          </div>
        )}
      </div>
    </div>
  );
}


// import { useState, useRef, useEffect } from 'react';
// import RecordRTC from 'recordrtc';
// import QRCode from 'react-qr-code';

// import { getReferralTag } from '@divvi/referral-sdk';
// import { createWalletClient, custom } from 'viem';
// import { celo } from 'viem/chains';

// // Fix TypeScript error for window.ethereum
// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

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

//   const params = new URLSearchParams(window.location.search);
//   const isFrameMode = params.has('frame');

//   useEffect(() => {
//     if (isFrameMode) {
//       window.history.replaceState({}, '', '/');
//       startRecording();
//     }
//   }, [isFrameMode]);

//   const playSound = () => {
//     if (isMuted) return;
//     const audio = new Audio('/honk.mp3');
//     audio.volume = 0.3;
//     audio.play().catch(e => console.log('Audio play failed:', e));
//   };

//   const startRecording = async () => {
//     if (isFrameMode) {
//       document.documentElement.classList.add('frame-mode');
//     }

//     playSound();

//     try {
//       if (!window.ethereum) {
//         alert('Please install MetaMask or another Ethereum wallet.');
//         return;
//       }

//       const walletClient = createWalletClient({
//         chain: celo,
//         transport: custom(window.ethereum),
//       });

//       const [account] = await walletClient.getAddresses();

//       const referralTag = getReferralTag({
//         user: account,
//         consumer: '0xbB62F4d426A5b1DAE90d2a86ad7F0D0Dd12e7646', // Your Divvi Identifier
//       });

//       console.log('Referral tag:', referralTag);

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
//       console.error('Microphone access error:', err);
//       alert('Could not access microphone. Check your browser permissions.');
//     }
//   };

//   const stopRecording = () => {
//     playSound();
//     if (isFrameMode) {
//       document.documentElement.classList.remove('frame-mode');
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

//   // Frame mode detection
//   const params = new URLSearchParams(window.location.search);
//   const isFrameMode = params.has('frame');

//   useEffect(() => {
//     if (isFrameMode) {
//       // Clean the URL without reload
//       window.history.replaceState({}, '', '/');
//       // Start recording automatically
//       startRecording();
//     }
//   }, [isFrameMode]);

//   const playSound = () => {
//     if (isMuted) return;
//     const audio = new Audio('/honk.mp3');
//     audio.volume = 0.3;
//     audio.play().catch(e => console.log('Audio play failed:', e));
//   };

//   const startRecording = async () => {
//     if (isFrameMode) {
//       document.documentElement.classList.add('frame-mode');
//     }
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
//     if (isFrameMode) {
//       document.documentElement.classList.remove('frame-mode');
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