      import multer from "multer";
      import path from "path";
      import fs from "fs";
      import _dirname from "../utils.js";

      const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          const dir = path.join(_dirname, "../uploads/productImages"); 
          fs.mkdirSync(dir, { recursive: true }); 
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          cb(
            null,
            new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
          );
        },
      });

      export const uploadProductImage = multer({ storage: storage });
