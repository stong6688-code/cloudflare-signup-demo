export async function onRequestGet(context) {
  try {
    const kv = context.env.DB || context.env.db;
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    // 如果带有 id 参数，说明是查询单条数据（准备修改时回显）
    if (id) {
      const val = await kv.get(`signup:${id}`);
      if (!val) return new Response(JSON.stringify({ msg: "未找到该记录" }), { status: 404 });
      return new Response(val, { headers: { "Content-Type": "application/json" } });
    }

    // 否则，执行原本的列表查询
    const list = await kv.list({ prefix: "signup:" });
    const users = [];
    for (const key of list.keys) {
      const val = await kv.get(key.name);
      if (val) {
        const parsed = JSON.parse(val);
        parsed.id = key.name.replace("signup:", ""); // 把 ID 提取出来传给前端
        users.push(parsed);
      }
    }
    users.sort((a, b) => b.time - a.time);
    return new Response(JSON.stringify({ total: users.length, users }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ msg: err.message }), { status: 500 });
  }
}
