      export default class CustomError {
        static createError({ status = 500, response }) {
          const err = new Error("Error");
    
          err.status = status;
          err.response = response;
          throw err;
        }
      }
