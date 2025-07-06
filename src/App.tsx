import { MiniAppProvider } from '@neynar/react';
import VoiceRecorder from './components/VoiceRecorder';

export default function App() {
  return (
    <MiniAppProvider analyticsEnabled={true}>
      <div className="absolute inset-0 overflow-auto bg-gray-100">  
        <VoiceRecorder />
      </div>
    </MiniAppProvider>
  );
}

// import VoiceRecorder from './components/VoiceRecorder';

// function App() {
//   return (
//     <div className="absolute inset-0 overflow-auto bg-gray-100">  
//         <VoiceRecorder />
//     </div>
//   );
// }

// export default App;


