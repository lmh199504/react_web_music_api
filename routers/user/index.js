
const { UserModel,LoveModel,LoveSingerModel,LoveSheetModel,UserSheetModel,SheetSongModel } = require('../../db/models')
const md5 = require('blueimp-md5')
const uuid = require('uuid')
const ossConfig = require('../../util/ossConfig')
const OSS = require('ali-oss')
const filter = { password:0,__v:0 }  //指定过滤的属性
exports.register = async (ctx,next) => {
    const { username,password,password2 } = ctx.request.body
    if(username === ''){
        ctx.status = 200
        ctx.body = {
            code:10000,
            msg:"用户名不能为空"
        }
        return
    }

    if(password === ''){
        ctx.status = 200
        ctx.body = {
            code:10000,
            msg:"密码不能为空"
        }
        return
    }

    if(password != password2){
        ctx.status = 200
        ctx.body = {
            code:10000,
            msg:"两次密码不一致"
        }
        return
    }

    const findResult =  await UserModel.findOne({username})

    if(findResult){
        ctx.status = 200
        ctx.body = {
            code:10000,
            msg:"用户名已被注册"
        }
    }else {
      const saveData =  await new UserModel({username,password:md5(password)}).save()
        ctx.session.username = saveData.username
        ctx.session._id = saveData._id
        ctx.status = 200
        ctx.body = {
            code:0,
            data:saveData
        }
    }
}


exports.login = async (ctx,next) => {
    const { username,password } = ctx.request.body
    if(username === '' || password === ''){

        ctx.status = 200
        ctx.body = {
            code:10000,
            msg:"用户名或密码不能为空"
        }
        return
    }

    const findData = await UserModel.findOne({username,password:md5(password)},filter)
    if(findData){
        ctx.session.username = findData.username
        ctx.session._id = findData._id
        ctx.status = 200
        ctx.body = {
            code:0,
            data:findData
        }
    }else {
        ctx.status = 200
        ctx.body = {
            code:10000,
            msg:"用户名或密码不正确"
        }
        return
    }
}

exports.getUserInfo = async  (ctx,next) => {
    const { username } =  ctx.session
	console.log(username)
    if(!!username){
        const findData = await UserModel.findOne({username},filter)
        if(findData){
            ctx.status = 200
            ctx.body = {
                code:0,
                data:findData
            }
        }else{
            ctx.status = 200
            ctx.body = {
                code:10000,
                msg:'请先登陆'
            }
        }

    }else {
        ctx.status = 200
        ctx.body = {
            code:10000,
            msg:'请先登陆'
        }
    }
}
exports.updateUserInfo = async (ctx,next) => {
    const { username } = ctx.session
    const { newUsername,newPassword,file,newPrivite } = ctx.request.body
    const findData = await UserModel.findOne({username})
    if(!findData._id){
        ctx.body = {
            code:10000,
            msg:"没有该用户."
        }
        return
    }
    if(file){
        const client = new OSS(ossConfig);
        const catalog = `/userheader/${findData._id}.png`
        const result = await client.put(catalog, Buffer.from(file, 'base64'));
        if(result.res.status === 200){
            const upData = await UserModel.findOneAndUpdate({username},{username:!newUsername?username:newUsername.trim(),password:!newPassword?findData.password:md5(newPassword),headerImg:result.url,isPrivate:!newPrivite?findData.isPrivate:newPrivite})
            ctx.body = {
                code:0,
                data:{
                    upData
                }
            }
        }else{
            ctx.body = {
                code:10000,
                msg:"图片保存失败."
            }
        }
    }else {
        const upData = await UserModel.findOneAndUpdate({username},{username:!newUsername?username:newUsername.trim(),password:!newPassword?findData.password:md5(newPassword),isPrivate:!newPrivite?findData.isPrivate:newPrivite})

        ctx.body = {
            code:0,
            data:{
                upData
            }
        }
    }
}



exports.logout = async (ctx,next) => {
    ctx.session.username = undefined
    ctx.session._id = undefined
    ctx.status = 200
    ctx.body = {
        code:0,
        msg:"退出成功"
    }
}


