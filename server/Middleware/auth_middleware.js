require('dotenv').config();

const { NODE_ENV } = process.env;

module.exports = {
    envCheck: (req, res, next) => {
        if (NODE_ENV === 'dev') {
            req.app.get('db').get_user_by_user_id([1]).then(userWithIdOne => {
                req.session.user = userWithIdOne[0]
                next()
            })
        } else {
            next()
        }
    }
}
