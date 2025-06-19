import axios from 'axios';
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  // Extract the path after /api/
  const match = req.url?.match(/^\/api\/(.*)/);
  const targetPath = match ? `/${match[1]}` : '';
  const targetUrl = `https://app.americansocceranalysis.com/api/v1${targetPath}`;

  try {
    const axiosResponse = await axios({
      method: req.method,
      url: targetUrl,
      headers: { ...req.headers, host: 'app.americansocceranalysis.com' },
      data: (req as any).body, // body parsing is not automatic in Node.js
      responseType: 'stream',
      validateStatus: () => true, // Forward all responses
    });

    res.statusCode = axiosResponse.status;
    // Forward headers except for transfer-encoding (which can cause issues)
    Object.entries(axiosResponse.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value as string);
      }
    });
    axiosResponse.data.pipe(res);
  } catch (error: any) {
    res.statusCode = error.response?.status || 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      message: 'Proxy error',
      error: error.message,
    }));
  }
}; 