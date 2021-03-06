const
	pgdb = require.main.require('./util/sharesci-pg-db'),
	bcrypt = require('bcrypt');


function loginAction(req, res)  {
	var responseObj = {
		errno: 0,
		errstr: ""
	};
	if(req.session.user_id) {
		responseObj.errno = 4;
		responseObj.errstr = "Already logged in";
		res.json(responseObj);
		res.end();
		return;
	}
	pgdb.func('get_user_passhash', [req.body.username])
		.then((data) => {
			if (bcrypt.compareSync(req.body.password, data[0]['passhash'])) {
				req.session.user_id = req.body.username;
				responseObj.errno = 0;
				responseObj.errstr = "";
				res.json(responseObj);
			} else {
				responseObj.errno = 3;
				responseObj.errstr = "Incorrect password";
				res.json(responseObj);
			}
			res.end();
		})
		.catch((err) => {
			if(err.received === 0) {
				console.log('Invalid username \'' + req.body.username + '\' tried to log in.');
				responseObj.errno = 2;
				responseObj.errstr = "Incorrect username";
			} else {
				console.error(err);
				responseObj.errno = 1;
				responseObj.errstr = "Unknown error";
			}
			res.json(responseObj);
			res.end();
		});
}

function getLogin(req, res) {
	var username = req.session.user_id;
	if(!username) {
		username = null;
	}
	res.json({errno: 0, errstr: "", username: username});
	res.end();
}

function loginPage(req, res) {
	res.redirect('/');
	res.end();
}


module.exports = {
	loginAction: loginAction,
	getLogin: getLogin,
	loginPage: loginPage
};

