
const {isValidValue,Shipping,validInstallment,isValidObjectId,isValidDetails}=require('../utils/validator')
const UserModel=require('../Models/UserModels')
const ProductModel=require('../Models/ProductModel')
const {jwt} = require('jsonwebtoken')
const awsConfig=require('../utils/awsConfig')

const createProduct=async (req,res) => {
    try{
    const files=req.files
    const data=req.body
    if(!isValidDetails(data)){
        return res.status(400).send({status:false,message:"Please enter your details to Create Product"})
    }
    const {title,description,price,currencyId,isFreeShipping,style,availableSizes,installments}=req.body
    if (!isValidValue(title)) {
        return res.status(400).send({ status: false, message: "Please provide select title" })
    }
    const titleUsed = await ProductModel.findOne({ title })
    if (titleUsed) {
        return res.status(400).send({ status: false, msg: `${title} is already used` })
    }

    if (!isValidValue(description)) {
        return res.status(400).send({ status: false, msg: "plese provide des of product" })
    }

    if (!isValidValue(price)) {
        return res.status(400).send({ status: false, message: "Please provide product price" })
    }
    //NaN(not a number) return true if a number is NAN
    // NAN convert the value to a number

    if (!(!isNaN(Number(price)))) {
        return res.status(400).send({ status: false, msg: " price should be valid number" })
    }

    if (!isValidValue(currencyId)) {
        return res.status(400).send({ status: false, msg: "provide currencyid" })
    }

    // check currencyid equal to or not to INR
    if (currencyId != "INR") {
        return res.status(400).send({ status: false, msg: 'currencyId should be INR' })
    }


    if (!isValidValue(availableSizes)) {
        return res.status(400).send({ status: false, message: "Please provide the size " })   //availableSizes is mandory
    }

    if (availableSizes) {
        var arr1 = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        var arr2 = availableSizes.toUpperCase().split(",").map((s) => s.trim())

        for (let i = 0; i < arr2.length; i++) {
            if (!(arr1.includes(arr2[i]))) {
                return res.status(400).send({ status: false, message: "availableSizes must be [S, XS, M, X, L, XXL, XL]" });
            }
        }
    }

    if (installments) {
        if (!validInstallment(installments)) {
            return res.status(400).send({ status: false, msg: "instalment can not be a decimal number" })
        }
    }

    if (isFreeShipping) {
        if (!(Shipping(isFreeShipping))) {
            return res.status(400).send({ status: false, msg: "isFreeShipping must be  true or false." })
        }
    }if (files && files.length > 0) {
        var productImage = await awsConfig.uploadFile(files[0])   //upload to s3 and get the uploaded link
    }
    else {
        return res.status(400).send({ status: false, msg: 'please upload product image' })
    }
    let currencyFormat = "Rupees"

    const product = {
        title, description, currencyFormat: currencyFormat, price, currencyId, isFreeShipping,
        productImage, style, availableSizes, installments
    }

    let productData = await ProductModel.create(product) // //If all these validations passed , creating a product
    return res.status(201).send({ status: true, message: "New Product created successfully", data: productData })

    }catch(err){
        return res.status(400).send({status:false,message:err.message})
    }
}






const getProduct =async (req,res)=>{
    try{

let filter = req.query
        let Name = filter.name
        let size = filter.size
        let priceGreaterThan = filter.priceGreaterThan
        let priceLessThan = filter.priceLessThan


       
        if (Name) {
            if (!isValidValue(Name))

                return res.status(400).send({ msg: "please give valid input" })
            const product = await ProductModel.find({ title: Name, isDeleted: false })
            if (product.length == 0) return res.status(404).send({ msg: "product not found" })

            return res.status(200).send({ msg: "All products", data: product })

        }
        if (size) {
            if (!isValidValue(size))
                return res.status(400).send({ msg: "please give valid input" })

            const product = await ProductModel.find({ availableSizes: size, isDeleted: false })
            if (product.length == 0) return res.status(404).send({ msg: "product not found" })

            return res.status(200).send({ msg: "All products", data: product })

        }
        if (priceGreaterThan && priceLessThan) {
            if (!isValidValue(priceGreaterThan))

                return res.status(400).send({ msg: "please give valid input" })
            if (!isValidValue(priceLessThan))

                return res.status(400).send({ msg: "please give valid input" })

            const product = await ProductModel.find({ price: { $gt: priceGreaterThan, $lt: priceLessThan }, isDeleted: false }).sort({ price: 1 })

            if (product.length == 0) return res.status(404).send({ msg: "product not found" })
            return res.status(200).send({ msg: "All products", data: product })

        } if (priceLessThan) {
            if (!isValidValue(priceLessThan))

                return res.status(400).send({ msg: "please give valid input" })

            const product = await ProductModel.find({ price: { $lt: priceLessThan }, isDeleted: false }).sort({ price: -1 })
            if (product.length == 0) return res.status(404).send({ msg: "product not found" })

            return res.status(200).send({ msg: "All products", data: product })

        } if (priceGreaterThan) {
            if (!isValidValue(priceGreaterThan))

                return res.status(400).send({ msg: "please give valid input" })

            const product = await ProductModel.find({ price: { $gt: priceGreaterThan }, isDeleted: false }).sort({ price: 1 })
            if (product.length == 0) return res.status(404).send({ msg: "product not found" })

            return res.status(200).send({ msg: "All products", data: product })

        }
    }

    catch (err) {
        console.log(err)
        res.status(500).send({ message: err.message })
    }


}

