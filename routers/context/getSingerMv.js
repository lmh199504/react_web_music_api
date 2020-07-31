const {
  getSingerMv,
} = require('../../module');

module.exports = async (ctx, next) => {
  const {
    singermid,
    order = 'listen',
    num = 5,
  } = ctx.query;
  let params = Object.assign({
    singermid,
    order,
    num,
  });
  if (order && order.toLowerCase() === 'time') {
    params = Object.assign(params, {
      cmd: 1,
      begin:0
    })
  }
  const props = {
    method: 'get',
    params,
    option: {}
  };
  if (singermid) {
    const { status, body } = await getSingerMv(props);
    Object.assign(ctx, {
      status,
      body,
    })
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'no singermid',
    }
  }
};
