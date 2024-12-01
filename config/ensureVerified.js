const ensureVerified = (req, res, next) => {
    if (req.session.isVerified) {
        return next();
    }
    res.redirect(`/verify/${req.session.verificationMethod}`);
};

module.exports = ensureVerified;
