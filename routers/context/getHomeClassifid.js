

const {
    UCommon,
} = require('../../module');
const {
    commonParams
} = require('../../module/config');


module.exports = async(ctx,next) => {
    const {
        curPage=1,
        size=20,
        order=5,
        titleid,
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


    let reqData = {}
    if(titleid == -1 ){

        reqData = {
            "comm":{"ct":24},
            "recomPlaylist":{
                "method":"get_hot_recommend",
                "param":{"async":1,"cmd":2},
                "module":"playlist.HotRecommendServer"
            }
        }
    }else {
        reqData = {
            "comm":{"ct":24},
            "playlist":{
                "method":"get_playlist_by_category",
                "param":{
                    "id":Number(titleid),
                    "curPage":curPage,
                    "size":size,
                    "order":order,
                    "titleid":Number(titleid)
                },
                "module":"playlist.PlayListPlazaServer"
            }
        }
    }





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
