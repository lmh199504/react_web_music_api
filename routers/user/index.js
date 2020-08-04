
const { UserModel,LoveModel,LoveSingerModel,LoveSheetModel,UserSheetModel } = require('../../db/models')
const md5 = require('blueimp-md5')
const uuid = require('uuid')
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
    if(username){
        const findData = await UserModel.findOne({username},filter)

        ctx.status = 200
        ctx.body = {
            code:0,
            data:findData
        }
    }else {
        ctx.status = 200
        ctx.body = {
            code:10000,
            msg:'请先登陆'
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
    let { songList } = ctx.request.body

    const result = await LoveModel.findOne({userId})

    if(result === null){
        const saveData =  await new LoveModel({userId,songList}).save()
        ctx.body = {
            code:0,
            data:{
                songList
            }
        }
    }else{
        const list = result.songList
        for(let i=0;i<songList.length;i++){
            let index = list.findIndex(item=>item.songmid === songList[i].songmid)
            if(index === -1){
                list.push(songList[i])
            }
        }

        const upData = await LoveModel.findOneAndUpdate({userId},{$set:{'songList':list}})
        ctx.body = {
            code:0,
            data:{
                songList:list
            }
        }

    }

}


exports.delLoveSong = async (ctx,next) => {
    const { userId,delList } = ctx.request.body

    let { songList } =  await LoveModel.findOne({userId})

    for(let i = 0;i<delList.length;i++){
        let index = songList.findIndex(item => item.songmid === delList[i].songmid)
        if(index !== -1){
            songList.splice(index,1)
        }
    }
    const upData = await LoveModel.findOneAndUpdate({userId},{$set:{songList:songList}})
    // console.log(upData)
    ctx.body = {
        code:0,
        data:{
            songList:songList
        }
    }
}


exports.getLoveSong = async (ctx,next) => {

    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const findData = await LoveModel.findOne({userId:_id})

    if(findData === null){
        ctx.body = {
            code:0,
            data:{songList:[]}
        }
    }else{
        ctx.body = {
            code:0,
            data:{songList:findData.songList}
        }
    }
}

exports.addLoveSinger = async (ctx,next) => {
    const { singer } =  ctx.request.body
    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    console.log(_id)
    const findData = await LoveSingerModel.findOne({userId:_id})
    if(!findData){
        const saveData = await new LoveSingerModel({userId:_id,singers:[{...singer}]}).save()
        ctx.body = {
            code:0,
            data:{
                singers:saveData.singers
            }
        }
    }else{
        let { singers } = findData
        const index = singers.findIndex(item => item.singermid === singer.singermid)
        if(index === -1){
            await LoveSingerModel.findOneAndUpdate({userId:_id},{singers:[...singers,singer]})
            ctx.body = {
                code:0,
                data:{
                    singer:[...singers,singer]
                }
            }
        }else{
            ctx.body = {
                code:10000,
                msg:"已经关注了."
            }
        }
    }
}


exports.delLoveSinger = async (ctx,next) => {
    const { singer } = ctx.request.body
    const { username } = ctx.session
    const { _id } = await UserModel.findOne({username})
    const findeData = await LoveSingerModel.findOne({userId:_id})

    if(findeData === null){
        ctx.body = {
            code:10000,
            msg:'没有关注该歌手.'
        }
    }else {
        const {singers} = findeData
        const index = singers.findIndex(item => item.singermid === singer.singermid)
        if(index === -1){
            ctx.body = {
                code:10000,
                msg:'没有关注该歌手.'
            }
        }else{
            singers.splice(index,1)
            await LoveSingerModel.findOneAndUpdate({userId:_id},{singers})
            ctx.body = {
                code:0,
                data:{
                    singers
                }
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
        const findData = await LoveSingerModel.findOne({userId:_id})
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
                    singers:findData.singers
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
            console.log(saveData)
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


exports.addUserSheet = async (ctx,next) => {
    const { username } = ctx.session
    const { desc,name } = ctx.request.body
    const file = ctx.request.files.file;
    console.log(file)
    
    const { _id } = await UserModel.findOne({username})
    const saveData = await new UserSheetModel({userId:_id,desc,name,sheetId:uuid.v1()}).save()
    ctx.body = {
        code:0,
        data:{
            saveData
        }
    }
}
