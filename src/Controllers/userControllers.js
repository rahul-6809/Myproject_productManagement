const { isValidValue, validatePassword,isValidPincode ,isValidDetails} = require("../../utils/validator")
const UserModels = require("../Models/UserModels")
const awsConfig = require("../../utils/awsConfig")
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
const {SECRET_KEY}=require('../../configs');
const { isValidObjectId } = require("mongoose");


const RegistartionCreate=async (req,res) =>{
    try{
        let data = req.body

        if (!isValidDetails(data)) {
            return res.status(400).send({ status: false, message: "Please enter your details to Register" })   //validating the parameters of body
        }
        const {fname,lname,email,profileImage,phone,password,address}=data


        if(isValidValue(fname)){
            return res.status(400).send({ status:false, message: "Please enter your first name" }) //validating the parameters
        } if( isValidValue(lname)){
            return res.status(400).send({ status:false, message: "Please enter your last name" }) //validating the parameters
        }
           
        if(isValidValue(email)){
            return res.status(400).send({ status:false, message: "Please enter your email address" }) //validating the parameters
        } 
        
        if(isValidValue(password)){
            return res.status(400).send({ status:false, message: "Please enter your password" }) //validating the parameters
        } 
        if(isValidValue(phone)){
            return res.status(400).send({ status:false, message: "Please enter your phone number" }) //validating the parameters
        }
        if(validateEmail(email)){
            return res.status(400).send({ status:false, message: "provide valid email address" }) //validating }the parameters
        }
        if(validatePassword(password)){
            return res.status(400).send({ status:false, message: "enter correct password" }) //validating the parameters
        }
        if(validatePhone(phone)){
            return res.status(400).send({ status:false, message: "provide correct phone number" }) //validating the parameters
        }

        const Emailcheck =await UserModels.findOne({email: email})
        if(Emailcheck){
            res.status(400).send({ status:false, message:"email already in use"})
        }
         const phonecheck =await UserModels.findOne({phone: phone})
         if(phonecheck){
            res.status(400).send({ status:false, message:"phone already in use"})
         }


         

         if (!address.shipping || (address.shipping && (!address.shipping.street.trim() || !address.shipping.city.trim() || !address.shipping.pincode))) {
            return res.status(400).send({ status: false, message: "Please provide the Shipping address" })
        }


        if (!address.billing || (address.billing && (!address.billing.street.trim() || !address.billing.city.trim() || !address.billing.pincode))) {
            return res.status(400).send({ status: false, message: "Please provid the Billing address" })
        }

        if (!isValidPincode(address.shipping.pincode)||!validator.isValidPincode(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide the valid Pincode" })    //Regex for checking the valid password format 
        }

          const user={fname:fname,lname:lname,email:email,phone:phone,
            address: { shipping: {
                street: address.shipping.street,
                city: address.shipping.city,
                pincode: address.shipping.pincode
            },
            billing: {
                street: address.billing.street,
                city: address.billing.city,
                pincode: address.billing.pincode
            }
        }}

          const saveData = await UserModels.create(user)
          res.status(200).send({ status: true, datas:saveData})

    }catch(err){
         res.status(500).send({status:false,message:err.message});
    }
} 






const LoginCreate=async (req,res)=>{
    try{
        let requestBody = req.body;
        if (!isValidDetails(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please enter login credentials" });
        }
        const {email,password} = requestBody
        if(validateEmail(email)){
            return res.status(400).send({ status:false, message: "provide valid email address" }) //validating }the parameters
        }
           
        if(isValidValue(email)){
            return res.status(400).send({ status:false, message: "Please enter your email address" }) //validating the parameters
        } 
        if(isValidValue(password)){
            return res.status(400).send({ status:false, message: "Please enter your password" }) //validating the parameters
        }

        if(validatePassword(password)){
            return res.status(400).send({ status:false, message: "enter correct password" }) //validating the parameters
        }

        const userloginEmailCheck=await UserModels.findOne({email:email})
        if(!userloginCheck){
            return res.status(400).send({ status:false, message: "email not found" }) //validating the parameters
        }
          let hash = userloginCheck.password
          let pass =await bcrypt.compare(password, hash)
          if(!pass){
            return res.status(400).send({ status:false, message: "password incorrect" }) 
          }
        const token = jwt.sign({userId:user._id},SECRET_KEY,{expiredIn:'24h'})
        if(!token){
            return res.status(400).send({ status:false,message: "token not valid" }) //validating the parameters
        }
        res.setHeader('x-api-token',token)
        res.status(200).send({ status:true, message: "Successful login",data:{userId:user._id,token:token}})

    }catch(err){res.status(500).send({status:false,message:err.message});}
}




 const getUserProfile=async (req,res) =>{
    try{

        const userId=req.params.userId;
        if (!isValidDetails(userId)) {
            return res.status(400).send({ status: false, msg: "Please enter login credentials" });
        }
       const userDetail=await UserModels.findById({_Id:userId});
       if(!userDetail){
        return res.status(400).send({ status: false, msg: "No such User Exists" });
       }
       res.status(200).send({ status:true, msg: "User profile details", data: userDetail});

    }catch(err){res.status(500).send({status:false,message:err.message});}

 }







const UpdateProfile=async (req, res) => {

    try{

        const userId=req.params.userId;
        const data=req.body
        const {fname,lname, email, phone, password, profileImage, address } = data
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Please enter login credentials" });
        }
        if(!isValidDetails(data)){
            return res.status(404).send({ status: false, msg: "please provide data to update your account" });
        }
        if (fname == "") {
            return res.status(400).send({ status: false, message: "Please provide name" })

        }
        else if (fname) {
            if (!isValidValue(fname)) return res.status(400).send({ status: false, message: "Please provide first name" })

        }

        if (lname == "") {
            return res.status(400).send({ status: false, message: "Please provide last name" })

        }
        else if (lname) {
            if (!isValidValue(lname)) return res.status(400).send({ status: false, message: "Please provide the last name to update" })

        }

        if (email == "") {
            return res.status(400).send({ status: false, message: "Please provide email" })

        }
        else if (email) {
            if (!validateEmail(email)) return res.status(400).send({ status: false, message: "Please provide the valid Email Address" })

        }

        if (phone == "") {
            return res.status(400).send({ status: false, message: "Please provide Phone number" })

        }
        else if (phone) {
            if (!validatephone(phone)) return res.status(400).send({ status: false, message: "Please provide the valid Phone number" })

        }

        if (password == "") {
            return res.status(400).send({ status: false, message: "Please provide password" })

        }
        else if (password) {
            if (!validatePassword(password)) return res.status(400).send({ status: false, message: "Please provide password" })

        }
        if (password) {
            var salt1 = bcrypt.genSaltSync(10);

            var encryptedPassword = bcrypt.hashSync(password, salt1);
        }
        if (address) {
            const address = JSON.parse(data.address)  //converting the address into JSON form


            if (!address.shipping || (address.shipping && (!address.shipping.street || !address.shipping.city || !address.shipping.pincode))) {
                return res.status(400).send({ status: false, message: "Please provide the Shipping address" })
            }


            if (!address.billing || (address.billing && (!address.billing.street || !address.billing.city || !address.billing.pincode))) {
                return res.status(400).send({ status: false, message: "Please provid the Billing address" })
            }
        }

        if (profileImage) {
            let files = req.files

            if (files && files.length > 0) {
                var updateImage = await awsConfig.uploadFile(files[0])      //upload to s3 and get the uploaded link
            }
            else {
                return res.status(400).send({ status: false, message: "Please upload your Profile Image" })   //profileImage is mandory
            }
        }

        const updatedData = await userModel.findOneAndUpdate({ _id: userId },
            { fname: fname, lname: lname, email: email, phone: phone, password: encryptedPassword, profileImage: updateImage, address: address }, { new: true })
        res.send({ Data: updatedData })
    } catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }

}


   



module.exports ={RegistartionCreate,LoginCreate,getUserProfile,UpdateProfile}