



const {
    UCommon,
} = require('../../module');
const {
    commonParams
} = require('../../module/config');

module.exports = async(ctx,next) => {
    const {
        singermid,
        order = 1,
        limit = 1000
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


    const data = await UCommon({
        ...props,
        params:{
            ...params,
            data:{"comm":{"ct":24,"cv":0},"singerSongList":{"method":"GetSingerSongList","param":{"order":order,"singerMid":singermid,"begin":0,"num":limit},"module":"musichall.song_list_server"}}
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
