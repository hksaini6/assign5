var express = require('express');
var router = express.Router();
var User = require('../models/user');
const bcrypt = require("bcryptjs");

router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});


router.post('/', async function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.firstname || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},async function(err,data){
				if(!data){
					var c;
					User.findOne({},async function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}
						const salt = await bcrypt.genSalt(10);
						var password  =await  bcrypt.hash(personInfo.password, salt);
						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							firstname: personInfo.firstname,
							lastname: personInfo.lastname,
							password: password
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	if (req.session.userId == undefined)
	{
		return res.render('login.ejs');
	} else {
		return res.redirect('/dashboard');
	}
});

router.post('/login', async function (req, res, next) {
	User.findOne({email:req.body.email},async function(err,data){
		if(data){
			var isPasswordCorrect = await bcrypt.compare(req.body.password, data.password);
			if(isPasswordCorrect){;
				req.session.userId = data.unique_id;
				User.findOne({unique_id:req.session.userId},function(err,data){
					if(!data){
						res.redirect('/');
					}else{
						res.send({"Success":"Success!"});
					}
				});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not registered!"});
		}
	});
});

router.get('/dashboard', function (req, res, next) {
	console.log("dashboard");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/login');
		}else{
			return res.render('dashboard.ejs', {"name":data.firstname + " " + data.lastname,"email":data.email});
		}
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/login');
    	}
    });
}
});

module.exports = router;