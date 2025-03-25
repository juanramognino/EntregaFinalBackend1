
import express from "express";
import mongoose from "mongoose";
import { passportCall } from "../../middlewares/authMiddlewares.js";
import { verificarAdmin } from "../../scripts/verificarAdmin.js";
import CartModel from "../../dao/models/cart.model.js";
import ProductModel from "../../dao/models/product.model.js";

const router = express.Router();
import dotenv from "dotenv";
dotenv.config();

router.get("/:cid", passportCall("jwt"), async (req, res) => {
  let adminSession = verificarAdmin(req);
  let { activateSession, admin } = adminSession;
  let id = req.params.cid;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    let error = "Id del carrito no válido";
    return res.render("products/detalles", {
      admin,
      activateSession,
      error,
      style: "detalles.css",
    });
  }

  let carrito = await CartModel.findById(id).populate("products.product").lean();
  if (!carrito) {
    let error = "Carrito no encontrado";
    return res.render("products/detalles", {
      admin,
      activateSession,
      error,
      style: "detalles.css",
    });
  }

  res.render("carts/detalles", {
    admin,
    activateSession,
    carrito,
    style: "detalles.css",
  });
});

router.delete("/api/carts/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
    return res.status(400).json({ status: "error", message: "ID inválido" });
  }
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

  cart.products = cart.products.filter(p => p.product.toString() !== pid);
  await cart.save();

  res.json({ status: "success", message: "Producto eliminado del carrito" });
});

router.put("/api/carts/:cid", async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ status: "error", message: "Formato de productos inválido" });
  }

  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

  cart.products = products.map(p => ({
    product: p.product,
    quantity: p.quantity,
  }));

  await cart.save();
  res.json({ status: "success", message: "Carrito actualizado" });
});

router.put("/api/carts/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  if (typeof quantity !== "number" || quantity <= 0) {
    return res.status(400).json({ status: "error", message: "Cantidad inválida" });
  }

  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

  const productInCart = cart.products.find(p => p.product.toString() === pid);
  if (!productInCart) {
    return res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });
  }

  productInCart.quantity = quantity;
  await cart.save();

  res.json({ status: "success", message: "Cantidad actualizada" });
});

router.delete("/api/carts/:cid", async (req, res) => {
  const { cid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

  cart.products = [];
  await cart.save();

  res.json({ status: "success", message: "Carrito vaciado" });
});

export default router;