exports.addLoveSong = async (ctx,next) => {
    const { userId } = ctx.request.body
    if(!userId){
        ctx.body = {
            code:10000,
            msg:"参数错误"
        }
    }
    let { songList } = ctx.request.body

    const list = await LoveModel.find({userId})
    let num = 0
    for(let i=0;i<songList.length;i++){
        let index = list.findIndex(item=>item.songmid === songList[i].songmid)
        if(index === -1){
            await new LoveModel({userId,...songList[i]}).save()
            num ++
        }
    }

    ctx.body = {
        code:0,
        data:{
            num
        }
    }



}


exports.delLoveSong = async (ctx,next) => {
    const { userId,delList } = ctx.request.body
    let num = 0
    for(let i = 0;i<delList.length;i++){
        await LoveModel.findOneAndDelete({userId,songmid:delList[i].songmid})
        num ++
    }
    ctx.body = {
        code:0,
        data:{
            num
        }
    }

}


exports.getLoveSong = async (ctx,next) => {

    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const findData = await LoveModel.find({userId:_id})

    ctx.body = {
        code:0,
        data:{
            songList:findData
        }
    }
}

exports.addLoveSinger = async (ctx,next) => {
    const { singer } =  ctx.request.body
    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const findData = await LoveSingerModel.find({userId:_id})
    const index = findData.findIndex(item => item.singermid === singer.singermid)
    if(index === -1){
        await new LoveSingerModel({userId:_id,userId:_id,...singer,orderId:_id+singer.singermid}).save()
        ctx.body = {
            code:0,
            data:{
                singer
            }
        }
    }else{
        ctx.body = {
            code:10000,
            msg:"已经关注了."
        }
    }
}


exports.delLoveSinger = async (ctx,next) => {
    const { singer } = ctx.request.body
    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const findeData = await LoveSingerModel.find({userId:_id})

    if(findeData === null){
        ctx.body = {
            code:10000,
            msg:'没有关注该歌手.'
        }
    }else {
        const delData = await LoveSingerModel.findOneAndDelete({userId:_id,singermid:singer.singermid})
        ctx.body = {
            code:0,
            data:{
                delData
            }
        }
    }
}


exports.getLoveSinger = async (ctx,next) => {
    const { username } = ctx.session
    if(!username){
        ctx.body = {
            code:10000,
            msg:"获取关注歌手失败."
        }
    }else{
        const { _id } = await UserModel.findOne({username})
        const findData = await LoveSingerModel.find({userId:_id})
        if(!findData){
            ctx.body = {
                code:0,
                data:{
                    singers:[]
                }
            }
        }else{
            ctx.body = {
                code:0,
                data:{
                    singers:findData
                }
            }
        }
    }
}


exports.addLoveSheet = async (ctx,next) => {
    const { username } = ctx.session
    const { sheet } = ctx.request.body
    if(!username){
        ctx.body = {
            code:10000,
            msg:"收藏歌单失败."
        }
    }else{
        const { _id } = await UserModel.findOne({username})
        const findData = await LoveSheetModel.findOne({userId:_id})
        if(!findData){
            const saveData = await new LoveSheetModel({userId:_id,sheets:[{...sheet}]}).save()
            ctx.body = {
                code:0,
                data:{
                    sheets:[{...sheet}]
                }
            }
        }else{
            const { sheets } = findData
            await LoveSheetModel.findOneAndUpdate({userId:_id},{sheets:[...sheets,sheet]})
            ctx.body = {
                code:0,
                data:{
                    sheets:[...sheets,sheet]
                }
            }
        }
    }
}


exports.delLoveSheet = async (ctx,next) => {
    const { username } = ctx.session
    const { sheet } = ctx.request.body
    if(!username){
        ctx.body = {
            code:10000,
            msg:"删除失败，请重新登录."
        }
    }else {
        const { _id } = await UserModel.findOne({username})
        const findData = await LoveSheetModel.findOne({userId:_id})
        if(!findData){
            ctx.body = {
                code:10000,
                msg:"未收藏该歌单."
            }
        }else{
            const { sheets } = findData
            const index = sheets.findIndex(item => item.disstid === sheet.disstid)
            if(index === -1){
                ctx.body = {
                    code:10000,
                    msg:'未收藏该歌单...'
                }
            }else{
                sheets.splice(index,1)
                await LoveSheetModel.findOneAndUpdate({userId:_id},{sheets})
                ctx.body = {
                    code:0,
                    data:{
                        sheets:sheets
                    }
                }
            }
        }
    }
}