const getProductById = async(req,res) => {  
    try {

        const productId = req.params.productId;
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please provide valid productId" })

        const productDetails = await ProductModel.findOne({ _id: productId, isDeleted: false })

        if (!productDetails) return res.status(404).send({ status: false, message: "No such product exists" })

        return res.status(200).send({ status: true, message: 'Success', data: productDetails })

    } catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }
}


const updateProductById = async function (req, res) {
    try {
        let data = req.body
        let productId = req.params.productId
        let { title, description, availableSizes, isFreeShipping, price, style, installments } = data

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid productID" })
        }
        let ProductId = await ProductModel.findById(productId)
        if (!ProductId) {
            return res.status(400).send({ status: false, message: "No product found" })
        }
        if (!isValidDetails(data)) {
            return res.status(400).send({ status: false, msg: "Please enter data to update" });
        }

        if (title == "") {
            return res.status(400).send({ status: false, message: "Please provide title" })

        }
        else if (title) {
            if (!isValidValue(title)) return res.status(400).send({ status: false, message: "Please provide title" })

        }

        if (description == "") {
            return res.status(400).send({ status: false, message: "Please provide description" })

        }
        else if (description) {
            if (!isValidValue(description)) return res.status(400).send({ status: false, message: "Please provide description" })

        }

        if (availableSizes == "") {
            return res.status(400).send({ status: false, message: "Please provide size to update" })

        }
        else if (availableSizes) {
            if (!isValidValue(availableSizes)) return res.status(400).send({ status: false, message: "Please provide size to update" })

        }

        if (isFreeShipping == "") {
            return res.status(400).send({ status: false, message: "Please provide shipping filter" })

        }
        else if (isFreeShipping) {
            if (!isValidValue(isFreeShipping)) return res.status(400).send({ status: false, message: "Please provide shipping filter" })

        }

        if (price == "") {
            return res.status(400).send({ status: false, message: "Please provide price" })

        }
        else if (price) {
            if (!isValidValue(price)) return res.status(400).send({ status: false, message: "Please provide price" })

        }

        if (style == "") {
            return res.status(400).send({ status: false, message: "Please provide style" })

        }
        else if (style) {
            if (!isValidValue(style)) return res.status(400).send({ status: false, message: "Please provide style" })

        }


        if (installments == "") {
            return res.status(400).send({ status: false, message: "Please provide installment to update" })

        }
        else if (installments) {
            if (!isValidValue(installments)) return res.status(400).send({ status: false, message: "Please provide installment to update" })

        }

        let files = req.files

        if (files && files.length > 0) {
            var updateImage = await awsConfig.uploadFile(files[0])

        }

        const updatedData = await ProductModel.findOneAndUpdate({ _id: productId, isDeleted: false },
            { title: title, description: description, availableSizes: availableSizes, isFreeShipping: isFreeShipping, price: price, style: style, productImage: updateImage, installments: installments }, { new: true })
        res.send({ Data: updatedData })
    }

    catch (err) {
        console.log(err)
        res.status(500).send({ message: err.message })
    }

}

const DeleteProductById = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId in params." })
        }

        const product = await ProductModel.findOne({ _id: productId, isDeleted: false })

        if (!product) {
            return res.status(404).send({ status: false, message: `product not found` })
        }
        await ProductModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: 'Successfully deleted' })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports={createProduct,getProduct,getProductById,updateProductById,DeleteProductById}