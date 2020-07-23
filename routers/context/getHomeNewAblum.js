



const {
    UCommon,
} = require('../../module');
const {
    commonParams
} = require('../../module/config');


module.exports = async(ctx,next) => {
    const {
        area
    } = ctx.request.query

    const params = Object.assign(commonParams, {
        format: "json",
        inCharset: "utf8",
        outCharset: "utf-8",
        notice: 0,
        platform: "yqq.json",
        needNewCode: 0,
    });


    const props = {
        method: 'get',
        option: {},
        params,
    }


    let reqData = {"comm":{"ct":24},"new_album":{"module":"newalbum.NewAlbumServer","method":"get_new_album_info","param":{"area":Number(area),"sin":0,"num":20}}}




    const data = await UCommon({
        ...props,
        params:{
            ...params,
            data:reqData
        }
    }).then(res => {
        return res.data
    }).catch(error => {
        console.log(error)
    })


    Object.assign(ctx, {
        body: {
            status: 200,
            data,
        },
    });

}
