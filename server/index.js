const express = require('express');
const app = express();
const cor = require('cors');
app.use(cor())
const mysql = require('mysql');
const multer = require('multer')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require("path");
app.use(express.static('uploads'))

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'intreg_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('connected to db')
});

//Setting storage engine
const storageEngine = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'./uploads')
    },
    filename: (req, file, callback) => {
        callback(null, `image${Date.now()}--${file.originalname}`);
    },
});


const checkFileType = function (file, callback) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/;

    //check extension names
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return callback(null, true);
    } else {
        callback("Error: You can Only Upload Images!!");
    }
};

const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    },
});

app.post('/upload', upload.single('photo'), (req, res) => {
    console.log(req.file.filename)
    const title = req.body.title;
    const price = req.body.price;
    const fileUploaded = req.file.filename
    console.log(title,price)
    db.query('insert into img_tb values(?,?,?,?)', [0 ,fileUploaded ,title,price], (err, result) => {
        if (err) throw err;
        res.send({ 'msg': 'List uploaded succesfully' })
    })
});

app.get('/viewUploads',(req,res)=>{
    db.query('select * from img_tb',(err,result)=>{
        if (err) throw err;
        res.send({'imgData':result})
    })
})

app.post('/cartUpload',(req,res)=>{
    const title = req.body.title
    const price = req.body.price
    const qty = req.body.qty
    const userName = req.body.userName
    const date =req.body.date
    console.log(title,price,qty,userName,date)
    db.query('insert into cart_tbl values(?,?,?,?,?,?)',[0,title,userName,qty,date,price],(err,result)=>{
        if (err) throw err;
        res.send({'msg':'Item added to cart Succesfully'})
    })
})


app.post('/create', (req, res) => {
    var RegUser = req.body.user;
    var RegEmail = req.body.email;
    var RegPassword = req.body.password;

    db.query('insert into intreg_tb values (?,?,?,?)', [0, RegUser, RegEmail, RegPassword], (err, result) => {
        if (err) throw err;
        res.send({ 'msg': 'registered succesfully,you can login now !' })
    });
});



app.post('/log', (req, res) => {

    var logUser = req.body.user;
    var logPass = req.body.password;

    db.query('select * from intreg_tb where user=? and password=?', [logUser, logPass], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.send({ 'msg': true, 'values': result });
        } else {
            res.send({ 'msg': false })
        }
    })
})



app.listen(9000, () => {
    console.log('server started at port 9000')
});