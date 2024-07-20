const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/Users");
const fetchuser = require("../middleware/fetchuser");
require("dotenv").config();
const JWT_SIGNATURE = process.env.JWT_SIGNATURE;
router.post(
  "/createuser",

  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be of minimum length 5").isLength({
      min: 5,
    }),
    body("cpassword", "Password must be of minimum length 5").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success,
        message: "Enter Correct Credentials",
        errors: errors.array(),
      });
    }
    
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, message: "Email is Already Registered" });
      }
      if (req.body.password !== req.body.cpassword) {
        return res
          .status(400)
          .json({ success, message: "Password does not match" });
      }

      const salt = await bcrypt.genSalt(10);
      const securePass = await bcrypt.hash(req.body.password, salt);
      
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePass,
      });
      const data = {
        user: { id: user.id },
      };
      const authToken = jwt.sign(data, JWT_SIGNATURE);
      success = true;
      return res.json({
        success,
        message: "User Registered Successfully",
        authToken,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        success,
        message: "Internal Server Error",
        errors: error.messsage,
      });
    }
  }
);



router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success,
        message: "Enter Correct Credentials",
        errors: errors.array(),
      });
    }
    
    const { email, password } = req.body;
   
    try {
     
      const user = await User.findOne({ email: email });
    
      if (!user) {
        return res
          .status(400)
          .json({ success, message: "try to log in with correct credentials" });
      }
      
      const comparePassword = await bcrypt.compare(password, user.password);
   
      if (!comparePassword) {
        return res
          .status(400)
          .json({ success, message: "try to log in with correct credentials" });
      }

     
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SIGNATURE);
      success = true;
      
      res.json({
        success,
        message: "User Logged In Successfully",
        authToken,
        data,
      });
    } catch (error) {
   
      return res
        .status(500)
        .json({ success, message: "Internal Server Error", errors: error });
    }
  }
);



router.post("/getuser", fetchuser, async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    success = true;
    return res.json({
      success,
      message: "User Data fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success, message: "Internal Server Error", errors: error });
  }
});


router.post("/adduser",fetchuser,async (req,res)=>{
  const {gmail} = req.body;
  try{
    const addedto = (await User.findOne({email:gmail}).select("biengAddedto")).biengAddedto
    const notesuseremail = (await User.findById(userId).select("email")).email;

    if(addedto.includes(notesuseremail))
    {
      throw new Error('user is already added to the list');
    }
    await User.findOneAndUpdate({email:gmail},{biengAddedto:addedto});
    const userId = req.body.userId;
    const user = (await User.findById(userId).select("userAdded")).userAdded;
    if(user.includes(gmail))
    {
       throw new Error('Email already added')
    }
    user.push(gmail)
    await User.findOneAndUpdate({_id:userId},{userAdded:user});
    return res.json( {
      sucess:true,
      message: "User added sucessfully"}
    )
  }
  catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success:false, message: "Internal Server Error", errors: error.message });
  }
  
    
})

module.exports = router;
