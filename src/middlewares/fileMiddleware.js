
      import multer from "multer";
      import path, { extname } from "path";
      import fs from "fs";
      import _dirname from "../utils.js";

      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          let folder = "";
          const userId = req.user._id.toString(); 

          switch (file.fieldname) {
            case "profile_image":
              folder = path.join(_dirname, "..", "uploads", "profiles");
              break;
            case "product_image":
              folder = path.join(
                _dirname,
                "..",
                "uploads",
                "users",
                userId,
                "productImages"
              );
              break;
            case "identificacion":
              folder = path.join(
                _dirname,
                "..",
                "uploads",
                "users",
                userId,
                "identificacion"
              );
              break;
            case "comprobante_domicilio":
              folder = path.join(
                _dirname,
                "..",
                "uploads",
                "users",
                userId,
                "comprobante_domicilio"
              );
              break;
            case "estado_cuenta":
              folder = path.join(
                _dirname,
                "..",
                "uploads",
                "users",
                userId,
                "estado_cuenta"
              );
              break;
            default:
              folder = path.join(_dirname, "..", "uploads", "documents");
          }

    
          fs.mkdirSync(folder, { recursive: true });

          const MIMETYPES = ["image/png", "image/webp", "image/jpeg", "image/png"];

    
          try {
            const files = fs.readdirSync(folder);
            for (const fileToDelete of files) {
              fs.unlinkSync(path.join(folder, fileToDelete));
            }
          } catch (err) {
            console.error(err);
          }
          if (MIMETYPES.includes(file.mimetype)) {
            cb(null, folder);
          } else {
            cb(new Error(`Only ${MIMETYPES.join(", ")} mimetypes are allowed`));
          }
        },
        filename: (req, file, cb) => {
          const fileExtension = ".jpg";
          let fileName;
          if (file.fieldname === "profile_image") {
      
            fileName = `profileImage-${req.user._id}`;
          } else {
      
            fileName = file.originalname.split(fileExtension)[0];
            fileName = `${fileName}-${Date.now()}`;
          }

          cb(null, `${fileName}${fileExtension}`);
        },
      });

      const upload = multer({ storage: storage });

      export default upload;
