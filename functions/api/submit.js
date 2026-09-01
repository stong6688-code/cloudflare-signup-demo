export async function onRequestPost(context) {
  try {
    const { name, phone } = await context.request.json();
    if (!name || !phone) {
      return new Response(JSON.stringify({ msg: "字段不能为空" }), { status: 400 });
    }
    
    // 【升级点】自动兼容大写 DB 和小写 db
    const kv = context.env.DB || context.env.db;
    if (!kv) {
      return new Response(JSON.stringify({ msg: "未找到绑定的 KV 空间，请检查设置" }), { status: 500 });
    }

    const id = Date.now().toString();
    const data = { name, phone, time: Date.now() };
    
    await kv.put(`signup:${id}`, JSON.stringify(data));
    
    return new Response(JSON.stringify({ msg: "报名成功！" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ msg: err.message }), { status: 500 });
  }
}
