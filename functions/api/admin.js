export async function onRequestGet(context) {
  try {
    // 【升级点】自动兼容大写 DB 和小写 db
    const kv = context.env.DB || context.env.db;
    if (!kv) {
      return new Response(JSON.stringify({ msg: "未找到绑定的 KV 空间，请检查设置" }), { status: 500 });
    }

    const list = await kv.list({ prefix: "signup:" });
    const users = [];
    
    for (const key of list.keys) {
      const val = await kv.get(key.name);
      if (val) users.push(JSON.parse(val));
    }
    
    users.sort((a, b) => b.time - a.time);

    return new Response(JSON.stringify({
      total: users.length,
      users: users
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ msg: err.message }), { status: 500 });
  }
}
