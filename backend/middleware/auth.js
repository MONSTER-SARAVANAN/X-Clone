import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(403).send("Access denied.");

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Invalid token.");
        req.user = user;
        console.log("User object after verification:", user); // Added logging

        next();
    });
};
