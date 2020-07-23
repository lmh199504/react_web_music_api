const {
  getMvByTag,
} = require('../../module');

// songmid=001CLC7W2Gpz4J
module.exports = async (ctx, next) => {
  let { lan } = ctx.request.query
  if(!lan){
    lan = 'all'
  }
  const props = {
    method: 'get',
    params: {lan},
    option: {}
  };
  const { status, body } = await getMvByTag(props);
  Object.assign(ctx, {
    status,
    body,
  });
};
