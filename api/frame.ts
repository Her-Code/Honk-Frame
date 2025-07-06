export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed.' });
  }

  return res.status(200).json({
    frames: {
      version: 'vNext',
      image: 'https://honk-frame.vercel.app/frame-preview.png',
      buttons: [{ label: '🦆 Honk Again' }],
      post_url: 'https://honk-frame.vercel.app/api/frame'
    }
  });
}
// import type { VercelRequest, VercelResponse } from '@vercel/node';

// export default function handler(req: VercelRequest, res: VercelResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Only POST requests are allowed.' });
//   }

//   return res.status(200).json({
//     frames: {
//       version: 'vNext',
//       image: 'https://honk-frame.vercel.app/frame-preview.png',
//       buttons: [
//         { label: '🦆 Honk Again' }
//       ],
//       post_url: 'https://honk-frame.vercel.app/api/frame'
//     }
//   });
// }

// export default function handler(_req: any, res: any) {
//   res.status(200).json({
//     frame: {
//       version: 'vNext',
//       image: 'https://honk-frame.vercel.app/frame-preview.png',
//       button: [
//         { label: '🪿 Another Honk' }
//       ],
//       post_url: 'https://honk-frame.vercel.app/?frame=true'
//     }
//   });
// }

// // // /api/honk-response.ts
// export default function handler(req: any, res: any) {
//   res.status(200).json({
//     frame: {
//       version: 'vNext',
//       image: 'https://honk-frame.vercel.app/frame-preview.png',
//       button: [
//         { label: '🪿 Another Honk' }
//       ],
//       post_url: 'https://honk-frame.vercel.app/api/honk-response'
//     }
//   });
// }

// import type { VercelRequest, VercelResponse } from '@vercel/node';

// export default function handler(req: VercelRequest, res: VercelResponse) {
//   res.status(200).json({
//     frame: {
//       version: 'vNext',
//       image: 'https://honk-frame.vercel.app/frame-preview.png',
//       button: [
//         {
//           label: '🪿 Another Honk'
//         }
//       ],
//       post_url: 'https://honk-frame.vercel.app/api/honk-response'
//     }
//   });
// }

