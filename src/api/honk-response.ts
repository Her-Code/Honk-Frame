// /api/honk-response.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    frame: {
      version: 'vNext',
      image: 'https://honk-frame.vercel.app/honk-success.png',
      button: [
        {
          label: '🪿 Another Honk'
        }
      ],
      post_url: 'https://honk-frame.vercel.app/api/honk-response'
    }
  });
}
