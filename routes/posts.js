const router = require('express').Router();
const verify = require('../routes/verifyToken');

router.get('/', verify, (req,res) => {
    res.json({
        posts: {
            title: 'My first post',
            description: 'Random data that you should not have access to.'
        }
    });
});

module.exports = router;