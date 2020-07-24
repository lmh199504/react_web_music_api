const {
  UCommon,
} = require('../../module');

// area_id=15&version_id=7
module.exports = async (ctx, next) => {
  const {
    area_id = 15,
    version_id = 7,
    size = 20,
    page = 0,
    order = 1
  } = ctx.query;
  const start = (page - 1 || 0) * size || 0;
  const data = {
    comm: {
      ct: 24
    },
    mv_tag: {
      module: 'MvService.MvInfoProServer',
      method: 'GetAllocTag',
      param: {}
    },
    mv_list: {
      module: 'MvService.MvInfoProServer',
      method: 'GetAllocMvInfo',
      param: {
        start:start>0?start:0,
        size:+size,
        version_id:+version_id,
        area_id:+area_id,
        order: +order
      }
    }
  }

  const params = Object.assign({
    format: 'json',
    data: data,
  });
  const props = {
    method: 'get',
    params,
    option: {}
  };
  if (version_id && area_id) {
    await UCommon(props).then((res) => {
      const response = res.data;
      ctx.status = 200;
      ctx.body = {
        response,
      }
    }).catch(error => {
      console.log(`error`, error);
    });
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'version_id or area_id is null',
    }
  }
};
