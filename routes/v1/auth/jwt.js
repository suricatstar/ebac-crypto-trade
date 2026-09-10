const passport = require('passport');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { Usuario } = require('../../../models');

passport.use(new jwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}, async (jwtPayload, done) => {
    try {
        const usuario = await Usuario.findOne({
            _id: jwtPayload.id,
            confirmado: true
        });
       
        done(null, usuario);
    } catch (err) {
        
        done(err, false);
    }
}));