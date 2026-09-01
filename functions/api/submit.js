export async function onRequestPost(context) {
  try {
    const { name, phone } = await context.request.json();
    if (!name || !phone) {
      return new Response(JSON.stringify({ msg: "字段不能为空" }), { status: 400 });
    }
    
    // 使用绑定的 KV 空间（变量名为 DB）
    const kv = context.env.DB;
    const id = Date.now().toString();
    const data = { name, phone, time: Date.now() };
    
    // 以 signup: 开头存入 KV
    await kv.put(`signup:${id}`, JSON.stringify(data));
    
    return new Response(JSON.stringify({ msg: "报名成功！" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ msg: err.message }), { status: 500 });
  }
}
