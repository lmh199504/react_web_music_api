

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
    headerImg:{type:String,default:'https://reactlmh.oss-cn-beijing.aliyuncs.com/heaher/23073179092.jpg'},
    tags:{type:Array},
    token:{type:String}
})
const UserModel = mongoose.model('user',userChema)
exports.UserModel = UserModel

const loveSongChema = mongoose.Schema({
    userId:{type:String,isRequired:true,unique:true},
    songList:{type:Array,isRequired:true}
})
const LoveModel = mongoose.model('love',loveSongChema)
exports.LoveModel = LoveModel

