const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../../configs')


const authentication = (req,res,next) => {
try{ 
    const token =req.headers['x-api-key']
    if(!token){
        return req.status(403).send({status:false, message:"Token must v present"})
     }
     const decodeToken=jwt.verify(token,SECRET_KEY)
     if (!decodeToken) {
        return res.status(403).send({ status: false, message: 'You are not autherised to access.' });
    }

    let expiration = decodeToken.exp

    let tokenExtend = Math.floor(Date.now() / 1000)

    if (expiration < tokenExtend) {
        return res.status(401).send({ status: false, message: "Token is expired" })
    }
     req.userId=decodeToken.userId
     next();
    }
    catch(err){
        res.status(500).send({status:false,message:err.message});
    }
}

const authorization =async (req,res) => {
    try{
        let userId = req.params.userId;

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "UserId is not valid" })
        }
        const decodeToken = jwt.verify(token,SECRET_KEY)

        let decoded = decodeToken.userId

        let User = await userModel.findById(userId)
       
        if (!User) {
            return res.status(404).send({ status: false, message: "User does not exist" })
        }


        // checking if the userId in token is the same as id provided in params 
        let user = User._id.toString()

        if (user != decoded) {
            return res.status(401).send({ status: false, message: "Not Authorised!!" })
        }
        next()

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

module.exports = {authentication,authorization}