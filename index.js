const PORT = process.env.PORT || 3000;

const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/v1*", async (request, response) => {
  console.log('🤖️ POST 请求已接收：\n', JSON.stringify(request.body, null, "\t")); //JSON.stringify(request.body,null,"\t") 让 console 的 json 格式化，更易读
  
  const url = "https://api.openai.com" + request.url.substring(4);
  const fetchAPI = new URL(url);

  console.log('🤖️ 请求将转发至：\n', fetchAPI);

  // 部分代理工具，请求由浏览器发起，跨域请求时会先发送一个 preflight 进行检查，也就是 OPTIONS 请求
  // 需要响应该请求，否则后续的 POST 会失败
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  let body;
  if (request.method === 'POST') body = request.body;

  const authKey = request.header("Authorization");
  console.log('🤖️ authKey：\n', authKey);

  if (!authKey) return new Response("Not allowed", { status: 403 });

  const payload = {
    method: "POST",
    headers: {
      'Content-Type': "application/json",
      'Authorization': authKey
    },
    body, //body: typeof body === 'object' ? JSON.stringify(body) : '{}',
  };

  console.log('🤖️ payload：\n', payload);

  // 入参中如果包含了 stream=true，则表现形式为流式输出
  response = await fetch(fetchAPI, payload);
  console.log('🤖️ get response');

  if (body && body.stream !== true) {
    console.log('🤖️ !== stream');
    return new Response(JSON.stringify(response, null, "\t"), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cross-Origin-Resource-Policy": "Cross-Origin",
        "Access-Control-Allow-Origin": "*"
      },
    });
  } else {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
