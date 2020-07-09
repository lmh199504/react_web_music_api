

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/reactMusic',{ useNewUrlParser: true,useUnifiedTopology: true })
const conn = mongoose.connection
conn.on("connected",() => {
    console.log("数据库连接成功")
})

//文档对象
const userChema = mongoose.Schema({
    username:{type:String,isRequired:true},
    password:{type:String,isRequired: true},
    headerImg:{type:String,default:'asdfasdfasd'},
    tags:{type:Array},
    token:{type:String}
})
const UserModel = mongoose.model('user',userChema)
exports.UserModel = UserModel
