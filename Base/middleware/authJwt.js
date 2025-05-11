const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const AdminUser = require("../models/AdminUser");
const functions = require("../services/functions");

exports.checkToken = (req, res, next) => {
    console.log("✅ Middleware checkToken called");

    if (true) {
        req.user = { data: { _id: 667 } };
        return next();
      }
    
      // 👇 Nếu không test, xác thực như thường
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Missing token" });
    
      jwt.verify(token, process.env.NODE_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.userId = decoded.data._id;
        next();
      });
    
};

exports.isCompany = (req, res, next)=>{
  let userId = req.userId;
    const company = Users.find({idQLC: userId});
    if(company){
        next();
        return;
    }
    return res.status(403).json({ message: "is not company" });
}

exports.isAdmin = async(req, res, next)=>{
    let userId = req.userId;
    let admin = await functions.getDatafindOne(AdminUser, { _id: userId });
    if(admin) return next();
    return res.status(403).json({ message: "is not admin" });
}