exports.getLoveSheets = async (ctx,next) => {
    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const findData =  await LoveSheetModel.findOne({userId:_id})
    if(!findData){
        ctx.body = {
            code:0,
            data:{
                sheets:[]
            }
        }
    }else {
        const { sheets } = findData
        ctx.body = {
            code:0,
            data:{
                sheets
            }
        }
    }
}

//创建歌单
exports.addUserSheet = async (ctx,next) => {
    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const { desc,name,file } = ctx.request.body

    const usheets =  await UserSheetModel.find({userId:_id})
    if(usheets){
        const index = usheets.findIndex(item => item.name === name)
        if(index !== -1){
            ctx.body = {
                code:10000,
                msg:"歌单名称重复."
            }
            return
        }
    }
    const sheetId = uuid.v1()
    if(file !== ''){
        const client = new OSS(ossConfig);
        const catalog = `/images/${sheetId}.png`
        const result = await client.put(catalog, Buffer.from(file, 'base64'));
        if(result.res.status === 200){
            const saveData = await new UserSheetModel({userId:_id,desc,name,sheetId:sheetId,sheetCover:result.url}).save()
            ctx.body = {
                code:0,
                data:{
                    usheet:saveData
                }
            }
        }else{
            ctx.body = {
                code:10000,
                msg:"图片保存失败."
            }
        }
    }else{
        const saveData = await new UserSheetModel({userId:_id,desc,name,sheetId:sheetId}).save()
        ctx.body = {
            code:0,
            data:{
                usheet:saveData
            }
        }
    }

}


exports.getUserSheet = async (ctx,next) => {
    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const usheets = await UserSheetModel.find({userId:_id})
    if(usheets){
        ctx.body = {
            code:0,
            data:{
                usheets
            }
        }
    }else{
        ctx.body = {
            code:0,
            data:{
                usheets:[]
            }
        }
    }
}
exports.delUserSheet = async (ctx,next) => {
    const { sheetId } = ctx.request.body
    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const delData = await UserSheetModel.findOneAndDelete({userId:_id,sheetId:sheetId})
    ctx.body = {
        code:0,
        data:{
            delData
        }
    }
}

//添加歌曲到用户创建的歌单
exports.addSongToSheet = async (ctx,next) => {
    const { sheetId,songList } = ctx.request.body
    if(!sheetId || !songList){
        ctx.body = {
            code:10000,
            msg:"参数错误"
        }
        return
    }
    console.log(songList)
    const { username } = ctx.session
    const { _id } = await UserModel.find({username})
    const findData = await SheetSongModel.find({userId:_id,sheetId:sheetId})
    let num = 0;
    for(let i = 0;i<songList.length;i++ ){
        // const findData = await SheetSongModel.find({userId:_id,sheetId:sheetId})
        const index = findData.findIndex(item => item.songmid === songList[i].songmid)
        if(index === -1){ //歌曲不在收歌单中
            songList[i].checked = false
            await new SheetSongModel({userId:_id,sheetId,...songList[i]}).save()
            num ++
        }else{
            console.log('第'+(i+1)+'首歌已在歌单中')
        }
    }

    ctx.body = {
        code:0,
        data:{
            num
        }
    }
}
//获取用户创建的歌单的歌曲
exports.getUserSheetSong = async (ctx,next) => {
    const { sheetId } = ctx.request.body
    console.log(sheetId)
    if(!sheetId){
        ctx.body = {
            code:10000,
            msg:"sheetId is error"
        }
    }else{
        const sheetData = await UserSheetModel.findOne({sheetId},filter)
        const songList = await SheetSongModel.find({sheetId},filter)
        ctx.body = {
            code:0,
            data:{
                songList,
                sheetData
            }
        }
    }
}
