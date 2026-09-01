// 处理修改 (PUT 请求)
export async function onRequestPut(context) {
  try {
    const kv = context.env.DB || context.env.db;
    const { id, name, phone } = await context.request.json();
    
    if (!id || !name || !phone) {
      return new Response(JSON.stringify({ msg: "缺少必要字段" }), { status: 400 });
    }

    // 先检查是否存在
    const exist = await kv.get(`signup:${id}`);
    if (!exist) return new Response(JSON.stringify({ msg: "记录不存在" }), { status: 404 });

    const oldData = JSON.parse(exist);
    const updatedData = {
      name,
      phone,
      time: oldData.time // 保持原有的报名时间不变
    };

    // 重新写入 KV，覆盖旧数据
    await kv.put(`signup:${id}`, JSON.stringify(updatedData));
    return new Response(JSON.stringify({ msg: "更新成功" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ msg: err.message }), { status: 500 });
  }
}

// 处理删除 (DELETE 请求)
export async function onRequestDelete(context) {
  try {
    const kv = context.env.DB || context.env.db;
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) return new Response(JSON.stringify({ msg: "缺少ID参数" }), { status: 400 });

    // 从 KV 中删除对应的键
    await kv.delete(`signup:${id}`);
    return new Response(JSON.stringify({ msg: "删除成功" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ msg: err.message }), { status: 500 });
  }
}
