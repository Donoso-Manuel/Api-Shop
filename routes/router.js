const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const purchController = require("../controllers/purchController");
const cartController = require("../controllers/cartController");
const productController = require("../controllers/productController");
const {
  resetPassword,
  requestResetPassword,
} = require("../controllers/resetPasswordController");
const { validateProduct } = require("../middlewares/validateNewProduct");
const formatURL = require("../middlewares/formatURL");
const { verifyToken } = require("../middlewares/authMiddleware");
const verifyAdmin = require("../middlewares/verifyAdmin");

//Rutas de Usuario
router.post("/login", userController.loginUser);
router.post("/users", userController.createUser);
router.post("/create-admin-password", userController.createAdminPassword);
router.post("/logout", userController.logout);
router.get("/auth/verify", verifyToken, userController.verifyAuth);
router.get("/users/profile", userController.getMyUser);
router.put("/users/updateProfile", userController.updateMyUser);
router.get("/profile", userController.verifyAuth);
router.get("/users", verifyAdmin, userController.getUsers);
router.post("/reset-password", requestResetPassword);
router.post("/user_likes", userController.userLike);
router.delete("/user_likes", userController.userDisLike);
router.get("/users/productsLiked", userController.getLikeProducts);
router.get("/users/liked-products", userController.getLikeProductsFront);
router.get("/users/:id/liked-products", userController.getLikeProductsID);
router.patch("/userState/:id", verifyAdmin, userController.updateStatus);
router.post("/reset-password/:token", resetPassword);
router.get("/users/:id", userController.getUserById);

//Rutas de Carrito

router.get("/carrito", cartController.getCart); // listo
router.post("/carrito-saved", cartController.postCart); // listo
router.delete("/carrito-item", cartController.deleteItemCart); // listo

// Rutas de productos

router.get("/products", productController.getProducts);
router.post(
  "/products",
  verifyAdmin,
  formatURL,
  validateProduct,
  productController.createProduct
);
router.get(
  "/products/recommended-products",
  productController.recommendedProducts
);
router.get("/products/:id", productController.getProductId);
router.put(
  "/products/:id",
  verifyAdmin,
  formatURL,
  validateProduct,
  productController.updateProductID
);
router.patch("/products/:id", verifyAdmin, productController.updateStock);
router.delete("/products/:id", verifyAdmin, productController.deleteProduct);

// Rutas de Compras

router.post("/confirmar-compra", purchController.confirmPurch); // listo
router.get("/historial-compras", purchController.historyPurch); // listo

module.exports = router;
