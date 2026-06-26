// Cloudflare Worker - Agnes AI 通用代理
// 支持文本、图片、视频等所有 Agnes 模型
//
// 部署步骤：
// 1. Cloudflare Dashboard → Workers & Pages → Create Worker
// 2. 粘贴此代码，保存并部署
// 3. Settings → Variables and Secrets → 添加: AGNES_API_KEY = 你的API密钥
// 4. (可选) 绑定自定义域名如 ai.233002.xyz

export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = env.AGNES_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const body = await request.json();

      // 前端指定的模型，默认 agnes-2.0-flash
      const model = body.model || 'agnes-2.0-flash';

      // 前端指定的端点路径，默认 chat/completions
      // 可选值: 'chat/completions', 'images/generations', 'videos/generations' 等
      const endpoint = body.endpoint || 'chat/completions';

      // 从请求中移除自定义字段，剩下的全部转发给 Agnes
      delete body.endpoint;

      // 文本模型限制 max_tokens（默认上限 4096，工具页可传更大值）
      if (endpoint === 'chat/completions') {
        if (!body.max_tokens || body.max_tokens > 4096) {
          body.max_tokens = 2048;
        }
      }

      // 设置模型名
      body.model = model;

      // 构建 Agnes API URL
      const agnesUrl = `https://apihub.agnes-ai.com/v1/${endpoint}`;

      // 转发请求
      const response = await fetch(agnesUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // 图片/视频 API 可能返回二进制或不同的格式
      const contentType = response.headers.get('content-type') || 'application/json';

      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
