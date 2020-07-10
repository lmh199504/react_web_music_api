
const { UserModel } = require('../../db/models')
const md5 = require('blueimp-md5')
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
        console.log(saveData)
        ctx.session.username = saveData.username
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

}

