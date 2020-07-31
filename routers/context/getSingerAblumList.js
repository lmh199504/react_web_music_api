



const {
    UCommon,
} = require('../../module');
const {
    commonParams
} = require('../../module/config');

module.exports = async(ctx,next) => {
    const {
        singermid,
        limit = 5
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
            data:{"comm":{"ct":24,"cv":0},"getAlbumList":{"method":"GetAlbumList","param":{"singerMid":singermid,"order":0,"begin":0,"num":limit,"songNumTag":0,"singerID":0},"module":"music.musichallAlbum.AlbumListServer"}}
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
