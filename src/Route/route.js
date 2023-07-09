
const router=require('express').Router()
const{authentication,authorization}=require('../utils/auth')


router.post('/register',RegistartionCreate)
router.post('/login',LoginCreate)
router.get('/user/:userId/profile',authentication, getUserProfile)
router.put('/user/:userId/profile',authentication, authorization,UpdateProfile)


router.post("/products",createProduct)
router.get("/products",getProduct)
router.get("/products/:productId",getProductById)
router.put("/products/:productId",updateProductById)
router.delete("/products/:productId",DeleteProductById)


router.post("/users/:userId/cart",AddCart)
router.get("/users/:userId/cart",getCart)
router.put("/users/:userId/cart",updateCart)
router.delete("/users/:userId/cart",DeleteCart)



modules.exports = router;