const PORT = process.env.PORT || 3000;
const fetch = require('node-fetch');
const express = require("express");
const app = express();

const API_HOST = 'https://api.openai.com';

app.use(express.json());

app.post("/api/*", async (request, response) => {

  //拼接 OpenAI API 转发地址
  const url = API_HOST + request.url.substring(4);

  //读取 req 中的 Authorization，存放在 authKey 中
  const authKey = request.header("Authorization");
  if (!authKey) return new Response("Not allowed", { status: 403 });

  //读取 req 中的 body, 存放在 body 中
  const body = request.body;

  // 入参中如果包含了 stream=true，则表现形式为流式输出
  try {
    let result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authKey
      },
      body: JSON.stringify(body),
    });
    const resultJSON = await result.json();
    response.set({
      "Content-Type": "application/json",
      "Cross-Origin-Resource-Policy": "Cross-Origin",
      "Access-Control-Allow-Origin": "*"
    })
    response.status(result.status).send(resultJSON);
  } catch {
    response.status(500).json({ error: error.message });
  }

});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
