export default function handler(_req: any, res: any) {
  res.status(200).json({
    frame: {
      version: 'vNext',
      image: 'https://honk-frame.vercel.app/frame-preview.png',
      button: [
        { label: '🪿 Another Honk' }
      ],
      post_url: 'https://honk-frame.vercel.app/api/honk-response'
    }
  });
}

// // /api/honk-response.ts
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

