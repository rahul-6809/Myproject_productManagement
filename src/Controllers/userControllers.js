const { isValidValue, validatePassword,isValidPincode,isValidObjectId ,validatephone ,validateEmail,isValidDetails} = require("../utils/validator")
const UserModel = require("../Models/UserModels")
const awsConfig = require("../utils/awsConfig")
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
const {SECRET_KEY}=require('../../configs');



const RegistrationCreate=async (req,res) =>{
        try {

            let data = req.body
    
            if (!isValidDetails(data)) {
                return res.status(400).send({ status: false, message: "Please enter your details to Register" })   //validating the parameters of body
            }
    
            const { fname, lname, email, phone, password, address} = data
    
            if (!isValidValue(fname)) {
                return res.status(400).send({ status: false, message: "Please provide the First name" })   //fname is mandory 
            }
    
            if (!isValidValue(lname)) {
                return res.status(400).send({ status: false, message: "Please provide the Last name" })   //lname is mandory 
            }
            if (!isValidValue(email)) {
                return res.status(400).send({ status: false, message: "Please provide the Email Address" })   //email is mandory
            }
            if (!validateEmail(email)) {
                return res.status(400).send({ status: false, message: "Please provide the valid Email Address" })    //Regex for checking the valid email format 
            }
            const emailUsed = await UserModels.findOne({ email })    //unique is email
            if (emailUsed) {
                return res.status(400).send({ status: false, message: `${email} is already exists` })   //checking the email address is already exist or not.
            }
    
            if (!isValidValue(phone)) {
                return res.status(400).send({ status: false, message: "Please provide the phone number" })    //phone is mandory
            }
            if (!validatephone(phone)) {
                return res.status(400).send({ status: false, message: "Please provide the valid phone number" })    //Regex for checking the valid phone format
            }
            const phoneUsed = await UserModels.findOne({ phone })   //phone is unique
            if (phoneUsed) {
                return res.status(400).send({ status: false, message: `${phone} is already exists` })   //checking the phone number is already exist or not.
            }
            if (!isValidValue(password)) {
                return res.status(400).send({ status: false, message: "Please provide the Password" })   //password is mandory 
            }
            if (!validatePassword(password)) {
                return res.status(400).send({ status: false, message: "password should be between 8-15 characters and atleast 1 character should be in upppercase" })    //Regex for checking the valid password format 
            }
    
            const salt = bcrypt.genSaltSync(10);
    
            const encryptedPassword = bcrypt.hashSync(password, salt);     // USE HASHSYNC TO SECURE YOUR PASSWORD
    
            //const address = JSON.parse(data.address)  //converting the address into JSON form
    
    
            if (!address.shipping || (address.shipping && (!address.shipping.street.trim() || !address.shipping.city.trim() || !address.shipping.pincode))) {
                return res.status(400).send({ status: false, message: "Please provide the Shipping address" })
            }
    
    
            if (!address.billing || (address.billing && (!address.billing.street.trim() || !address.billing.city.trim() || !address.billing.pincode))) {
                return res.status(400).send({ status: false, message: "Please provid the Billing address" })
            }
            if (!isValidPincode(address.billing.pincode)) {
                return res.status(400).send({ status: false, message: "Please provide the valid Pincode" })    //Regex for checking the valid password format 
            }
    
            if (!isValidPincode(address.shipping.pincode)) {
                return res.status(400).send({ status: false, message: "Please provide the valid Pincode" })    //Regex for checking the valid password format 
            }
    
    
            let files = req.files
    
            if (files && files.length > 0) {
                var profileImage = await awsConfig.uploadFile(files[0])      //upload to s3 and get the uploaded link
            }
            else {
                return res.status(400).send({ status: false, message: "Please upload your Profile Image" })   //profileImage is mandory
            }
    
            const user = {
                fname,
                lname,
                email,
                profileImage,
                phone,
                password: encryptedPassword,
                address: address
            }
    
            let UserData = await UserModels.create(user)      //If all these validations passed , creating a user
            return res.status(201).send({ status: true, message: "You're registered successfully", data: UserData })
        }
        catch (err) {
            console.log(err)
            res.status(500).send({ message: err.message })
        }
    }






const LoginCreate=async (req,res)=>{
    try{
        let requestBody = req.body;
       
        if (!isValidDetails(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please enter login credentials" });
        }
        const {email,password} = requestBody
        if(!validateEmail(email)){
            return res.status(400).send({ status:false, message: "provide valid email address" }) //validating }the parameters
        }
           
        if(!isValidValue(email)){
            return res.status(400).send({ status:false, message: "Please enter your email address" }) //validating the parameters
        } 
        if(!isValidValue(password)){
            return res.status(400).send({ status:false, message: "Please enter your password" }) //validating the parameters
        }

        if(!validatePassword(password)){
            return res.status(400).send({ status:false, message: "enter correct password" }) //validating the parameters
        }

        const userloginEmailCheck=await UserModels.findOne({email:email})
        
        if(!userloginEmailCheck){
            return res.status(400).send({ status:false, message: "email not found" }) //validating the parameters
        }
          let hash = userloginEmailCheck.password
          let pass =await bcrypt.compare(password, hash)
          
          if(!pass){
            return res.status(400).send({ status:false, message: "password incorrect" }) 
          }
        const token = jwt.sign({userId:userloginEmailCheck._id},SECRET_KEY,{expiresIn:'24h'})
        
        if(!token){
            return res.status(400).send({ status:false,message: "token not valid" }) //validating the parameters
        }
        res.setHeader('x-api-token',token)
        res.status(200).send({ status:true, message: "Successful login",data:{userId:userloginEmailCheck._id,token:token}})

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
        //console.log(userId);
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

        const updatedData = await UserModel.findOneAndUpdate({ _id: userId },
            { fname: fname, lname: lname, email: email, phone: phone, password: encryptedPassword, profileImage: updateImage, address: address }, { new: true })
        res.send({ Data: updatedData })
    } catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }

}


   



module.exports ={RegistrationCreate,LoginCreate,getUserProfile,UpdateProfile}