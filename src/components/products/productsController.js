      import { ProductsServices } from "./productsServices.js";
      import mongoose from "mongoose";

      export class ProductsController {
        constructor() {
          this.productsServices = new ProductsServices();
        }
        isValidProduct = (id) => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return this.productsServices.isValidProduct(id);
          } else {
            return false;
          }
        };
        getAllProducts = (req) => {
          return this.productsServices.getAllProducts(req);
        };
        addProduct = (req) => {
          return this.productsServices.addProduct(req);
        };
        getProductWhitId = (id) => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return this.productsServices.getProductsWithId(id);
          }
          return {
            status: 400,
            response: "Formato de id no valido",
          };
        };
        updateProducts = (req) => {
          let idActualizar = req.params.pid;
          if (mongoose.Types.ObjectId.isValid(idActualizar)) {
            let nuevaInformacion = req.body;

            if (nuevaInformacion.stock == 0) {
              nuevaInformacion = { stock: 0, status: false };
            }
            return this.productsServices.updateProducts(
              idActualizar,
              nuevaInformacion
            );
          } else {
            return {
              status: 400,
              response: "Coloca un id valido",
            };
          }
        };

        deleteProducts = async (req) => {
          let idEliminar = req.params.pid;
          if (mongoose.Types.ObjectId.isValid(idEliminar)) {
            if (req.role == "admin") {
              return await this.productsServices.deleteProducts(idEliminar);
            }
            let producto = await this.productsServices.getProductsWithId(idEliminar);
            if (producto.response[0].owner == req.owner) {
              return await this.productsServices.deleteProducts(idEliminar);
            } else {
              return {
                status: 400,
                response: "No puedes eliminar un producto que no es tuyo",
              };
            }
          } else {
            return {
              status: 400,
              response: "Coloca un id valido",
            };
          }
        };
        getProductWithOwner = async (owner) => {
          return this.productsServices.getProductWithOwner(owner);
        };
      }
