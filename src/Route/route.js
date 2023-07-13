
const express = require('express')
const router=express.Router()

const aws =require('aws-sdk')
const{authentication,authorization}=require('../utils/auth')
const{RegistrationCreate,LoginCreate,getUserProfile,UpdateProfile}=require('../Controllers/userControllers')
const{createProduct,getProduct,getProductById,updateProductById,DeleteProductById}=require('../Controllers/productController')
const{AddCart,updateCart,getCart,DeleteCart}=require('../Controllers/cartControllers')
const{createOrder, updateOrder}=require('../Controllers/orderController')



router.post('/register',RegistrationCreate)
router.post('/login',LoginCreate)
router.get('/user/:userId/profile',authentication, getUserProfile)
router.put('/user/:userId/profile',authentication, authorization,UpdateProfile)


router.post("/products",createProduct)
router.get("/products",getProduct)
router.get("/products/:productId",getProductById)
router.put("/products/:productId",updateProductById)
router.delete("/products/:productId",DeleteProductById)


router.post("/users/:userId/cart",authentication, authorization,AddCart)
router.get('/users/:userId/cart', authentication, authorization, getCart)
router.put("/users/:userId/cart",authentication, authorization,updateCart)
router.delete("/users/:userId/cart",authentication, authorization,DeleteCart)



router.post("/users/:userId/orders",authentication, authorization,createOrder)
router.put("/users/:userId/orders",authentication, authorization, updateOrder)



module.exports = router;