var express = require('express');
var router = express.Router();
var imgModel = require('../models/add_room');
var multer = require('multer');
const fs = require('fs');
var path = require('path');
const { param } = require('.');
var nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hk230599@gmail.com',
      pass: 'Harleen@13'
    }
  });
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'routes/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

router.get('/addroom', function (req, res, next) {
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/login');
		}else{
			return res.render('addroom.ejs');
		}
	});
});

router.get('/roomlist', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('roomlist', { items: items ,user: req.session.userId });
        }
    });
});

router.post('/addroom', upload.single('image'), (req, res, next) => {
 
    var obj = {
        title: req.body.title,
        desc: req.body.desc,
		price: req.body.price,
		location: req.body.location,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            res.redirect('/roomlist');
        }
    });
});

router.get('/updateroom/:id' ,function (req, res, next) {
	imgModel.findById(req.params.id, function (err, item) {
		console.log(item);
		if(!item){
			res.redirect('/');
		}else{
			res.render('updateroom', { item: item });
		}
	});
});

router.get('/roomdetail/:id' ,function (req, res, next) {
	imgModel.findById(req.params.id, function (err, item) {
		console.log(item);
		if(!item){
			res.redirect('/');
		}else{
			res.render('roomdetail', { item: item,user: req.session.userId });
		}
	});
});

router.post('/updateroom', upload.single('image'), (req, res, next) => {
	imgModel.findById(req.body._id, function (err, item) {
		item.title= req.body.title;
    	item.desc= req.body.desc;
			item.price= req.body.price;
			item.location= req.body.location;
			if(req.file != undefined && req.file != null && req.file.filename != undefined){
    	 item.img =   {
    	        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    	        contentType: 'image/png'
    	    };
		}
			item.save(function (err) {
				res.redirect('/roomlist');
			});
	});
});

router.post('/book', async (req, res, next) => {
	User.findOne({unique_id:req.session.userId},async function(err,data){
		if(!data){
			res.redirect('/login');
		}else{
			imgModel.findById(req.body._id,async function (err, item) {
				let info = await transporter.sendMail({
					from: 'hk230599@gmail.com', // sender address
					to: data.email, // list of receivers
					subject: 'Room Booking ', // Subject line
					text: 'Room Booking ',
					html: "<b>Title: " + item.title + "</b> <br/><b>Description: " + item.desc + "</b><br/><b>Location: " + item.location + "</b><br/><b>Price: $" + item.price + "</b>", // html body
				  });		
				res.redirect('/roomlist');
			});
		}
	});
	
});

module.exports = router;