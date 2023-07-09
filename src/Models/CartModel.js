{ 
    title: {string, mandatory, unique},
    description: {string, mandatory},
    price: {number, mandatory, valid number/decimal},
    currencyId: {string, mandatory, INR},
    currencyFormat: {string, mandatory, Rupee symbol},
    isFreeShipping: {boolean, default: false},
    productImage: {string, mandatory},  // s3 link
    style: {string},
    availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]},
    installments: {number},
    deletedAt: {Date, when the document is deleted}, 
    isDeleted: {boolean, default: false},
    createdAt: {timestamp},
    updatedAt: {timestamp},
  }

  const mongoose=require('mongoose');

  const userSchema= new mongoose.Schema({

    title:{
      type: String,
      required: true,
      undefined: true
    },
    description: {type:String, required:true},
    price: {type:Number, required:true},
    currencyId: {type:String, mandatory, INR},
    currencyFormat: { type:String, mandatory, Rupee symbol},
    isFreeShipping: {boolean, default: false},
    productImage: {string, mandatory},  // s3 link
    style: {string},
    availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]},
    installments: {number},
    deletedAt: {Date, when the document is deleted}, 
    isDeleted: {boolean, default: false},
  })