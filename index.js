const PORT = process.env.PORT || 3000;
const fetch = require('node-fetch');
const express = require("express");
const app = express();

// 本地测试用小炒雀 https://xiaochaoque.com
// const API_HOST = 'https://xiaochaoque.com';
const API_HOST = 'https://api.openai.com';

app.use(express.json());

app.post("/api/*", async (request, response) => {
  //收到请求，向终端输出标记
  console.log('\n🤖️ POST 请求已接收，开始处理 🤖️');

  //拼接 OpenAI API 转发地址
  const url = API_HOST + request.url.substring(4);
  console.log('\n🤖️ 即将将请求转发至：🤖️\n', url);

  //读取 req 中的 Authorization，存放在 authKey 中
  const authKey = request.header("Authorization");
  if (!authKey) return new Response("Not allowed", { status: 403 });
  console.log('\n🤖️ req.header.Authorization：🤖️\n', authKey);

  //读取 req 中的 body, 存放在 body 中
  const body = request.body;
  console.log('\n🤖️ req.body：🤖️\n', JSON.stringify(body, null, "\t"));


  // 入参中如果包含了 stream=true，则表现形式为流式输出
  let result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authKey
    },
    body: JSON.stringify(body),
  });

  const resultJSON = await result.json();

  console.log('\n🤖️ 请求结果已返回 🤖️\n');

  response.set({
    "Content-Type": "application/json",
    "Cross-Origin-Resource-Policy": "Cross-Origin",
    "Access-Control-Allow-Origin": "*"
  })
  return response.status(result.status).send(resultJSON);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
