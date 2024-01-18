import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";
import transporter from "../configs/emailConfig.js";

class UserController {
  static userRegister = async (req, res, next) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const findUser = await UserModel.findOne({ email: email });
    console.log({ findUser });

    if (findUser) {
      res.send({
        status: "failed",
        message: "Email already exists",
      });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await doc.save();

            //  Generate JWT Token
            const token = jwt.sign(
              { userID: doc._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "1d" }
            );
            console.log({ token });

            res.status(201).send({
              status: true,
              message: "User register successfully",
              data: { doc, token: token },
            });
          } catch (error) {
            console.log(error);
            res.send({
              status: "failed",
              message: "unable to register",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "password and confirm password doesn't match",
          });
        }
      } else {
        res.send({
          status: "failed",
          message: "All fields are required",
        });
      }
    }
  };

  static userLogin = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const findUser = await UserModel.findOne({ email: email });
        console.log(findUser);
        if (findUser) {
          const isMatchPassword = await bcrypt.compare(
            password,
            findUser.password
          );
          if (findUser.email === email && isMatchPassword) {
            //  Generate JWT Token
            const token = jwt.sign(
              { userID: findUser._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "1d" }
            );
            console.log({ token });

            res.status(201).send({
              status: true,
              message: "login success",
              token: token,
            });
          } else {
            res.status(400).send({
              status: false,
              message: "email and password is not valid",
            });
          }
        } else {
          res.status(400).send({
            status: false,
            message: "you are not a register user",
          });
        }
      } else {
        res.status(400).send({
          status: false,
          message: "login failed!",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({
        status: false,
        message: "unable to login",
      });
    }
  };

  static changeUserPassword = async (req, res, next) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.status(400).send({
          status: "failed",
          message: "New password and confirm new password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        //  console.log(req.user);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: {
            password: newHashPassword,
          },
        });
        res.status(201).send({
          status: "success",
          message: "Password changed successfully..",
        });
      }
    } else {
      res.status(201).send({
        status: "failed",
        message: "All fields are required..",
      });
    }
  };

  static loggedUser = async (req, res, next) => {
    res.send({
      user: req.user,
    });
  };

  static sendUserPasswordResetEmail = async (req, res, next) => {
    try {
      const { email } = req.body;
      if (email) {
        const findUser = await UserModel.findOne({ email: email });
        if (findUser) {
          const secret = findUser._id + process.env.JWT_SECRET_KEY;
          const token = jwt.sign(
            {
              userID: findUser._id,
            },
            secret,
            { expiresIn: "15m" }
          );
          const emailLink = `http://127.0.0.1:3000/api/user/reset/${findUser._id}/${token}`;
          console.log({ emailLink });

          // Send EMail 
            let info = await transporter.sendMail({
              from: process.env.EMAIL_FROM,
              to: findUser.email,
              subject: 'Password Reset link',
              html: `<a href=${emailLink}> Click Here </a> to reset your password`
            })
          res.send({
            status: "success",
            message: "Password reset email sent... please check your email", "info": info,
          });
        } else {
          res.send({
            status: "failed",
            message: `${email} email doesn't exists`,
          });
        }
      } else {
        res.send({
          status: "failed",
          message: "Email filed is required",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  static userPasswordReset = async (req, res, next) => {
   const { password, password_confirmation } = req.body
   const { id, token } = req.params
     const findUser = await UserModel.findById(id);
     const new_secret = findUser._id + process.env.JWT_SECRET_KEY;
     try {
         jwt.verify(token, new_secret)
         if(password && password_confirmation){
                 if(password !== password_confirmation){
                  res.send({
                    "status": "failed",
                    "message": "New password and confirm new password doesn't match"
                   })      
                 }else{
                    const salt = await bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(findUser._id, {$set: {
                      password: newHashPassword
                    }})

                    res.send({
                      "status": "success",
                      "message": "Password has been changed successfully."
                    })
                 }
         }else {
          res.send({
            "status": "failed",
            "message": "both password fields are required"
           })
         }
     } catch (error) {
       res.send({
        "status": "failed",
        "message": "Invalid Token"
       })
     }
  };
}

export default UserController;
