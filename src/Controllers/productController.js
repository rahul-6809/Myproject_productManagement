
const {isValidValue,Shipping,validInstallment,isValidDetails}=require('../utils/validator')
const createProduct=async (req,res) => {
    try{
    const file=req.file
    const data=req.body
    if(!isValidDetails(data)){
        return res.status(400).send({status:false,message:"Please enter your details to Create Product"})
    }
    const {title,description,price,currencyId,currencyformat,isFreeShiping,style,availableSizs,installments}=req.body
    if (!isValidValue(title)) {
        return res.status(400).send({ status: false, message: "Please provide select title" })
    }
    const titleUsed = await productModel.findOne({ title })
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

    let productData = await productModel.create(product) // //If all these validations passed , creating a product
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
            const product = await productModel.find({ title: Name, isDeleted: false })
            if (product.length == 0) return res.status(404).send({ msg: "product not found" })

            return res.status(200).send({ msg: "All products", data: product })

        }
        if (size) {
            if (!isValidValue(size))
                return res.status(400).send({ msg: "please give valid input" })

            const product = await productModel.find({ availableSizes: size, isDeleted: false })
            if (product.length == 0) return res.status(404).send({ msg: "product not found" })

            return res.status(200).send({ msg: "All products", data: product })

        }
        if (priceGreaterThan && priceLessThan) {
            if (!isValidValue(priceGreaterThan))

                return res.status(400).send({ msg: "please give valid input" })
            if (!isValidValue(priceLessThan))

                return res.status(400).send({ msg: "please give valid input" })

            const product = await productModel.find({ price: { $gt: priceGreaterThan, $lt: priceLessThan }, isDeleted: false }).sort({ price: 1 })

            if (product.length == 0) return res.status(404).send({ msg: "product not found" })
            return res.status(200).send({ msg: "All products", data: product })

        } if (priceLessThan) {
            if (!isValidValue(priceLessThan))

                return res.status(400).send({ msg: "please give valid input" })

            const product = await productModel.find({ price: { $lt: priceLessThan }, isDeleted: false }).sort({ price: -1 })
            if (product.length == 0) return res.status(404).send({ msg: "product not found" })

            return res.status(200).send({ msg: "All products", data: product })

        } if (priceGreaterThan) {
            if (!isValidValue(priceGreaterThan))

                return res.status(400).send({ msg: "please give valid input" })

            const product = await productModel.find({ price: { $gt: priceGreaterThan }, isDeleted: false }).sort({ price: 1 })
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
        if (!(validator.isValidObjectId(productId))) return res.status(400).send({ status: false, message: "Please provide valid productId" })

        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productDetails) return res.status(404).send({ status: false, message: "No such product exists" })

        return res.status(200).send({ status: true, message: 'Success', data: productDetails })

    } catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }
}



const deleteProductById = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId in params." })
        }

        const product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) {
            return res.status(404).send({ status: false, message: `product not found` })
        }
        await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: 'Successfully deleted' })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports={createProduct,getProduct,getProductById,deleteProductById}