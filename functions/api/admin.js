export async function onRequest(context) {
  // 统一拦截处理，不管是 GET 还是 POST 请求
  const req = context.request;
  const kv = context.env.DB || context.env.db;
  
  // 【这里配置你的核心密码】这个密码存在 Cloudflare 云端服务器，任何人的 F12 都不可能看到它！
  const REAL_ADMIN_PASSWORD = "CN_123456_Cloudflare";

  try {
    // 场景 A：前端发来密码进行“解锁验证” (POST 请求)
    if (req.method === "POST") {
      const { password } = await req.json();
      if (password === REAL_ADMIN_PASSWORD) {
        // 密码正确，返回成功。在实际高阶项目中这里会下发加密 Token，咱们通过状态码先拉通安全闭环
        return new Response(JSON.stringify({ success: true, msg: "授权成功" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ success: false, msg: "口令错误，拒绝颁发凭证" }), { status: 401 });
    }

    // 场景 B：前端请求拉取数据列表 (GET 请求)
    if (req.method === "GET") {
      // 检查请求头里是否带了前端送过来的验证密令
      const authHeader = req.headers.get("Authorization");
      if (authHeader !== REAL_ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ msg: "安全防御：非法请求，拒绝提供敏感数据！" }), { status: 0 });
      }

      // 验证通过，才去读取真实的 KV 数据库
      const list = await kv.list({ prefix: "signup:" });
      const users = [];
      for (const key of list.keys) {
        const val = await kv.get(key.name);
        if (val) {
          const parsed = JSON.parse(val);
          parsed.id = key.name.replace("signup:", "");
          users.push(parsed);
        }
      }
      users.sort((a, b) => b.time - a.time);
      return new Response(JSON.stringify({ total: users.length, users }), {
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({ msg: err.message }), { status: 500 });
  }
}
