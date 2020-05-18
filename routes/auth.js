const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

//Register
router.post('/register', async (req,res) => {

    //Validate data before we save
     const { error } = registerValidation(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    
    //Check if email exists in the db
    const emailExist = await User.findOne({email: req.body.email});

    if (emailExist) {
        return res.status(400).send('Email already exists');
    }

    //Hash the password
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save()
        res.send(savedUser);
    } catch (error) {
        res.status(400).send(error);
    }
});

//Login
router.post('/login',  async (req,res) => {
    //Validate data before we use it
    const { error } = loginValidation(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //Check if the email exists
    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return res.status(400).send('Wrong Email or Password');
    }

    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);

    if (!validPass) {
        return res.status(400).send('Invalid Password');
    }

    //Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

module.exports = router;