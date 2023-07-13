const { isValidObjectId ,isValidDetails } = require("../utils/validator")
const UserModel=require('../Models/UserModels')
const CartModel=require('../Models/CartModel')
const ProductModel=require('../Models/ProductModel')

const AddCart= async (req,res) =>{
    try{
        const userId=req.params.userId
        const data=req.body
        const {productId}=data
        if(!isValidDetails(data)){
            return res.status(400).send({status:false,message:"please provide data to add cart"})
        }
        if(!isValidObjectId(userId)){
            return res.status(400).send({status:false,message:"please provide valid userId "})
        }
        
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid ProductId" })
        }
       const checkuser= await UserModel.findById(userId)
        if(!checkuser){
return res.status(404).send({ status: false, message: "user doen not exist" })
        }
        const findProduct = await ProductModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: `Product doesn't exist by this Id` })
        }
        const findCartOfUser = await CartModel.findOne({ userId: userId })

        if (!findCartOfUser) {

            let priceSum = findProduct.price * 1
            let itemArr = [{ productId: productId, quantity: 1 }]

            const newUserCart = await cartModel.create({
                userId: userId,
                items: itemArr,
                totalPrice: priceSum,
                totalItems: 1
            })
            return res.status(201).send({ status: true, message: "Success", data: newUserCart })
        }

        if (findCartOfUser) {

            //updating price when products get added or removed
            let price = findCartOfUser.totalPrice + (1 * findProduct.price)
            let arr = findCartOfUser.items


            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == productId) {
                    arr[i].quantity += 1
                    let cartUpdate = await CartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
                    return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
                }
            }

            arr.push({ productId: productId, quantity: 1 })
            let cartUpdate = await CartModel.findOneAndUpdate({ _id: findCartOfUser._id }, { totalPrice: price, items: arr, totalItems: arr.length }, { new: true })
            return res.status(200).send({ status: true, message: "data updated", data: cartUpdate })
        }
    }catch(err){
        return res.status(500).send({stauts:false,message:err.message})
    }
}




const getCart = async function (req, res) {


    try {

        let userIdFromParams = req.params.userId

        const userByuserId = await UserModel.findById(userIdFromParams);
        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'User not found.' });
        }


        const findCart = await CartModel.findOne({ userId: userIdFromParams }).select({ __v: 0 })
        if (!findCart) {
            return res.status(400).send({ status: false, msg: 'no any cart exist with this id' })
        }
        if (findCart.totalitem == 0) {
            return res.status(404).send({ status: false, msg: 'your cart is empety.' })

        }
        return res.status(200).send({ status: true, msg: 'card Details', data: findCart })

    }


    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.msg })
    }
}








const updateCart = async (req,res)=>{
    try{
        userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "enter valid userId " })

        }
        const findUser = await UserModel.findOne({ _id: userId, isDeleted: false })
        if (!findUser) {
            return res.status(400).send({ status: false, msg: "userId not found" })
        }
        let data = req.body
        const { cartId, productId, removeProduct } = data
        if (!isValidDetails(data)) {
            return res.status(400).send({ status: false, msg: "Please enter data to update " })

        }


        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "Please enter valid cartId " })

        }
        if (!isValidObjectId(productId)) {

            return res.status(400).send({ status: false, msg: "Please enter valid productId " })

        }
        

            
        const findCart = await CartModel.findOne({ _id: cartId, isDeleted: false })
        if (!findCart) {
            return res.status(400).send({ status: false, msg: "cart not found or is deleted" })

        }
        const findProduct = await ProductModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(400).send({ status: false, msg: "Product not found or is deleted" })

        }
        
        if (!removeProduct) {
            return res.status(400).send({ status: false, msg: "Please provide product quantity to remove" })

        }
        if ((isNaN(Number(removeProduct)))) {
            return res.status(400).send({ status: false, msg: "Provide quantity to remove" })

        }
        if ((removeProduct != 0) && (removeProduct != 1)) {
            return res.status(400).send({ status: false, msg: "Only 1 product can be removed at a time" })

        }
        let findQuantity = findCart.items.find(x => x.productId.toString() === productId)

        if (removeProduct === 0) {

            let totalAmount = findCart.totalPrice - (findProduct.price * findQuantity.quantity) // substract the amount of product*quantity

            await CartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })   //pull the product from itmes  //https://stackoverflow.com/questions/15641492/mongodb-remove-object-from-array

            let quantity = findCart.totalItems - 1
            let data = await CartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })   //update the cart with total items and totalprice

            return res.status(200).send({ status: true, message: `${productId} is been removed`, data: data })

        }

        // decrement quantity
        let totalAmount = findCart.totalPrice - findProduct.price
        let arr = findCart.items
        for (i in arr) {
            if (arr[i].productId.toString() == productId) {
                arr[i].quantity = arr[i].quantity - 1
                if (arr[i].quantity < 1) {
                    await CartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })
                    let quantity = findCart.totalItems - 1
                    let data = await CartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })   //update the cart with total items and totalprice

                    return res.status(400).send({ status: false, message: 'no such Quantity/Product present in this cart', data: data })
                }
            }
        }

        let data1 = await CartModel.findOneAndUpdate({ _id: cartId }, { items: arr, totalPrice: totalAmount }, { new: true })

        return res.status(200).send({ status: true, message: `${productId} quantity is been reduced By 1`, data: data1 })
    
    }catch(err){
        return res.status(500).send({stauts:false,message:err.message})
    }
}

 const DeleteCart= async  (req, res) => {
try {

        let userIdFromParams = req.params.userId

        const userByuserId = await UserModel.findById(userIdFromParams);
        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'User not found.' });
        }


        const findCart = await CartModel.findOne({ userId: userIdFromParams }).select({ __v: 0 })
        if (!findCart) {
            return res.status(400).send({ status: false, msg: 'no any cart exist with this id' })
        }
        if (findCart.totalitem == 0) {
            return res.status(404).send({ status: false, msg: 'your cart is empety.' })

        }
        return res.status(200).send({ status: true, msg: 'card Details', data: findCart })

    }


    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.msg })
    }
}                           


module.exports={AddCart,getCart,updateCart,DeleteCart}