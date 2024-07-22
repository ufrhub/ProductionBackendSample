/********************* Import the required Packages *********************/
import EXPRESS from "express";

/********************* Create a router object using Express *********************/
const ROUTER = EXPRESS.Router();

/********************* Import The Controllers *********************/
import { TestGetRequest } from "../Controllers/TestControllers.js";

/********************* Declare The Routes And Bind With The Controller Methods *********************/
ROUTER.get("/testGetRequest", TestGetRequest);

/********************* Export The Router *********************/
export default ROUTER;
