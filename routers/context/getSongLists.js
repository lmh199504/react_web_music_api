const {
  songLists,
} = require('../../module');

/**
 * @description: 2, 3
 * @param {page} 页数
 * @param {limit} 每页条数[20, 60]
 * @param {categoryId} 分类
 * @param {sortId} 分类
 * @return:
 */
module.exports = async (ctx, next) => {
  const {
    limit=20,
    page=1,
    sortId = 5,
    categoryId = 10000000
  } = ctx.query;
  const params = Object.assign({
    categoryId,
    sortId,
    sin: (page - 1) * limit,
    ein: page * 20 - 1,

  /*sin:开始
  * ein：结束
  * */
  });
  const props = {
    method: 'get',
    params,
    option: {}
  };
  const { status, body } = await songLists(props);
  Object.assign(ctx, {
    status,
    body,
  })
}
