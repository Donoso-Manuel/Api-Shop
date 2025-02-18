const fs = require("fs");
const path = require("path");
const productModel = require("../models/productModel");
const pool = require("../config/db");

const getProducts = async (req, res) => {
  try {

    await pool.query("SELECT NOW()");

    const products = await productModel.getProductsDB();


    if (!products || products.length === 0) {
      console.log("No se encontraron productos");
      return res.status(200).json([]);
    }

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error completo en getProducts:", error);
    console.error("Stack trace:", error.stack);

    return res.status(500).json({
      message: "Error al obtener los productos",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image, category } = req.body;

    await productModel.createProductDB(
      name,
      description,
      price,
      stock,
      image,
      category
    );

    res.status(201).json({ message: "Producto creado con éxito", image });
  } catch (error) {
    console.error("Error en createProduct:", error);
    console.error("Mensaje de Error:", error.message);
    res.status(500).json({
      message: "Error al crear el producto",
      error: error.message,
    });
  }
};

const getProductId = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.getProductIdDB(id);

    if (!product) {
      return res.status(404).json({ message: "producto no encontrado" });
    }

    res.status(200).send(product);
  } catch (error) {
    console.error("Error en getProductId:", error);
    console.error("Mensaje de Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al cargar el producto", error: error.message });
  }
};

const updateProductID = async (req, res) => {
  try {
    const { name, description, price, stock, currentImage, category } =
      req.body;
    const { id } = req.params;

    let imageToSave;
    if (req.file) {
      imageToSave = req.file.path;
    } else if (currentImage) {
      imageToSave = currentImage;
    } else {
      return res.status(400).json({
        message: "Se requiere una imagen (nueva o existente)",
      });
    }

    const updatedProduct = await productModel.updateProductIDDB(
      id,
      name,
      description,
      price,
      stock,
      imageToSave,
      category
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "No se pudo actualizar el producto",
      });
    }

    res.status(200).json({
      message: "Producto Actualizado",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error en updateProductID:", error);
    console.error("Mensaje de Error:", error.message);
    res.status(500).json({
      message: "Error al actualizar el producto",
      error: error.message,
    });
  }
};

const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const { id } = req.params;

    await productModel.updateStockDB(id, stock);

    res.status(200).json("Stock Actualizado Actualizado");
  } catch (error) {
    console.error("Error en updateStock:", error);
    console.error("Mensaje de Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al actualizar el stock", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await productModel.deleteProductDB(id);

    res.status(200).json({
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error en deleteProduct:", error);
    res.status(500).json({
      message: "Error al eliminar el producto",
      error: error.message,
    });
  }
};
const recommendedProducts = async(req, res)=>{
  try{
    const products = await productModel.recommendedProductsDB();
    res.status(200).send(products)
  }catch(error){
    res
      .status(500)
      .json({ message: "Error al cargar los productos", error: error.message });
  }
}

module.exports = {
  getProducts,
  createProduct,
  getProductId,
  updateProductID,
  updateStock,
  deleteProduct,
  recommendedProducts,
};
