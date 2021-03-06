const express=require('express');
const router = express.Router();
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const User=require('../modals/user');
const jwt=require('jsonwebtoken');

router.post('/signup',(req,res)=>{
    const {email,password,firstName,lastName,userName}=req.body;
    User.find({email:email})
    .then(user =>{
        if(user.length>=1){res.status(409).json({message:'User Already Exists'})}
        else{
            bcrypt.hash(password,10,(err,hash)=>{
                if(err){res.status(500).json({message:'Internal Server Error'})}
                else{
                    const user_details={email:email,password:hash,firstName:firstName,lastName:lastName,userName:userName}
                    const user=new User(user_details)
                    user.save()
                    .then(new_user=>{
                        const jwt_token=jwt.sign({email:email,firstName:firstName},process.env.SECRET_KEY_JWT, {expiresIn: '1h'});
                        res.status(201).json({
                            token:jwt_token,
                            firstName:firstName,
                            user_id:new_user._id
                        });
                    })
                    .catch(err=>{
                        res.status(422).json({message:'Internal Database Error'})
                    })   
                }
            })
        }
    })
    .catch(err=>{
        res.status(500).send({message:'Internal Server Error'});
    })
})

router.post('/signin',(req,res)=>{
    const {email,password}=req.body
    User.find({email:email})
    .then(user =>{
        if(user.length==0){res.status(401).json({message:'Wrong Usernme Or Password'})} // here donot send email donot exist,,because it might be helpful to hackers
        else{
            const hash=user[0].password
            bcrypt.compare(password, hash,(err, result)=>{
                if(result==true)
                {
                    const jwt_token=jwt.sign({email:email,firstName:user[0].firstName},process.env.SECRET_KEY_JWT, {expiresIn: '1h'});
                    res.status(200).json({
                        token:jwt_token,
                        firstName:user[0].firstName,
                        user_id:user[0]._id
                    });
                }
                else {res.status(401).send({message:'Wrong Username Or Password'})};
                });
        }
    })
    .catch(err=>{
        console.log("This error",err);
        res.status(500).json({message:'Internal Server Error'})
    })
})



module.exports=router;