      import { Router } from "express";
      import { authToken } from "../../middlewares/authMiddlewares.js";
      import dotenv from "dotenv";
      import upload from "../../middlewares/fileMiddleware.js";
      import { UserController } from "../sessions/userController.js";
      dotenv.config();

      const router = Router();
      let userController = new UserController();

      router.put("/premium/:uid", authToken, async (req, res) => {
        let { uid } = req.params;
        if (req.user._id == uid) {
          const user = await userController.searchUserById(uid);
          const requiredDocs = [
            "Identificación",
            "Comprobante de domicilio",
            "Comprobante de estado de cuenta",
          ];

          const hasRequiredDocs = requiredDocs.every((docName) =>
            user.documents.some((doc) => doc.name === docName)
          );

          if (hasRequiredDocs) {
            let email = process.env.ADMIN_PRODUCTS_AND_VERIFICATION_NAME;
            let password = process.env.ADMIN_PRODUCTS_AND_VERIFICATION_PASSWORD;
            let adminUser = await fetch(
              `${process.env.DOMAIN_NAME}/api/sessions/login`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email,
                  password,
                }),
              }
            ).then((res) => res.json());
            await fetch(`${process.env.DOMAIN_NAME}/api/sessions/premium`, {
              method: "PUT",
              headers: {
                token: adminUser.response.token,
                updateUser: uid,
              },
            })
              .then((res) => res.json())
              .then((response) => res.status(response.status).send(response));
          } else {
            return res.status(400).send({
              status: 400,
              response:
                "No puedes actualizar a premium sin cargar los documentos requeridos: Identificación, Comprobante de domicilio y Comprobante de estado de cuenta.",
            });
          }
        } else {
          return res.status(400).send({
            status: 400,
            response:
              "El uid enviado no coincide con tu token, porfavor coloca correctamente los datos",
          });
        }
      });

      router.post(
        "/:uid/documents",
        authToken,
        upload.fields([
          { name: "identificacion", maxCount: 1 },
          { name: "comprobante_domicilio", maxCount: 1 },
          { name: "estado_cuenta", maxCount: 1 },
          { name: "profile_image", maxCount: 1 },
        ]),
        async (req, res) => {
          const { uid } = req.params;
          if (req.user._id == uid) {
            const documents = [];

            if (req.files.identificacion) {
              documents.push({
                name: "Identificación",
                reference: req.files.identificacion[0].path,
              });
            }

            if (req.files.comprobante_domicilio) {
              documents.push({
                name: "Comprobante de domicilio",
                reference: req.files.comprobante_domicilio[0].path,
              });
            }

            if (req.files.estado_cuenta) {
              documents.push({
                name: "Comprobante de estado de cuenta",
                reference: req.files.estado_cuenta[0].path,
              });
            }
            if (req.files.profile_image) {
              documents.push({
                name: "Profile image",
                reference: `${process.env.DOMAIN_NAME}/profileImages/${req.files.profile_image[0].filename}`,
              });
            }

            await userController.addDocument(uid, documents);
            res
              .status(200)
              .send({ status: 200, response: "Archivo subido correctamente" });
          } else {
            res.status(400).send({
              status: 400,
              response: "No tienes permiso para actualizar este usuario.",
            });
          }
        }
      );

      export default router;
