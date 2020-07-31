



const {
    UCommon,
} = require('../../module');
const {
    commonParams
} = require('../../module/config');

module.exports = async(ctx,next) => {
    const {
        radioId
    } = ctx.request.query

    console.log(radioId)
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
            data: {"songlist":{"module":"pf.radiosvr","method":"GetRadiosonglist","param":{"id":Number(radioId),"firstplay":1,"num":100}},"radiolist":{"module":"pf.radiosvr","method":"GetRadiolist","param":{"ct":"24"}},"comm":{"ct":24,"cv":0}}
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
