/********************* Import the required Packages *********************/
import EXPRESS from "express";

/********************* Create a router object using Express *********************/
const ROUTER = EXPRESS.Router();

/********************* Import The Controllers *********************/
import { TestGetRequest, TestGetRequest2, TestGetRequest3 } from "../Controllers/TestControllers.js";

/********************* Declare The Routes And Bind With The Controller Methods *********************/
ROUTER.get("/testGetRequest", TestGetRequest);
ROUTER.get("/testGetRequest2", TestGetRequest2);
ROUTER.get("/testGetRequest3", TestGetRequest3);

/********************* Export The Router *********************/
export default ROUTER;
