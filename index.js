const PORT = process.env.PORT || 3000;

const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/v1*", async (request, response) => {
  //收到请求，向终端输出标记
  console.log('🤖️ POST 请求已接收：\n');

  //拼接 OpenAI API 转发地址
  const url = "https://api.openai.com" + request.url.substring(4);
  console.log('🤖️ 即将将请求转发至：\n', url);

  //读取 req 中的 Authorization，存放在 authKey 中
  const authKey = request.header("Authorization");
  if (!authKey) return new Response("Not allowed", { status: 403 });
  console.log('🤖️ req.header.Authorization：\n', authKey);

  //读取 req 中的 body, 存放在 body 中
  const body = request.body;
  console.log('🤖️ req.body：\n', JSON.stringify(body, null, "\t"));


  // 入参中如果包含了 stream=true，则表现形式为流式输出
  let result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authKey
    },
    body: JSON.stringify(body),
  });
  console.log('🤖️ 请求结果已返回\n');

  if (body && body.stream !== true) {
    console.log('🤖️ !== stream');
    return new Response(JSON.stringify(result, null, "\t"), {
      status: result.status,
      headers: {
        "Content-Type": "application/json",
        "Cross-Origin-Resource-Policy": "Cross-Origin",
        "Access-Control-Allow-Origin": "*"
      },
    });
  } else {
    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
