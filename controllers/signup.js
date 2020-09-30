var mongoose = require("mongoose")
var userSchema = require("./userSchema")
var passport = require("passport")
User = mongoose.model("User",userSchema)
var dateformat = require('dateformat')

var otpSchema = require("../otp/otpSchema")
var OTP = mongoose.model("OTP",otpSchema)
var nodemailer = require('nodemailer');
var otp;
function Signup(req,res){
    if(req.body.confirmPassword !== req.body.password ){
        req.flash("error","PASSWORD ARE NOT THE SAME")
        res.redirect("/signup")
    }else{
        newUser = {
            username : req.body.username, email : req.body.email,password : req.body.password,coverPic : ""
        }
        User.findOne({ email : newUser.email },function(err,foundemail){
            if(err){
                console.log(err)
                req.flash("error","UNEXPECTED ERROR OCCUR, PLEASE TRY AGAIN")
                res.redirect("/signup")
            }else{
                if(foundemail){
                    req.flash("error","EMAIL ALREADY IN USE")
                    res.redirect("/signup")
                }else{
                    User.findOne({username : newUser.username},function(err,foundUsername){
                        if(err){
                            console.log(err)
                            req.flash("error","UNEXPECTED ERROR OCCUR, PLEASE TRY AGAIN")
                            res.redirect("/signup")
                        }else{
                            if(foundUsername){
                                req.flash("error","USERNAME ALREADY IN USE")
                                res.redirect("/signup")
                            }else{
                                const smtpTrans = nodemailer.createTransport({
                                    host: 'smtp.gmail.com',
                                    port: 465,
                                    secure: true,
                                    auth: {
                                        user: "ryzit1@gmail.com",
                                        pass: "etrikieegnaqqngu"
                                    }
                                })
                                otp = Math.floor(Math.random() * 1000000)
                                const mailOpts = {
                                    from: "ryzit1@gmail.com",
                                    to: req.body.email,
                                    subject: 'Verify Email Address',
                                    text: "Hi," + "\n\n" + 
                                    "To proceed further with your account verification at RyZit , Please use the 6-digit OTP given below.This OTP is only valid for 60 minutes"
                                    + "\n\n" + 
                                    otp + "\n\n" + 
                                    "Regards," +
                                    "Team ,RyZit"
                                }
                                smtpTrans.sendMail(mailOpts, (error, response) => {
                                    if (error) {
                                        console.log(error)
                                        req.flash("error","Cannot Verify Your Email Right Now !!!")
                                        res.redirect("/signup") // Show a page indicating failure
                                    }
                                    else {
                                        var now = new Date();
                                        OTP.create({
                                            timeOfSending : now,
                                            otp : otp,
                                            email : req.body.email,
                                            username : req.body.username,
                                            password : req.body.password
                                        } , (err,createOtp) => {
                                            if(err){
                                                console.log(error)
                                                req.flash("error","Cannot Verify Your Email Right Now !!!")
                                                res.redirect("/signup") 
                                            }else{
                                                res.redirect("/otp-" + req.body.email + "-" + createOtp.id )
                                            }
                                        } )
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    }
}
module.exports = Signup