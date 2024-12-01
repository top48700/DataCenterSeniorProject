module.exports = (req, res, next) => {
    console.log('Auth Admin Middleware');
    console.log('Session:', req.session);

    if (req.session && req.session.isAdmin) {
        console.log('Unauthorized Access: Session is missing adminId or isAdmin');
        return next();
    } else {
        console.log('Unauthorized: Not an admin');
        return res.status(401).send('Unauthorized');
    }
};
