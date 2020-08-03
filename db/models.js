

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/reactMusic',{ useNewUrlParser: true,useUnifiedTopology: true })
const conn = mongoose.connection
conn.on("connected",() => {
    console.log("数据库连接成功")
})

//文档对象
const userSchema = mongoose.Schema({
    username:{type:String,isRequired:true},
    password:{type:String,isRequired: true},
    headerImg:{type:String,default:'https://reactlmh.oss-cn-beijing.aliyuncs.com/heaher/23073179092.jpg'},
    tags:{type:Array},
    token:{type:String}
})
const UserModel = mongoose.model('user',userSchema)
exports.UserModel = UserModel


//喜欢的歌曲
const loveSongSchema = mongoose.Schema({
    userId:{type:String,isRequired:true,unique:true},
    songList:{type:Array,isRequired:true}
})
const LoveModel = mongoose.model('love',loveSongSchema)
exports.LoveModel = LoveModel


//喜欢的歌手
const loveSingerSchema = mongoose.Schema({
    userId:{ type:String,isRequired:true },
    singers:{ type:Array,isRequired:true }
})

const LoveSingerModel = mongoose.model('song',loveSingerSchema)

exports.LoveSingerModel = LoveSingerModel


//收藏的歌单
const loveClassSchema = mongoose.Schema({
    userId:{type:String,isRequired:true},
    classFid:{type:Array,isRequired:true}
})
const LoveClassModel = mongoose.model('classfid',loveClassSchema)
exports.LoveClassModel = LoveClassModel
