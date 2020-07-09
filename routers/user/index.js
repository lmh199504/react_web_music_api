
// const { UserModel } = require('../../db/models')

exports.register = (ctx,next) => {
    console.log('---------->')
    console.log(ctx.request.body)
    ctx.status = 200
    ctx.body = {
        data:{
            username:'xxxx',
            password:'syyy'
        }
    }
}
