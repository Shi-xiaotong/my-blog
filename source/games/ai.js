// Agnes AI 通用调用模块
// 支持文本、图片、视频等所有 Agnes 模型
// 使用前需部署 Cloudflare Worker，见 ai-worker.js

const AI_ENDPOINT = 'https://ai.233002.xyz'; // 改成你的 Worker 地址

/**
 * 通用 AI 调用
 * @param {object} body - 完整请求体（model, messages, endpoint 等）
 * @returns {Promise<object>} 原始响应
 */
async function aiRequest(body) {
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('AI call failed:', e);
    return null;
  }
}

/**
 * 文本对话
 * @param {string} prompt - 用户提示
 * @param {string} system - 系统提示（可选）
 * @param {object} opts - 额外选项
 * @returns {Promise<string>} AI 回复文本
 */
async function askAI(prompt, system = '', opts = {}) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const data = await aiRequest({
    model: opts.model || 'agnes-2.0-flash',
    messages,
    temperature: opts.temperature ?? 0.8,
    max_tokens: opts.max_tokens ?? 200,
  });

  return data?.choices?.[0]?.message?.content || '';
}

/**
 * AI 图片生成
 * @param {string} prompt - 图片描述
 * @param {object} opts - 额外选项（size, style 等）
 * @returns {Promise<string|null>} 图片 URL 或 base64
 */
async function generateImage(prompt, opts = {}) {
  const data = await aiRequest({
    model: opts.model || 'agnes-image-2.0-flash',
    endpoint: opts.endpoint || 'images/generations',
    prompt,
    n: 1,
    size: opts.size || '1024x1024',
  });
  // 响应格式取决于 Agnes API，可能是 URL 或 base64
  return data?.data?.[0]?.url || data?.data?.[0]?.b64_json || null;
}

/**
 * AI 视频生成
 * @param {string} prompt - 视频描述
 * @param {object} opts - 额外选项
 * @returns {Promise<string|null>} 视频 URL
 */
async function generateVideo(prompt, opts = {}) {
  const data = await aiRequest({
    model: opts.model || 'agnes-video-v2.0',
    endpoint: opts.endpoint || 'videos/generations',
    prompt,
  });
  return data?.data?.[0]?.url || null;
}

// ===== 游戏专用 AI 函数 =====

async function getGameComment(gameName, score, won) {
  const system = '你是一个游戏评论员，用简短有趣的话点评玩家表现。用中文回复，不超过30字。';
  const prompt = `游戏：${gameName}，得分：${score}，${won ? '通关了' : '失败了'}。给一句点评。`;
  return askAI(prompt, system, { temperature: 1.0, max_tokens: 60 });
}

async function getTicTacToeTaunt(move) {
  const system = '你是一个傲娇的井字棋AI对手，用简短的话嘲讽玩家。用中文，不超过20字。';
  const prompt = `我刚下了第${move}步，该你了。说句话。`;
  return askAI(prompt, system, { temperature: 1.2, max_tokens: 30 });
}

async function generateTypingText() {
  const system = 'Generate a single English sentence for typing practice. 40-60 characters. Only return the sentence, nothing else.';
  const prompt = 'Give me a random interesting sentence about technology or science.';
  return askAI(prompt, system, { temperature: 1.0, max_tokens: 80 });
}
