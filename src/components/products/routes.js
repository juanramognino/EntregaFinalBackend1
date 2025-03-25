      import { Router } from "express";
      import { ProductsController } from "./productsController.js";
      import { uploadProductImage } from "../../middlewares/productUploadImage.js";
      import { authToken, authorization } from "../../middlewares/authMiddlewares.js";

      const router = Router();

      let Controller = new ProductsController();



      router.get("/", async (req, res, next) => {
        try {
          let productos = await Controller.getAllProducts(req);

          if (productos.status == 200) {
            return res.status(200).json(productos.response);
          } else {
            return res.status(400).json(productos.response);
          }
        } catch (error) {
          next(error);
        }
      });


      router.post(
        "/",
        authorization("admin", "premium"),
        uploadProductImage.single("thumbnail"), 
        async (req, res, next) => {
          try {
            let result = await Controller.addProduct(req);
            if (result.status == 200) {
              return res.status(200).send(result);
            } else {
              return res.status(400).send(result.response);
            }
          } catch (error) {
            next(error);
          }
        }
      );


      router.get("/:pid", async (req, res, next) => {
        try {
          let result = await Controller.getProductWhitId(req.params.pid);
          if (result.status == 200) {
            return res.status(200).send(result.response);
          } else {
            return res.status(400).send(result.response);
          }
        } catch (error) {
          next(error);
        }
      });

      router.get("/getAllProduct/owner", authToken, async (req, res, next) => {
        try {
          let result = await Controller.getProductWithOwner(req.user.email);

          if (result.status == 200) {
            return res.status(200).json(result);
          } else {
            return res.status(400).json(result);
          }
        } catch (error) {
          console.log(error)
          next(error);
        }
      });


      router.put(
        "/:pid",
        authorization("admin", "premium"),
        async (req, res, next) => {
          try {
            let result = await Controller.updateProducts(req);
            if (result.status == 200) {
              return res.status(200).send({
                status: result.status,
                response: result.response,
              });
            } else {
              return res.status(400).send(result.response);
            }
          } catch (error) {
            next(error);
          }
        }
      );


      router.delete(
        "/:pid",
        authorization("admin", "premium"),
        async (req, res, next) => {
          try {
            let result = await Controller.deleteProducts(req);
            if (result.status == 200) {
              return res.status(200).send(result.response);
            } else {
              return res.status(400).send(result.response);
            }
          } catch (error) {
            next(error);
          }
        }
      );

      export default router;
